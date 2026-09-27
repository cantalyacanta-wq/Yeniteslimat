package com.antalyakurye.talep;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class CourierForegroundService extends Service {
    public static final String ACTION_START = "com.antalyakurye.talep.START_FOREGROUND";
    public static final String ACTION_STOP = "com.antalyakurye.talep.STOP_FOREGROUND";
    public static final String EXTRA_TITLE = "EXTRA_TITLE";
    public static final String EXTRA_TEXT = "EXTRA_TEXT";
    private static final int FOREGROUND_NOTIFICATION_ID = 9001;
    private static final String CHANNEL_ID = "antalya_kurye_talep";
    private PowerManager.WakeLock wakeLock = null;
    private WifiManager.WifiLock wifiLock = null;
    private ScheduledExecutorService heartbeatExecutor = null;

    @Override
    public void onCreate() {
        super.onCreate();
        createChannelIfNeeded();
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AntalyaKurye:ForegroundLock");
                wakeLock.acquire(24 * 60 * 60 * 1000L); // 24 saat kesintisiz uyanik kal
            }
        } catch (Throwable ignored) {}

        try {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "AntalyaKurye:WifiLock");
                wifiLock.acquire();
            }
        } catch (Throwable ignored) {}

        // Arka plandayken WebView JavaScript motorunu ve agini her 3 saniyede bir canli tutan nabiz
        try {
            heartbeatExecutor = Executors.newSingleThreadScheduledExecutor();
            heartbeatExecutor.scheduleWithFixedDelay(new Runnable() {
                @Override
                public void run() {
                    try {
                        MainActivity.sendKeepAlivePulse();
                    } catch (Throwable ignored) {}
                }
            }, 2, 3, TimeUnit.SECONDS);
        } catch (Throwable ignored) {}
    }

    private void createChannelIfNeeded() {
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    Class<?> channelClass = Class.forName("android.app.NotificationChannel");
                    java.lang.reflect.Constructor<?> constructor = channelClass.getConstructor(String.class, CharSequence.class, int.class);
                    Object channel = constructor.newInstance(CHANNEL_ID, "Antalya Kurye Servisi", 2 /* IMPORTANCE_LOW */);
                    java.lang.reflect.Method createMethod = nm.getClass().getMethod("createNotificationChannel", channelClass);
                    createMethod.invoke(nm, channel);
                }
            } catch (Throwable ignored) {}
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            try {
                stopForeground(true);
            } catch (Throwable ignored) {}
            stopSelf();
            return START_NOT_STICKY;
        }

        try {
            createChannelIfNeeded();

            String title = "🛵 Antalya Kurye Aktif";
            String text = "Paket talep havuzu 7/24 dinleniyor • Arka planda kesintisiz";
            if (intent != null) {
                String customTitle = intent.getStringExtra(EXTRA_TITLE);
                String customText = intent.getStringExtra(EXTRA_TEXT);
                if (customTitle != null && !customTitle.isEmpty()) title = customTitle;
                if (customText != null && !customText.isEmpty()) text = customText;
            }

            Intent appIntent = new Intent(this, MainActivity.class);
            appIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            
            // Android 12+ (API 31+) icin FLAG_IMMUTABLE (0x04000000) zorunludur
            int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) {
                pendingFlags |= 0x04000000;
            }
            PendingIntent pi = PendingIntent.getActivity(this, 0, appIntent, pendingFlags);

            Notification.Builder builder = new Notification.Builder(this);
            if (Build.VERSION.SDK_INT >= 26) {
                try {
                    java.lang.reflect.Method setChannelMethod = builder.getClass().getMethod("setChannelId", String.class);
                    setChannelMethod.invoke(builder, CHANNEL_ID);
                } catch (Throwable ignored) {}
            }

            builder.setContentTitle(title)
                   .setContentText(text)
                   .setSmallIcon(R.mipmap.ic_launcher)
                   .setContentIntent(pi)
                   .setOngoing(true)
                   .setPriority(Notification.PRIORITY_LOW);

            if (Build.VERSION.SDK_INT >= 21) {
                builder.setVisibility(Notification.VISIBILITY_PUBLIC);
            }

            startForeground(FOREGROUND_NOTIFICATION_ID, builder.build());
        } catch (Throwable t) {
            t.printStackTrace();
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        try {
            if (heartbeatExecutor != null) {
                heartbeatExecutor.shutdownNow();
            }
        } catch (Throwable ignored) {}
        try {
            if (wifiLock != null && wifiLock.isHeld()) {
                wifiLock.release();
            }
        } catch (Throwable ignored) {}
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Throwable ignored) {}
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

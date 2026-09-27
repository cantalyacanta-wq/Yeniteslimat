package com.antalyakurye.talep;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

public class CourierForegroundService extends Service {
    public static final String ACTION_START = "com.antalyakurye.talep.START_FOREGROUND";
    public static final String ACTION_STOP = "com.antalyakurye.talep.STOP_FOREGROUND";
    public static final String EXTRA_TITLE = "EXTRA_TITLE";
    public static final String EXTRA_TEXT = "EXTRA_TEXT";
    private static final int FOREGROUND_NOTIFICATION_ID = 9001;
    private static final String CHANNEL_ID = "antalya_kurye_talep";
    private PowerManager.WakeLock wakeLock = null;

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AntalyaKurye:ForegroundServiceLock");
                wakeLock.acquire();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            try {
                stopForeground(true);
            } catch (Exception ignored) {}
            stopSelf();
            return START_NOT_STICKY;
        }

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
        PendingIntent pi = PendingIntent.getActivity(this, 0, appIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        Notification.Builder builder = new Notification.Builder(this);
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                java.lang.reflect.Method setChannelMethod = builder.getClass().getMethod("setChannelId", String.class);
                setChannelMethod.invoke(builder, CHANNEL_ID);
            } catch (Exception ignored) {}
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

        try {
            startForeground(FOREGROUND_NOTIFICATION_ID, builder.build());
        } catch (Exception ignored) {}

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

package com.antalyakurye.talep;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.os.Vibrator;
import android.provider.Settings;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String PRIMARY_URL = "https://www.antalyateslimat.com/#pakettalebi";
    private static final String FALLBACK_URL = "https://antalyateslimat.com/#pakettalebi";
    private static final String CHANNEL_ID = "antalya_kurye_talep";
    private boolean triedFallback = false;
    private PowerManager.WakeLock wakeLock = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // Kurye gorevdeyken ekranin kapanmasini onle
        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } catch (Exception ignored) {}

        // Bildirim kanalini Android 8.0+ icin olustur (Yuksek oncelik, sesli, titresimli)
        createNotificationChannel();

        // 1. Android Calisma Zamani Izinlerini Aninda Iste (Bildirim, Konum vb.)
        checkAndRequestAllPermissions();

        // 2. Arka Planda Uykuya Girmemesi Icin Pil Optimizasyon Muafiyeti Iste
        requestBatteryOptimizationExemption();

        // 3. Arka Plan Uyanik Kalma Kilidi (WakeLock) Al
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AntalyaKurye:KeepAlive");
                wakeLock.acquire(24 * 60 * 60 * 1000L); // 24 saat boyunca uyanik tut
            }
        } catch (Exception ignored) {}

        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " AntalyaKuryeApp/1.4.0 (TalepHavuzu; NativeBridge)");

        // Web uygulamasinin native Android fonksiyonlarini cagirabilmesi icin Javascript koprusu
        webView.addJavascriptInterface(new WebAppInterface(), "AndroidApp");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (!triedFallback) {
                    triedFallback = true;
                    view.loadUrl(FALLBACK_URL);
                    return;
                }
                String errHtml = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
                    + "<style>body{margin:0;background:#021814;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;box-sizing:border-box;}"
                    + ".box{background:#03241d;border:1px solid #059669;border-radius:24px;padding:32px 20px;max-width:340px;width:100%;}"
                    + "h2{color:#34d399;font-size:20px;margin:0 0 10px;}"
                    + "p{color:#94a3b8;font-size:13px;line-height:1.5;margin:0 0 20px;}"
                    + "button{background:linear-gradient(135deg,#dc2626,#f59e0b);color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:bold;cursor:pointer;width:100%;}"
                    + "</style></head><body><div class='box'>"
                    + "<h2>Antalya Kurye</h2>"
                    + "<p>Bağlantı sağlanamadı. Lütfen internetinizi kontrol edin.</p>"
                    + "<button onclick='location.href=\"" + PRIMARY_URL + "\"'>Yeniden Dene</button>"
                    + "</div></body></html>";
                view.loadDataWithBaseURL(null, errHtml, "text/html", "UTF-8", null);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            request.grant(request.getResources());
                        } catch (Exception ignored) {}
                    }
                });
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, true);
            }
        });

        webView.loadUrl(PRIMARY_URL);
    }

    private void checkAndRequestAllPermissions() {
        if (Build.VERSION.SDK_INT >= 23) {
            try {
                List<String> needed = new ArrayList<String>();
                if (Build.VERSION.SDK_INT >= 33) {
                    if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                        needed.add("android.permission.POST_NOTIFICATIONS");
                    }
                }
                if (checkSelfPermission("android.permission.ACCESS_FINE_LOCATION") != PackageManager.PERMISSION_GRANTED) {
                    needed.add("android.permission.ACCESS_FINE_LOCATION");
                }
                if (checkSelfPermission("android.permission.ACCESS_COARSE_LOCATION") != PackageManager.PERMISSION_GRANTED) {
                    needed.add("android.permission.ACCESS_COARSE_LOCATION");
                }
                if (!needed.isEmpty()) {
                    requestPermissions(needed.toArray(new String[needed.size()]), 1001);
                }
            } catch (Exception ignored) {}
        }
    }

    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= 23) {
            try {
                PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
                String packageName = getPackageName();
                if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + packageName));
                    startActivity(intent);
                }
            } catch (Exception e) {
                try {
                    Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    startActivity(intent);
                } catch (Exception ignored) {}
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (nm == null) return;
                Class<?> channelClass = Class.forName("android.app.NotificationChannel");
                java.lang.reflect.Constructor<?> constructor = channelClass.getConstructor(String.class, CharSequence.class, int.class);
                Object channel = constructor.newInstance(CHANNEL_ID, "Antalya Kurye Acil Bildirimler", 4 /* IMPORTANCE_HIGH */);

                java.lang.reflect.Method setDescMethod = channelClass.getMethod("setDescription", String.class);
                setDescMethod.invoke(channel, "Yeni düşen acil paket talepleri ve kurye çağrıları");

                java.lang.reflect.Method enableVibMethod = channelClass.getMethod("enableVibration", boolean.class);
                enableVibMethod.invoke(channel, true);

                java.lang.reflect.Method setVibPatMethod = channelClass.getMethod("setVibrationPattern", long[].class);
                setVibPatMethod.invoke(channel, new long[]{0, 350, 150, 350, 150, 600});

                java.lang.reflect.Method createMethod = nm.getClass().getMethod("createNotificationChannel", channelClass);
                createMethod.invoke(nm, channel);
            } catch (Exception ignored) {}
        }
    }

    private void playNativeAlarm() {
        try {
            Uri notificationUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (notificationUri == null) {
                notificationUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            Ringtone ringtone = RingtoneManager.getRingtone(getApplicationContext(), notificationUri);
            if (ringtone != null) {
                if (Build.VERSION.SDK_INT >= 21) {
                    AudioAttributes aa = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                    ringtone.setAudioAttributes(aa);
                }
                ringtone.play();
            }
        } catch (Exception ignored) {}
    }

    private void showNativeNotification(String title, String body) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm == null) return;

            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);

            Notification.Builder builder = new Notification.Builder(this);
            if (Build.VERSION.SDK_INT >= 26) {
                try {
                    java.lang.reflect.Method setChannelMethod = builder.getClass().getMethod("setChannelId", String.class);
                    setChannelMethod.invoke(builder, CHANNEL_ID);
                } catch (Exception ignored) {}
            }

            builder.setContentTitle(title)
                   .setContentText(body)
                   .setSmallIcon(R.mipmap.ic_launcher)
                   .setContentIntent(pi)
                   .setAutoCancel(true)
                   .setPriority(Notification.PRIORITY_MAX)
                   .setDefaults(Notification.DEFAULT_ALL)
                   .setVibrate(new long[]{0, 350, 150, 350, 150, 600});

            if (Build.VERSION.SDK_INT >= 21) {
                builder.setVisibility(Notification.VISIBILITY_PUBLIC);
            }

            playNativeAlarm();

            try {
                Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(new long[]{0, 350, 150, 350, 150, 600}, -1);
                }
            } catch (Exception ignored) {}

            nm.notify((int) (System.currentTimeMillis() % 100000), builder.build());
        } catch (Exception ignored) {}
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        boolean anyGranted = false;
        for (int res : grantResults) {
            if (res == PackageManager.PERMISSION_GRANTED) {
                anyGranted = true;
                break;
            }
        }
        if (anyGranted) {
            Toast.makeText(this, "Antalya Kurye: İzinler onaylandı!", Toast.LENGTH_SHORT).show();
        }
        requestBatteryOptimizationExemption();
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void requestAllPermissions() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    checkAndRequestAllPermissions();
                    requestBatteryOptimizationExemption();
                }
            });
        }

        @JavascriptInterface
        public void playAlarmSound() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    playNativeAlarm();
                }
            });
        }

        @JavascriptInterface
        public void vibrate(long ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(ms > 0 ? ms : 600);
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void showSystemNotification(final String title, final String body) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    showNativeNotification(title, body);
                }
            });
        }

        @JavascriptInterface
        public boolean isBatteryOptimizationIgnored() {
            try {
                if (Build.VERSION.SDK_INT >= 23) {
                    PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
                    return pm != null && pm.isIgnoringBatteryOptimizations(getPackageName());
                }
                return true;
            } catch (Exception e) {
                return false;
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}

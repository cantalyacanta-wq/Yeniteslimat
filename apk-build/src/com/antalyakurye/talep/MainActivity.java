package com.antalyakurye.talep;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.Vibrator;
import android.provider.Settings;
import android.view.View;
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
    public static MainActivity instance = null;
    public WebView webView;
    private static final String PRIMARY_URL = "https://www.antalyateslimat.com/#pakettalebi";
    private static final String FALLBACK_URL = "https://antalyateslimat.com/#pakettalebi";
    private static final String CHANNEL_ID = "antalya_kurye_talep";
    private boolean triedFallback = false;
    private PowerManager.WakeLock wakeLock = null;
    private WifiManager.WifiLock wifiLock = null;

    // Chromium'un arka planda timers ve network soketlerini dondurmesini onleyen ozel WebView
    public static class KeepAliveWebView extends WebView {
        public KeepAliveWebView(Context context) {
            super(context);
        }

        @Override
        protected void onWindowVisibilityChanged(int visibility) {
            // Chromium pencerenin gorunurlugunu sorguladiginda DAIMA View.VISIBLE donulur!
            // Boylece arka plandayken veya ekran kapaliyken JavaScript ve Firestore asla dondurulmaz!
            super.onWindowVisibilityChanged(View.VISIBLE);
        }

        @Override
        protected void onVisibilityChanged(View changedView, int visibility) {
            super.onVisibilityChanged(changedView, View.VISIBLE);
        }
    }

    public static void sendKeepAlivePulse() {
        final MainActivity act = instance;
        if (act != null && act.webView != null) {
            act.webView.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        act.webView.resumeTimers();
                        if (Build.VERSION.SDK_INT >= 19) {
                            act.webView.evaluateJavascript(
                                "if (typeof window.__antalyaKeepAlive === 'function') { window.__antalyaKeepAlive(); }",
                                null
                            );
                        }
                    } catch (Throwable ignored) {}
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        instance = this;

        // Tum beklenmeyen hatalari yakalayip uygulamanin aniden kapanmasini onle
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                throwable.printStackTrace();
            }
        });

        super.onCreate(savedInstanceState);

        try {
            requestWindowFeature(Window.FEATURE_NO_TITLE);
        } catch (Throwable ignored) {}

        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } catch (Throwable ignored) {}

        // 1. ILK OLARAK WEBVIEW'I BASLAT VE EKRANA BAS (Kullanici aninda uygulamayi gorsun)
        try {
            webView = new KeepAliveWebView(this);
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
            s.setUserAgentString(s.getUserAgentString() + " AntalyaKuryeApp/1.5.0 (TalepHavuzu; NativeBridge; KeepAlive)");

            // Native Javascript koprusu
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
                            } catch (Throwable ignored) {}
                        }
                    });
                }

                @Override
                public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                    callback.invoke(origin, true, true);
                }
            });

            webView.loadUrl(PRIMARY_URL);
        } catch (Throwable t) {
            t.printStackTrace();
        }

        // 2. Bildirim kanalini olustur
        createNotificationChannel();

        // 3. WakeLock & WifiLock (Arka Plan Korumasi)
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AntalyaKurye:KeepAlive");
                wakeLock.acquire(12 * 60 * 60 * 1000L);
            }
        } catch (Throwable ignored) {}

        try {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "AntalyaKurye:ActWifiLock");
                wifiLock.acquire();
            }
        } catch (Throwable ignored) {}

        // 4. Guvenli Gecikmeli Izin & Arka Plan Servis Baslatma
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    checkAndRequestAllPermissions();
                    startCourierForegroundService("🛵 Antalya Kurye Aktif", "Paket talep havuzu 7/24 dinleniyor • Arka planda kesintisiz");
                } catch (Throwable ignored) {}
            }
        }, 1500);
    }

    public void startCourierForegroundService(String title, String text) {
        try {
            Intent serviceIntent = new Intent(this, CourierForegroundService.class);
            serviceIntent.setAction(CourierForegroundService.ACTION_START);
            if (title != null) serviceIntent.putExtra(CourierForegroundService.EXTRA_TITLE, title);
            if (text != null) serviceIntent.putExtra(CourierForegroundService.EXTRA_TEXT, text);
            if (Build.VERSION.SDK_INT >= 26) {
                try {
                    java.lang.reflect.Method startFgMethod = Context.class.getMethod("startForegroundService", Intent.class);
                    startFgMethod.invoke(this, serviceIntent);
                } catch (Throwable fallback) {
                    startService(serviceIntent);
                }
            } else {
                startService(serviceIntent);
            }
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    public void stopCourierForegroundService() {
        try {
            Intent serviceIntent = new Intent(this, CourierForegroundService.class);
            serviceIntent.setAction(CourierForegroundService.ACTION_STOP);
            stopService(serviceIntent);
        } catch (Throwable ignored) {}
    }

    @Override
    protected void onPause() {
        super.onPause();
        // webView.onPause() kasitli olarak cagirILMAZ!
        // Javascript timerlari ve Firestore arka planda canli calismaya devam eder!
        if (webView != null) {
            try {
                webView.resumeTimers();
            } catch (Throwable ignored) {}
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (webView != null) {
            try {
                webView.resumeTimers();
            } catch (Throwable ignored) {}
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            try {
                webView.resumeTimers();
            } catch (Throwable ignored) {}
        }
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
            } catch (Throwable ignored) {}
        }
    }

    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= 23) {
            try {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                String packageName = getPackageName();
                if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + packageName));
                    startActivity(intent);
                }
            } catch (Throwable e) {
                try {
                    Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    startActivity(intent);
                } catch (Throwable ignored) {}
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
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

                try {
                    Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.order_alert);
                    AudioAttributes aa = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                    java.lang.reflect.Method setSoundMethod = channelClass.getMethod("setSound", Uri.class, AudioAttributes.class);
                    setSoundMethod.invoke(channel, soundUri, aa);
                } catch (Throwable ignored) {}

                java.lang.reflect.Method createMethod = nm.getClass().getMethod("createNotificationChannel", channelClass);
                createMethod.invoke(nm, channel);
            } catch (Throwable ignored) {}
        }
    }

    private void playNativeAlarm() {
        try {
            MediaPlayer mp = MediaPlayer.create(getApplicationContext(), R.raw.order_alert);
            if (mp != null) {
                mp.setVolume(1.0f, 1.0f);
                mp.start();
                mp.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                    @Override
                    public void onCompletion(MediaPlayer player) {
                        try { player.release(); } catch (Throwable ignored) {}
                    }
                });
                return;
            }
        } catch (Throwable ignored) {}

        try {
            Uri notificationUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            Ringtone ringtone = RingtoneManager.getRingtone(getApplicationContext(), notificationUri);
            if (ringtone != null) {
                ringtone.play();
            }
        } catch (Throwable ignored) {}
    }

    private void showNativeNotification(String title, String body) {
        try {
            createNotificationChannel();
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            
            // Android 12+ (API 31+) FLAG_IMMUTABLE zorunlu!
            int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) {
                pendingFlags |= 0x04000000;
            }
            PendingIntent pi = PendingIntent.getActivity(this, 0, intent, pendingFlags);

            Notification.Builder builder = new Notification.Builder(this);
            if (Build.VERSION.SDK_INT >= 26) {
                try {
                    java.lang.reflect.Method setChannelMethod = builder.getClass().getMethod("setChannelId", String.class);
                    setChannelMethod.invoke(builder, CHANNEL_ID);
                } catch (Throwable ignored) {}
            }

            // Ekran kapaliysa veya telefon kilitliyse ekrani aninda aydinlat
            try {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    PowerManager.WakeLock wake = pm.newWakeLock(
                        PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
                        "AntalyaKurye:ScreenWakeOnOrder"
                    );
                    wake.acquire(8000);
                }
            } catch (Throwable ignored) {}

            try {
                Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.order_alert);
                builder.setSound(soundUri);
            } catch (Throwable ignored) {}

            // Ust bildirim cubugunda aninda cikan yazi (Ticker text) ve genisletilmis tam metin
            builder.setTicker(title + ": " + body)
                   .setContentTitle(title)
                   .setContentText(body)
                   .setSmallIcon(R.mipmap.ic_launcher)
                   .setContentIntent(pi)
                   .setAutoCancel(true)
                   .setPriority(Notification.PRIORITY_MAX)
                   .setDefaults(Notification.DEFAULT_ALL)
                   .setFullScreenIntent(pi, true)
                   .setVibrate(new long[]{0, 350, 150, 350, 150, 600});

            if (Build.VERSION.SDK_INT >= 16) {
                builder.setStyle(new Notification.BigTextStyle().bigText(body).setSummaryText("Antalya Kurye"));
            }

            if (Build.VERSION.SDK_INT >= 21) {
                builder.setVisibility(Notification.VISIBILITY_PUBLIC);
                builder.setCategory(Notification.CATEGORY_CALL);
            }

            playNativeAlarm();

            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(new long[]{0, 350, 150, 350, 150, 600}, -1);
                }
            } catch (Throwable ignored) {}

            nm.notify((int) (System.currentTimeMillis() % 100000), builder.build());
        } catch (Throwable ignored) {}
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        try {
            boolean anyGranted = false;
            for (int res : grantResults) {
                if (res == PackageManager.PERMISSION_GRANTED) {
                    anyGranted = true;
                    break;
                }
            }
            if (anyGranted) {
                Toast.makeText(this, "Antalya Kurye: İzinler onaylandı!", Toast.LENGTH_SHORT).show();
                startCourierForegroundService("🛵 Antalya Kurye Aktif", "Paket talep havuzu 7/24 dinleniyor • Arka planda kesintisiz");
            }
        } catch (Throwable ignored) {}
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void requestAllPermissions() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        checkAndRequestAllPermissions();
                        requestBatteryOptimizationExemption();
                    } catch (Throwable ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void startForegroundService(final String title, final String text) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        startCourierForegroundService(title, text);
                    } catch (Throwable ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void stopForegroundService() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        stopCourierForegroundService();
                    } catch (Throwable ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void keepAlivePing() {
            if (webView != null) {
                webView.post(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            webView.resumeTimers();
                        } catch (Throwable ignored) {}
                    }
                });
            }
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
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(ms > 0 ? ms : 600);
                }
            } catch (Throwable ignored) {}
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
                    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                    return pm != null && pm.isIgnoringBatteryOptimizations(getPackageName());
                }
                return true;
            } catch (Throwable e) {
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
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Throwable ignored) {}
        super.onDestroy();
    }
}

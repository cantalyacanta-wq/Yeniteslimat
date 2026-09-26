package com.antalyakurye.talep;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String PRIMARY_URL = "https://www.antalyateslimat.com/#pakettalebi";
    private static final String FALLBACK_URL = "https://antalyateslimat.com/#pakettalebi";
    private boolean triedFallback = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // Bildirim izinlerini Android 13+ (API 33+) baslangicinda otomatik iste
        if (Build.VERSION.SDK_INT >= 33) {
            try {
                if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{
                        "android.permission.POST_NOTIFICATIONS",
                        "android.permission.ACCESS_FINE_LOCATION",
                        "android.permission.ACCESS_COARSE_LOCATION"
                    }, 101);
                }
            } catch (Exception ignored) {}
        }

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
        s.setUserAgentString(s.getUserAgentString() + " AntalyaKuryeApp/1.3.0 (TalepHavuzu)");

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
                callback.invoke(origin, true, false);
            }
        });

        webView.loadUrl(PRIMARY_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

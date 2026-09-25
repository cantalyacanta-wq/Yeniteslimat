#!/usr/bin/env bash
set -e

echo "=== Building Antalya Kurye Talep Havuzu APK (v1.2.0) ==="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/apk-build"
OUT_APK="$ROOT_DIR/public/downloads/Antalya-Kurye-Talep-Havuzu.apk"
DIST_APK="$ROOT_DIR/dist/downloads/Antalya-Kurye-Talep-Havuzu.apk"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
if [ ! -f "$ANDROID_JAR" ]; then
  ANDROID_JAR="/tmp/android.jar"
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/gen" "$BUILD_DIR/bin" "$BUILD_DIR/src/com/antalyakurye/talep"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-mdpi"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxxhdpi"
mkdir -p "$ROOT_DIR/public/downloads"
mkdir -p "$ROOT_DIR/dist/downloads"

# Generate launcher icons from high-res logo
node -e "
const sharp = require('sharp');
const path = require('path');
const logo = path.join('$ROOT_DIR', 'public', 'app-logo.png');

async function makeIcons() {
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };
  for (const [dir, sz] of Object.entries(sizes)) {
    const dest = path.join('$BUILD_DIR', 'res', dir, 'ic_launcher.png');
    await sharp(logo).resize(sz, sz).png().toFile(dest);
  }
}
makeIcons().catch(console.error);
"

# Create AndroidManifest.xml
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.antalyakurye.talep"
    android:versionCode="12"
    android:versionName="1.2.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <!-- Bildirim ve Anlik Talep Izinleri -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar"
        android:usesCleartextTraffic="true">
        <activity
            android:name="com.antalyakurye.talep.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:hardwareAccelerated="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create strings.xml
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Antalya Kurye</string>
</resources>
EOF

# Create MainActivity.java
cat << 'EOF' > "$BUILD_DIR/src/com/antalyakurye/talep/MainActivity.java"
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
    private static final String APP_URL = "https://ais-pre-dsymsorzrgunvtpunotord-5052813439.europe-west2.run.app/#pakettalebi";

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
        s.setUserAgentString(s.getUserAgentString() + " AntalyaKuryeApp/1.2.0 (TalepHavuzu)");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
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

        webView.loadUrl(APP_URL);
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
EOF

echo "[1/6] Compiling resources with aapt..."
aapt package -f -m \
  -J "$BUILD_DIR/gen" \
  -M "$BUILD_DIR/AndroidManifest.xml" \
  -S "$BUILD_DIR/res" \
  -I "$ANDROID_JAR"

echo "[2/6] Compiling Java classes with javac..."
javac -source 1.8 -target 1.8 \
  -cp "$ANDROID_JAR" \
  -d "$BUILD_DIR/bin" \
  "$BUILD_DIR/gen/com/antalyakurye/talep/R.java" \
  "$BUILD_DIR/src/com/antalyakurye/talep/MainActivity.java"

echo "[3/6] Converting Java bytecode to Dalvik executable (classes.dex)..."
dx --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/bin"

echo "[4/6] Packaging raw APK package..."
aapt package -f \
  -M "$BUILD_DIR/AndroidManifest.xml" \
  -S "$BUILD_DIR/res" \
  -I "$ANDROID_JAR" \
  -F "$BUILD_DIR/bin/unaligned.apk"

# Add classes.dex into unaligned.apk root
(cd "$BUILD_DIR/bin" && aapt add "unaligned.apk" "classes.dex")

echo "[5/6] 4-byte ZipAligning APK for performance..."
zipalign -f -p 4 "$BUILD_DIR/bin/unaligned.apk" "$OUT_APK"

echo "[6/6] Generating Release Keystore and Signing APK..."
KEYSTORE="/tmp/antalya-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias antalyakurye \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass antalya2026 \
    -keypass antalya2026 \
    -dname "CN=Antalya Kurye Express, OU=Mobile, O=Antalya Kurye, L=Muratpasa, ST=Antalya, C=TR"
fi

apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:antalya2026 \
  --key-pass pass:antalya2026 \
  --out "$OUT_APK" \
  "$OUT_APK"

cp "$OUT_APK" "$DIST_APK" 2>/dev/null || true

echo "=== Verifying Signed APK ==="
apksigner verify -v "$OUT_APK"

echo "=== SUCCESS! APK Built at: $OUT_APK ==="
ls -lh "$OUT_APK"

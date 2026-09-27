/**
 * APK Runtime & Download Detection Utility
 * Detects if the current user is running inside the official Android APK WebView container
 * or has previously downloaded/opened the APK application.
 */

export function isRunningInApk(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Check native JavascriptInterface injected by MainActivity.java
    if ((window as any).AndroidApp) {
      localStorage.setItem('antalya_in_apk', 'true');
      return true;
    }

    // 2. Check custom User-Agent appended in MainActivity.java:
    // "AntalyaKuryeApp/1.5.0 (TalepHavuzu; NativeBridge; KeepAlive)"
    const ua = navigator.userAgent || '';
    if (/AntalyaKuryeApp|NativeBridge|KeepAlive/i.test(ua)) {
      localStorage.setItem('antalya_in_apk', 'true');
      return true;
    }

    // 3. Check persistent localStorage flag set when running inside APK
    if (localStorage.getItem('antalya_in_apk') === 'true') {
      return true;
    }

    // 4. Check URL search params or hash flags
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    if (
      search.includes('source=apk') ||
      search.includes('app=apk') ||
      hash.includes('source=apk') ||
      hash.includes('app=apk')
    ) {
      localStorage.setItem('antalya_in_apk', 'true');
      return true;
    }

    // 5. Check if user already marked as having installed APK
    if (localStorage.getItem('antalya_apk_installed') === 'true') {
      return true;
    }
  } catch (e) {
    console.debug('isRunningInApk check error:', e);
  }

  return false;
}

/**
 * Mark that the user has downloaded the APK
 */
export function markApkDownloaded(): void {
  try {
    localStorage.setItem('antalya_apk_downloaded', 'true');
  } catch {}
}

/**
 * Returns true if APK download buttons should be hidden:
 * either the user is running inside the APK container, or has downloaded it.
 */
export function shouldHideApkButtons(): boolean {
  if (isRunningInApk()) return true;
  try {
    if (localStorage.getItem('antalya_apk_downloaded') === 'true') return true;
  } catch {}
  return false;
}

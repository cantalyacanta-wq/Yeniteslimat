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
 * Returns true if the user is running inside the Customer APK ("Antalya Kurye Çağır")
 * where courier buttons should be hidden and only customer ordering features apply.
 */
export function isCustomerApk(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Check persistent storage flags
    if (
      localStorage.getItem('antalya_is_customer_apk') === 'true' ||
      sessionStorage.getItem('antalya_is_customer_apk') === 'true'
    ) {
      return true;
    }

    const ua = navigator.userAgent || '';
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    // 2. Custom User-Agent tag injected into Customer APK
    if (/KuryeCagir|com\.antalyakurye\.cagir|MusteriApp/i.test(ua)) {
      localStorage.setItem('antalya_is_customer_apk', 'true');
      return true;
    }

    // 3. Customer URL routing entry points (#kurye-cagir)
    if (
      hash.includes('kurye-cagir') ||
      hash.includes('kuryecagir') ||
      hash.includes('musteri') ||
      search.includes('source=cagir') ||
      search.includes('app=cagir') ||
      search.includes('app=customer') ||
      search.includes('source=customer')
    ) {
      localStorage.setItem('antalya_is_customer_apk', 'true');
      return true;
    }

    // 4. Running inside Android APK container and NOT Courier Pool APK and NOT Admin APK
    const inApk =
      !!(window as any).AndroidApp ||
      /AntalyaKuryeApp|NativeBridge|KeepAlive/i.test(ua) ||
      localStorage.getItem('antalya_in_apk') === 'true';

    const isCourierPool =
      /TalepHavuzu/i.test(ua) ||
      hash.includes('pakettalebi') ||
      search.includes('pakettalebi');

    const isAdminApk =
      /Yonetim/i.test(ua) ||
      hash.includes('admin') ||
      search.includes('admin');

    if (inApk && !isCourierPool && !isAdminApk) {
      localStorage.setItem('antalya_is_customer_apk', 'true');
      return true;
    }
  } catch (e) {
    console.debug('isCustomerApk check error:', e);
  }

  return false;
}

/**
 * Returns true if running in Courier Pool APK ("Antalya Kurye Talep Havuzu")
 */
export function isCourierApk(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ua = navigator.userAgent || '';
    const hash = window.location.hash || '';
    return /TalepHavuzu/i.test(ua) || hash.includes('pakettalebi');
  } catch {
    return false;
  }
}

/**
 * Returns true if running in Admin APK ("Antalya Yönetim")
 */
export function isAdminApk(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ua = navigator.userAgent || '';
    const hash = window.location.hash || '';
    return /Yonetim/i.test(ua) || hash.includes('admin');
  } catch {
    return false;
  }
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

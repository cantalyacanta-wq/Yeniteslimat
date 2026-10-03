import { DeliveryRequest, DeliveryStatus, UserRole } from '../types';
import {
  playAcceptSound,
  playNewOrderSound,
  playCourierPoolSiren,
  playAdminVoiceAlert,
  playSuccessSound,
  playStatusChime,
  playCourierAssignedSound,
} from '../utils/audio';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  orderId?: string;
  trackingCode?: string;
  status?: DeliveryStatus;
  timestamp: string;
  isCourierJob?: boolean;
  price?: number;
  pickupDistrict?: string;
  deliveryDistrict?: string;
}

type NotificationListener = (notification: AppNotification) => void;
const listeners = new Set<NotificationListener>();

/**
 * Trigger Mobile Device Haptic Vibration
 * Uses browser Vibration API with fallback safety and Native Android bridge
 */
export function triggerHapticVibration(pattern: number[] = [150, 100, 200]) {
  if (typeof window !== 'undefined') {
    if ((window as any).AndroidApp?.vibrate) {
      try {
        const totalDuration = Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : 600;
        (window as any).AndroidApp.vibrate(totalDuration);
      } catch (e) {}
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.debug('Haptic vibration not supported or permission denied on device:', e);
      }
    }
  }
}

/**
 * Check if the browser supports Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Check if user has chosen to close/hide the top APK status bar notification
 */
export function isApkStatusNotificationHidden(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('antalya_hide_apk_status_bar') === 'true';
  } catch {
    return false;
  }
}

/**
 * Hide the ongoing "Antalya Kurye Aktif - Paket talep havuzu dinleniyor" notification from the Android status bar.
 * The background listeners, order notifications and sirens continue running 100% in background.
 */
export function hideApkStatusBarNotification(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('antalya_hide_apk_status_bar', 'true');
    if ((window as any).AndroidApp?.hideForegroundNotification) {
      (window as any).AndroidApp.hideForegroundNotification();
    } else if ((window as any).AndroidApp?.stopForegroundService) {
      (window as any).AndroidApp.stopForegroundService();
    }
  } catch (e) {
    console.debug('hideApkStatusBarNotification error:', e);
  }
}

/**
 * Dismiss persistent APK status bar notification on courier logout
 */
export function dismissApkForegroundNotificationOnLogout(): void {
  if (typeof window === 'undefined') return;
  try {
    if ((window as any).AndroidApp?.stopForegroundService) {
      (window as any).AndroidApp.stopForegroundService();
    }
    if ((window as any).AndroidApp?.hideForegroundNotification) {
      (window as any).AndroidApp.hideForegroundNotification();
    }
  } catch (e) {
    console.debug('dismissApkForegroundNotificationOnLogout error:', e);
  }
}

/**
 * Show / restore the ongoing "Antalya Kurye Aktif" status bar notification
 */
export function showApkStatusBarNotification(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('antalya_hide_apk_status_bar');
    if ((window as any).AndroidApp?.startForegroundService) {
      (window as any).AndroidApp.startForegroundService(
        '🛵 Antalya Kurye Aktif',
        'Paket talep havuzu 7/24 dinleniyor • Arka planda kesintisiz'
      );
    }
  } catch (e) {
    console.debug('showApkStatusBarNotification error:', e);
  }
}

/**
 * Toggle the status bar notification visibility
 */
export function toggleApkStatusBarNotification(): boolean {
  if (isApkStatusNotificationHidden()) {
    showApkStatusBarNotification();
    return true; // now visible
  } else {
    hideApkStatusBarNotification();
    return false; // now hidden
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // If running inside Android APK Native Bridge, trigger Android system permission prompts:
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.requestAllPermissions) {
    try {
      (window as any).AndroidApp.requestAllPermissions();
      if (isApkStatusNotificationHidden()) {
        setTimeout(() => {
          hideApkStatusBarNotification();
        }, 1800);
      }
    } catch (e) {
      console.debug('AndroidApp.requestAllPermissions error:', e);
    }
  }

  if (!isNotificationSupported()) {
    console.warn('Tarayıcı bildirim API desteği bulunmuyor.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Bildirim izni istenirken hata oluştu:', error);
    return false;
  }
}

/**
 * Subscribe in-app listeners to notifications
 */
export function subscribeToInAppNotifications(listener: NotificationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dispatch an in-app toast notification to active subscribers
 */
export function emitInAppNotification(notification: AppNotification) {
  listeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (e) {
      console.error('Notification listener error:', e);
    }
  });
}

// Track recent dispatched notifications to prevent duplicate alerts (e.g. within 15 seconds across local, server and firestore sync)
const recentDispatchedNotifications = new Map<string, number>();
const recentBrowserNotifications = new Map<string, number>();

/**
 * Send a native browser desktop / mobile notification
 */
export function sendBrowserNotification(
  title: string,
  options: {
    body: string;
    tag?: string;
    icon?: string;
    data?: any;
    vibrate?: number[];
  }
): boolean {
  // DEDUPLICATION: Prevent duplicate browser and Android APK notifications within 15 seconds
  // Extract order identifier (ANT-XXXX or req-XXXX) across data, tag, title, and body
  const orderIdentifier =
    options.data?.trackingCode ||
    options.data?.orderId ||
    (options.tag || '').match(/(req-[\w-]+|ANT-\d+)/i)?.[0] ||
    (title + ' ' + options.body).match(/(ANT-\d+|req-[\w-]+)/i)?.[0];

  const dedupKey = orderIdentifier ? `order:${orderIdentifier}` : (options.tag || `${title}:${options.body}`);
  const now = Date.now();
  const lastBrowserTime = recentBrowserNotifications.get(dedupKey);
  if (lastBrowserTime && now - lastBrowserTime < 15000) {
    return false;
  }

  // Cross-context deduplication via localStorage
  try {
    const storedLast = localStorage.getItem(`antalya_apk_notif_${dedupKey}`);
    if (storedLast && now - Number(storedLast) < 15000) {
      return false;
    }
    localStorage.setItem(`antalya_apk_notif_${dedupKey}`, String(now));
  } catch {}

  recentBrowserNotifications.set(dedupKey, now);

  // If running inside Android APK native container, trigger native high-priority system notification:
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.showSystemNotification) {
    try {
      (window as any).AndroidApp.showSystemNotification(title, options.body);
      // IMPORTANT FIX: Return true immediately when handled by native AndroidApp!
      // This prevents the WebView from firing a SECOND duplicate web notification.
      return true;
    } catch (e) {
      console.debug('AndroidApp.showSystemNotification error:', e);
    }
  }

  // If inside APK container, prevent standard Web Notification fallback which causes double notifications
  if (typeof window !== 'undefined') {
    try {
      if (
        (window as any).AndroidApp ||
        navigator.userAgent.includes('AntalyaKuryeApp') ||
        localStorage.getItem('antalya_in_apk') === 'true'
      ) {
        return true;
      }
    } catch {}
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const iconUrl = options.icon || '/pwa-192x192.png';
  const tag = options.tag || `antalya-kurye-${Date.now()}`;
  const vibrate = options.vibrate || [200, 100, 200];

  // Try Service Worker registration first (standard for Android PWA / WebAPK)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.showNotification(title, {
          body: options.body,
          icon: iconUrl,
          badge: iconUrl,
          tag,
          data: options.data,
          vibrate,
          silent: false,
        } as NotificationOptions);
      })
      .catch(() => {
        // Fall back to standard Notification constructor
        try {
          const notification = new Notification(title, {
            body: options.body,
            icon: iconUrl,
            tag,
            badge: iconUrl,
            data: options.data,
            silent: false,
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch {}
      });

    triggerHapticVibration(vibrate);
    return true;
  }

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: iconUrl,
      tag,
      badge: iconUrl,
      data: options.data,
      silent: false,
    });

    // Bring tab into focus on click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Vibrate device if supported
    triggerHapticVibration(vibrate);

    return true;
  } catch (err) {
    console.warn('Native notification spawn failed:', err);
    return false;
  }
}

/**
 * Comprehensive Order Status Notification Dispatcher
 * Automatically formats and routes notifications based on user role and order context
 * Triggers mobile device haptic vibration, audio chime, and visual toast.
 */
export function dispatchOrderStatusNotification(params: {
  order: DeliveryRequest;
  previousStatus?: DeliveryStatus;
  newStatus: DeliveryStatus;
  currentUserId?: string;
  userRole?: UserRole;
}) {
  const { order, previousStatus, newStatus, currentUserId, userRole } = params;

  // Don't notify if status didn't change
  if (previousStatus && previousStatus === newStatus) return;

  // DEDUPLICATION GUARD: Prevent duplicate sirens / toasts / APK push alerts for the same order and status within 15 seconds
  const idKey = order.id ? `${order.id}:${newStatus}` : null;
  const trackingKey = order.trackingCode ? `${order.trackingCode}:${newStatus}` : null;
  const numKey = order.trackingCode ? `${order.trackingCode.replace(/\D/g, '')}:${newStatus}` : null;
  const keysToCheck = Array.from(new Set([idKey, trackingKey, numKey].filter(Boolean))) as string[];

  const now = Date.now();
  for (const k of keysToCheck) {
    const lastTime = recentDispatchedNotifications.get(k);
    if (lastTime && now - lastTime < 15000) {
      return; // Already notified within 15 seconds
    }
    try {
      const stored = localStorage.getItem(`antalya_notif_guard_${k}`);
      if (stored && now - Number(stored) < 15000) {
        return; // Already notified in another context/tab/sync
      }
    } catch {}
  }

  // Register all keys
  for (const k of keysToCheck) {
    recentDispatchedNotifications.set(k, now);
    try {
      localStorage.setItem(`antalya_notif_guard_${k}`, String(now));
    } catch {}
  }

  // Clean old deduplication entries after 60s
  if (recentDispatchedNotifications.size > 100) {
    for (const [k, t] of recentDispatchedNotifications.entries()) {
      if (now - t > 60000) {
        recentDispatchedNotifications.delete(k);
        try {
          localStorage.removeItem(`antalya_notif_guard_${k}`);
        } catch {}
      }
    }
  }

  let isCustomerOwner = false;
  if (typeof window !== 'undefined') {
    try {
      const savedOrderId = localStorage.getItem('ant_last_customer_order_id');
      const savedPhone = localStorage.getItem('ant_last_customer_phone');
      if (currentUserId && order.senderUserId === currentUserId) {
        isCustomerOwner = true;
      } else if (savedOrderId && savedOrderId === order.id) {
        isCustomerOwner = true;
      } else if (savedPhone && order.sender?.contactPhone && savedPhone === order.sender?.contactPhone) {
        isCustomerOwner = true;
      } else if (userRole === 'customer') {
        isCustomerOwner = true;
      }
    } catch {}
  } else if (currentUserId && order.senderUserId === currentUserId) {
    isCustomerOwner = true;
  }

  const isAssignedCourier = currentUserId && (order.assignedCourier?.id === currentUserId || order.courier?.id === currentUserId);
  const isCourierRole = userRole === 'courier';
  const isAdminRole = userRole === 'admin';

  let title = '';
  let body = '';
  let type: AppNotification['type'] = 'info';
  let vibratePattern: number[] = [150, 100, 150];
  let isCourierJob = false;

  const courierName = order.assignedCourier?.name || order.courier?.name || 'Moto Kurye';
  const trackingCode = order.trackingCode || 'Sipariş';
  const receiverDistrict = order.receiver?.district || 'Antalya';
  const senderDistrict = order.sender?.district || 'Antalya';

  switch (newStatus) {
    case 'pending_admin': {
      // Kuryelere YÖNETİCİ ONAYI BEKLEYEN sipariş hakkında KESİNLİKLE HİÇBİR BİLDİRİM / SES GİTMESİN!
      if (isCourierRole) {
        return; // Kurye rolü için sessizce çık, havuz bildirimi yalnızca onaylandıktan sonra gidecek
      }

      const isAdminRoute =
        typeof window !== 'undefined' &&
        (window.location.pathname.toLowerCase().includes('admin') ||
          window.location.hash.toLowerCase().includes('admin') ||
          window.location.hash.toLowerCase().includes('yonetim') ||
          window.location.search.toLowerCase().includes('admin'));

      if (isAdminRole || isAdminRoute) {
        title = '🚨 YENİ MÜŞTERİ TALEBİ ONAY BEKLİYOR!';
        body = `[${trackingCode}] ${senderDistrict} ➔ ${receiverDistrict} (${order.price} ₺). Onayınızın ardından kurye havuzuna düşecektir.`;
        type = 'alert';
        vibratePattern = [500, 200, 500, 200, 800];
        playAdminVoiceAlert(order);
      } else if (isCustomerOwner) {
        title = '📋 Siparişiniz Alındı (Yönetim Onayında)';
        body = `[${trackingCode}] Siparişiniz başarıyla alındı. Yönetici kontrolünün hemen ardından moto kurye havuzuna aktarılacaktır.`;
        type = 'info';
        vibratePattern = [120, 80, 120];
        playNewOrderSound();
      } else {
        // Kurye havuzuna düşene kadar diğer genel kullanıcılara da bildirim gönderilmez
        return;
      }
      break;
    }

    case 'pending_pool':
      const isPoolRoute = typeof window !== 'undefined' && (
        window.location.pathname.toLowerCase().includes('pakettalebi') ||
        window.location.hash.toLowerCase().includes('pakettalebi') ||
        window.location.search.toLowerCase().includes('pakettalebi')
      );
      if (isCourierRole || isAdminRole || isPoolRoute) {
        title = '⚡ YENİ KURYELİK İŞ DÜŞTÜ!';
        body = `[${trackingCode}] ${senderDistrict} ➔ ${receiverDistrict} | Kazanç: ${order.price} ₺. Hemen havuzdan kabul edebilirsiniz.`;
        type = 'alert';
        isCourierJob = true;
        // Strong pulsating vibration pattern for couriers
        vibratePattern = [200, 100, 200, 100, 250];
        playCourierPoolSiren();
      } else if (isCustomerOwner) {
        title = '🛵 Siparişiniz Havuzda!';
        body = `[${trackingCode}] Talebiniz alındı (${senderDistrict} ➔ ${receiverDistrict}). En yakın moto kurye bekleniyor.`;
        type = 'info';
        vibratePattern = [120, 80, 120];
        playNewOrderSound();
      } else {
        title = '⚡ YENİ PAKET TALEBİ GELDİ!';
        body = `[${trackingCode}] ${senderDistrict} ➔ ${receiverDistrict} | ${order.price} ₺`;
        type = 'alert';
        vibratePattern = [150, 100, 150];
        playNewOrderSound();
      }
      break;

    case 'courier_assigned':
      if (isCustomerOwner) {
        title = `🛵 Kuryeniz Atandı: ${courierName}`;
        body = `[${trackingCode}] Kuryeniz paketi teslim almak üzere ${senderDistrict} adresinize yöneldi.`;
        type = 'info';
        vibratePattern = [160, 90, 160];
        playCourierAssignedSound();
      } else if (isAssignedCourier) {
        title = `✅ Görev Üzerinize Atandı!`;
        body = `[${trackingCode}] ${senderDistrict} adresinden teslim alıp ${receiverDistrict} adresine ulaştıracaksınız.`;
        type = 'success';
        vibratePattern = [180, 100, 180];
        playCourierAssignedSound();
      } else if (isCourierRole) {
        title = `🛵 Kurye Göreve Başladı`;
        body = `[${trackingCode}] ${courierName} siparişi havuzdan kabul etti.`;
        type = 'info';
        playCourierAssignedSound();
      } else if (isAdminRole) {
        title = `🛵 Kurye Göreve Başladı`;
        body = `[${trackingCode}] ${courierName} siparişi teslim almak için yola çıktı.`;
        type = 'info';
        playCourierAssignedSound();
      } else {
        // General customer notification
        title = `🛵 Kuryeniz Atandı: ${courierName}`;
        body = `[${trackingCode}] Kurye yola çıktı.`;
        type = 'info';
        playCourierAssignedSound();
      }
      break;

    case 'picked_up':
      if (isCustomerOwner) {
        title = `📦 Paketiniz Alındı & Yola Çıktı!`;
        body = `[${trackingCode}] ${courierName} paketinizi teslim aldı, ${receiverDistrict} yönüne hızla hareket ediyor.`;
        type = 'info';
        vibratePattern = [120, 80, 120];
        playStatusChime();
      } else if (isAssignedCourier) {
        title = `🚀 Teslimat Aşaması Başladı`;
        body = `[${trackingCode}] Paket teslim alındı. ${receiverDistrict} adresine güvenle ulaştırınız.`;
        type = 'info';
        vibratePattern = [120, 80, 120];
        playStatusChime();
      } else if (isAdminRole) {
        title = `📦 Paket Yolda`;
        body = `[${trackingCode}] ${courierName} paketi teslim aldı ve yola çıktı.`;
        type = 'info';
      }
      break;

    case 'near_destination':
      if (isCustomerOwner) {
        title = `📍 Kuryeniz Teslimat Noktasında!`;
        body = `[${trackingCode}] Kuryeniz hedef adrese ulaştı, lütfen teslimat için hazır olunuz.`;
        type = 'warning';
        vibratePattern = [200, 100, 200];
        playStatusChime();
      } else if (isAssignedCourier) {
        title = `📍 Hedef Adrestesiniz`;
        body = `[${trackingCode}] Alıcı ile iletişime geçip teslimatı tamamlayabilirsiniz.`;
        type = 'warning';
        vibratePattern = [200, 100, 200];
        playStatusChime();
      }
      break;

    case 'delivered':
      if (isCustomerOwner) {
        title = `🎉 Paketiniz Başarıyla Teslim Edildi!`;
        body = `[${trackingCode}] Paket ${receiverDistrict} adresindeki alıcıya teslim edilmiştir. Bizi tercih ettiğiniz için teşekkür ederiz!`;
        type = 'success';
        vibratePattern = [100, 50, 100, 50, 250];
        playSuccessSound();
      } else if (isAssignedCourier) {
        title = `💰 Teslimat Tamamlandı!`;
        body = `[${trackingCode}] Teslimat onaylandı. Kazancınız (+${order.courierEarnings} ₺) hesabınıza işlendi.`;
        type = 'success';
        vibratePattern = [100, 50, 100, 50, 250];
        playSuccessSound();
      } else if (isAdminRole) {
        title = `✅ Sipariş Tamamlandı`;
        body = `[${trackingCode}] ${courierName} tarafından ${receiverDistrict} adresine başarıyla teslim edildi.`;
        type = 'success';
        playSuccessSound();
      }
      break;

    case 'cancelled':
      title = `❌ Sipariş İptal Edildi`;
      body = `[${trackingCode}] Sipariş iptal edildi.`;
      type = 'alert';
      vibratePattern = [300, 100, 300];
      playStatusChime();
      break;

    default:
      break;
  }

  // If a message was generated for this role/context, send notifications
  if (title && body) {
    const notifObj: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      body,
      type,
      orderId: order.id,
      trackingCode: order.trackingCode,
      status: newStatus,
      timestamp: new Date().toISOString(),
      isCourierJob,
      price: order.price,
      pickupDistrict: senderDistrict,
      deliveryDistrict: receiverDistrict,
    };

    // 1. Trigger mobile haptic vibration
    triggerHapticVibration(vibratePattern);

    // 2. Send browser native notification
    sendBrowserNotification(title, {
      body,
      tag: `order-${order.id}-${newStatus}`,
      data: { orderId: order.id, trackingCode: order.trackingCode },
      vibrate: vibratePattern,
    });

    // 3. Emit in-app floating banner/toast
    emitInAppNotification(notifObj);
  }
}

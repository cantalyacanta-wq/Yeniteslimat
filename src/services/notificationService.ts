import { DeliveryRequest, DeliveryStatus, UserRole } from '../types';
import { playAcceptSound, playNewOrderSound, playSuccessSound, playStatusChime } from '../utils/audio';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  orderId?: string;
  trackingCode?: string;
  status?: DeliveryStatus;
  timestamp: string;
}

type NotificationListener = (notification: AppNotification) => void;
const listeners = new Set<NotificationListener>();

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
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
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
function emitInAppNotification(notification: AppNotification) {
  listeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (e) {
      console.error('Notification listener error:', e);
    }
  });
}

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
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag || `antalya-kurye-${Date.now()}`,
      badge: '/favicon.ico',
      data: options.data,
      silent: false,
    });

    // Bring tab into focus on click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Vibrate device if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(options.vibrate || [200, 100, 200]);
    }

    return true;
  } catch (err) {
    console.warn('Native notification spawn failed:', err);
    return false;
  }
}

/**
 * Comprehensive Order Status Notification Dispatcher
 * Automatically formats and routes notifications based on user role and order context
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

  const isCustomerOwner = currentUserId && order.senderUserId === currentUserId;
  const isAssignedCourier = currentUserId && order.assignedCourier?.id === currentUserId;
  const isCourierRole = userRole === 'courier';
  const isAdminRole = userRole === 'admin';

  let title = '';
  let body = '';
  let type: AppNotification['type'] = 'info';

  const courierName = order.assignedCourier?.name || 'Moto Kurye';
  const trackingCode = order.trackingCode || 'Sipariş';
  const receiverDistrict = order.receiver.district;
  const senderDistrict = order.sender.district;

  switch (newStatus) {
    case 'pending_pool':
      if (isCourierRole || isAdminRole) {
        title = '⚡ Yeni Sipariş Kurye Havuzunda!';
        body = `[${trackingCode}] ${senderDistrict} ➔ ${receiverDistrict} (${order.price} ₺). Hemen kabul edebilirsiniz.`;
        type = 'alert';
        playNewOrderSound();
      }
      break;

    case 'courier_assigned':
      if (isCustomerOwner) {
        title = `🛵 Kuryeniz Atandı: ${courierName}`;
        body = `[${trackingCode}] Kuryeniz paketi teslim almak üzere adresinize yöneldi.`;
        type = 'info';
        playAcceptSound();
      } else if (isAssignedCourier) {
        title = `✅ Görev Üzerinize Atandı!`;
        body = `[${trackingCode}] ${senderDistrict} adresinden teslim alıp ${receiverDistrict} adresine ulaştıracaksınız.`;
        type = 'success';
        playAcceptSound();
      } else if (isAdminRole) {
        title = `🛵 Kurye Göreve Başladı`;
        body = `[${trackingCode}] ${courierName} siparişi teslim almak için yola çıktı.`;
        type = 'info';
      }
      break;

    case 'picked_up':
      if (isCustomerOwner) {
        title = `📦 Paketiniz Alındı & Yola Çıktı!`;
        body = `[${trackingCode}] ${courierName} paketinizi teslim aldı, ${receiverDistrict} yönüne hızla hareket ediyor.`;
        type = 'info';
        playStatusChime();
      } else if (isAssignedCourier) {
        title = `🚀 Teslimat Aşaması Başladı`;
        body = `[${trackingCode}] Paket teslim alındı. ${receiverDistrict} adresine güvenle ulaştırınız.`;
        type = 'info';
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
        playStatusChime();
      } else if (isAssignedCourier) {
        title = `📍 Hedef Adrestesiniz`;
        body = `[${trackingCode}] Alıcı ile iletişime geçip teslimatı tamamlayabilirsiniz.`;
        type = 'warning';
        playStatusChime();
      }
      break;

    case 'delivered':
      if (isCustomerOwner) {
        title = `🎉 Paketiniz Başarıyla Teslim Edildi!`;
        body = `[${trackingCode}] Paket ${receiverDistrict} adresindeki alıcıya teslim edilmiştir. Bizi tercih ettiğiniz için teşekkür ederiz!`;
        type = 'success';
        playSuccessSound();
      } else if (isAssignedCourier) {
        title = `💰 Teslimat Tamamlandı!`;
        body = `[${trackingCode}] Teslimat onaylandı. Kazancınız (+${order.courierEarnings} ₺) hesabınıza işlendi.`;
        type = 'success';
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
    };

    // 1. Send browser native notification
    sendBrowserNotification(title, {
      body,
      tag: `order-${order.id}-${newStatus}`,
      data: { orderId: order.id, trackingCode: order.trackingCode },
    });

    // 2. Emit in-app floating banner/toast
    emitInAppNotification(notifObj);
  }
}

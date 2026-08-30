import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Sparkles, 
  Bike, 
  Package, 
  MapPin,
  Volume2
} from 'lucide-react';
import { AppNotification, subscribeToInAppNotifications } from '../services/notificationService';
import { useDelivery } from '../context/DeliveryContext';

export const NotificationBanner: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<AppNotification[]>([]);
  const { setSelectedTrackingId, setCurrentView, currentUser } = useDelivery();

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((notification) => {
      setActiveNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id).slice(0, 2)]);

      // Auto dismiss after 7 seconds for standard, 10 seconds for courier alerts
      const timeoutMs = notification.isCourierJob ? 10000 : 7000;
      setTimeout(() => {
        setActiveNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, timeoutMs);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = (notif: AppNotification) => {
    if (notif.isCourierJob || currentUser.role === 'courier') {
      setCurrentView('courier');
    } else if (notif.orderId) {
      setSelectedTrackingId(notif.orderId);
      setCurrentView('tracker');
    }
    handleDismiss(notif.id);
  };

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-2 sm:px-0">
      <AnimatePresence>
        {activeNotifications.map((notif) => {
          const isSuccess = notif.type === 'success';
          const isAlert = notif.type === 'alert';
          const isWarning = notif.type === 'warning';
          const isCourierJob = notif.isCourierJob;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex flex-col gap-2 text-white relative overflow-hidden ${
                isCourierJob
                  ? 'bg-gradient-to-br from-[#1a1202] via-[#2a1d04] to-[#0d0901] border-amber-500 shadow-amber-950/80 ring-2 ring-amber-400/40 animate-pulse'
                  : isSuccess
                  ? 'bg-gradient-to-br from-[#012218] via-[#023123] to-[#01140e] border-emerald-500/80 shadow-emerald-950/70'
                  : isAlert
                  ? 'bg-gradient-to-br from-[#240608] via-[#350b0f] to-[#150204] border-red-500/80 shadow-red-950/70'
                  : isWarning
                  ? 'bg-gradient-to-br from-[#1e1502] via-[#2a1e03] to-[#120d01] border-amber-500/80 shadow-amber-950/70'
                  : 'bg-gradient-to-br from-[#021c17] via-[#042820] to-[#011410] border-teal-500/70 shadow-slate-950/70'
              }`}
            >
              {/* Top ambient color bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isCourierJob
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500'
                    : isSuccess
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : isAlert
                    ? 'bg-gradient-to-r from-red-500 to-rose-400'
                    : isWarning
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                }`}
              />

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isCourierJob
                      ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300 animate-bounce'
                      : isSuccess
                      ? 'bg-emerald-600 text-white'
                      : isAlert
                      ? 'bg-red-600 text-white'
                      : isWarning
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isCourierJob ? (
                    <Bike className="w-5 h-5" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isAlert ? (
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  ) : isWarning ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white line-clamp-1">
                      {notif.title}
                    </span>
                    {isCourierJob && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm shadow-xs">
                        Yeni İş
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                      <Volume2 className="w-3 h-3 text-slate-400" />
                      Ses & Titreşim
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-snug line-clamp-2 font-medium">
                    {notif.body}
                  </p>

                  {/* Route & Price pill for courier jobs */}
                  {isCourierJob && notif.pickupDistrict && notif.deliveryDistrict && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] bg-amber-950/60 border border-amber-500/40 rounded-lg px-2 py-1 text-amber-200 font-semibold">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{notif.pickupDistrict} ➔ {notif.deliveryDistrict}</span>
                      {notif.price && (
                        <span className="ml-auto text-amber-300 font-bold bg-amber-900/80 px-1.5 rounded">
                          {notif.price} ₺
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => handleClick(notif)}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ${
                        isCourierJob
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-1 ring-amber-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isCourierJob ? (
                        <>
                          <Bike className="w-3.5 h-3.5" />
                          <span>Havuzdan Kabul Et</span>
                        </>
                      ) : (
                        <>
                          <Package className="w-3.5 h-3.5" />
                          <span>Siparişi Canlı Takip Et</span>
                        </>
                      )}
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>

                    <button
                      onClick={() => handleDismiss(notif.id)}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

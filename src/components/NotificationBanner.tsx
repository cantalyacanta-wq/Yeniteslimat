import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, Info, AlertTriangle, X, ArrowRight, Sparkles } from 'lucide-react';
import { AppNotification, subscribeToInAppNotifications } from '../services/notificationService';
import { useDelivery } from '../context/DeliveryContext';

export const NotificationBanner: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<AppNotification[]>([]);
  const { setSelectedTrackingId, setCurrentView } = useDelivery();

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((notification) => {
      setActiveNotifications((prev) => [notification, ...prev.slice(0, 2)]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setActiveNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 6000);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = (notif: AppNotification) => {
    if (notif.orderId) {
      setSelectedTrackingId(notif.orderId);
      setCurrentView('tracker');
    }
    handleDismiss(notif.id);
  };

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      <AnimatePresence>
        {activeNotifications.map((notif) => {
          const isSuccess = notif.type === 'success';
          const isAlert = notif.type === 'alert';
          const isWarning = notif.type === 'warning';

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 text-white relative overflow-hidden ${
                isSuccess
                  ? 'bg-emerald-950/95 border-emerald-500/80 shadow-emerald-950/70'
                  : isAlert
                  ? 'bg-red-950/95 border-red-500/80 shadow-red-950/70'
                  : isWarning
                  ? 'bg-amber-950/95 border-amber-500/80 shadow-amber-950/70'
                  : 'bg-slate-900/95 border-teal-500/70 shadow-slate-950/70'
              }`}
            >
              {/* Top ambient color bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isSuccess
                    ? 'bg-emerald-400'
                    : isAlert
                    ? 'bg-red-500'
                    : isWarning
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
              />

              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isSuccess
                    ? 'bg-emerald-600 text-white'
                    : isAlert
                    ? 'bg-red-600 text-white'
                    : isWarning
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : 'bg-teal-600 text-white'
                }`}
              >
                {isSuccess ? (
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
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-extrabold text-xs tracking-tight text-white line-clamp-1">
                    {notif.title}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-snug line-clamp-2">
                  {notif.body}
                </p>

                {notif.orderId && (
                  <button
                    onClick={() => handleClick(notif)}
                    className="mt-2 text-[11px] font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 transition cursor-pointer underline"
                  >
                    Detayları Görüntüle <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => handleDismiss(notif.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

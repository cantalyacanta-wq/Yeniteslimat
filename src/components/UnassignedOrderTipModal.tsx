import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Clock,
  Coins,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DeliveryRequest } from '../types';

export const UnassignedOrderTipModal: React.FC = () => {
  const { requests, myCustomerOrders, currentUser, addTipToRequest } = useDelivery();

  const [activeWaitingOrder, setActiveWaitingOrder] = useState<DeliveryRequest | null>(null);
  const [selectedTip, setSelectedTip] = useState<number>(50);
  const [customTipInput, setCustomTipInput] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 5 Minutes in Milliseconds = 300,000 ms
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  // Find unassigned orders for this customer that have been waiting in pool >= 5 minutes
  useEffect(() => {
    // If user is actively logged in as courier or admin and not managing their own orders, skip
    if (currentUser.role === 'courier') return;

    const checkWaitingOrders = () => {
      const now = Date.now();

      // Look across customer orders and requests created from this device/user
      const candidateOrders = requests.filter((r) => {
        // Must be unassigned and waiting in pool
        if (r.status !== 'pending_pool' || r.assignedCourier) return false;

        // Check if customer owns this order
        let isOwner = false;
        if (currentUser.id !== 'user-guest-01' && r.senderUserId === currentUser.id) {
          isOwner = true;
        }
        if (typeof window !== 'undefined') {
          const lastCustId = localStorage.getItem('ant_last_customer_order_id');
          if (lastCustId && r.id === lastCustId) isOwner = true;
          const lastPhone = localStorage.getItem('ant_last_customer_phone');
          if (lastPhone && r.sender?.contactPhone && r.sender.contactPhone.replace(/\D/g, '') === lastPhone.replace(/\D/g, '')) {
            isOwner = true;
          }
        }
        if (myCustomerOrders.some((mo) => mo.id === r.id)) {
          isOwner = true;
        }

        if (!isOwner) return false;

        // Check 5 minutes condition
        const createdMs = r.createdAt ? new Date(r.createdAt).getTime() : 0;
        const elapsed = now - createdMs;

        // Check if already dismissed in this session
        const isDismissed = sessionStorage.getItem(`tip_prompt_dismissed_${r.id}`) === 'true';

        return elapsed >= FIVE_MINUTES_MS && !isDismissed;
      });

      if (candidateOrders.length > 0) {
        // If not currently showing an order, show the most recent waiting one
        if (!activeWaitingOrder) {
          setActiveWaitingOrder(candidateOrders[0]);
        }
      } else if (activeWaitingOrder) {
        // If the active order was assigned or cancelled in real-time, close popup
        const currentInDb = requests.find((r) => r.id === activeWaitingOrder.id);
        if (!currentInDb || currentInDb.status !== 'pending_pool' || currentInDb.assignedCourier) {
          setActiveWaitingOrder(null);
        }
      }
    };

    checkWaitingOrders();
    const interval = setInterval(checkWaitingOrders, 6000); // Check every 6 seconds

    const handleOpenTipModalEvent = (e: any) => {
      const orderId = e.detail?.orderId;
      const target = requests.find((r) => r.id === orderId);
      if (target && target.status === 'pending_pool' && !target.assignedCourier) {
        setActiveWaitingOrder(target);
      }
    };
    window.addEventListener('open_tip_modal', handleOpenTipModalEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('open_tip_modal', handleOpenTipModalEvent);
    };
  }, [requests, myCustomerOrders, currentUser, activeWaitingOrder]);

  const handleDismiss = () => {
    if (activeWaitingOrder) {
      try {
        sessionStorage.setItem(`tip_prompt_dismissed_${activeWaitingOrder.id}`, 'true');
      } catch {}
    }
    setActiveWaitingOrder(null);
    setSuccessMessage(null);
  };

  const handlePresetSelect = (amount: number) => {
    setSelectedTip(amount);
    setCustomTipInput(String(amount));
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomTipInput(val);
    const num = Number(val) || 0;
    setSelectedTip(num);
  };

  const handleConfirmTip = () => {
    if (!activeWaitingOrder) return;
    const amount = Number(customTipInput) || selectedTip || 0;
    if (amount <= 0) {
      alert('Lütfen geçerli bir bahşiş tutarı giriniz (en az 10 TL).');
      return;
    }

    setIsSubmitting(true);
    const res = addTipToRequest(activeWaitingOrder.id, amount);

    if (res.success) {
      setSuccessMessage(
        `Bahşiş başarıyla eklendi! Yeni talep tutarı ${res.newPrice} TL olarak güncellendi ve kuryeler bilgilendirildi.`
      );
      try {
        sessionStorage.setItem(`tip_prompt_dismissed_${activeWaitingOrder.id}`, 'true');
      } catch {}

      setTimeout(() => {
        setIsSubmitting(false);
        setActiveWaitingOrder(null);
        setSuccessMessage(null);
      }, 2200);
    } else {
      setIsSubmitting(false);
      alert(res.message || 'Bahşiş eklenirken bir hata oluştu.');
    }
  };

  // If no order is waiting, do not render modal
  if (!activeWaitingOrder) return null;

  const currentPrice = activeWaitingOrder.price || 150;
  const currentCourierEarnings = activeWaitingOrder.courierEarnings || currentPrice;
  const numericTip = Number(customTipInput) || selectedTip || 0;
  const newTotalPrice = currentPrice + numericTip;
  const newCourierEarnings = currentCourierEarnings + numericTip;

  // Calculate elapsed minutes for display
  const elapsedMinutes = activeWaitingOrder.createdAt
    ? Math.max(5, Math.floor((Date.now() - new Date(activeWaitingOrder.createdAt).getTime()) / (60 * 1000)))
    : 5;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#03261f] via-[#021d17] to-[#011410] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-950/70 text-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tip-modal-title"
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white transition cursor-pointer"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Screen Overlay */}
        {successMessage ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Bahşiş Başarıyla Eklendi!</h3>
              <p className="text-sm text-emerald-300 max-w-sm mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>
            <div className="p-3 bg-[#022e23] border border-emerald-500/60 rounded-2xl max-w-xs mx-auto text-xs text-amber-300 font-bold">
              ⚡ Talebiniz kurye havuzunda öncelikli olarak üst sıraya taşındı.
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Badge & Title */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{elapsedMinutes} Dakikadır Bekliyor</span>
                  </span>
                  <span className="text-xs text-emerald-300/80 font-mono">
                    #{activeWaitingOrder.trackingCode}
                  </span>
                </div>
                <h2 id="tip-modal-title" className="text-lg sm:text-xl font-black text-white mt-1 leading-snug">
                  Kurye Atamasını Hızlandırın
                </h2>
              </div>
            </div>

            {/* Core Informative Notification Callout (Required User Text) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-amber-950/50 border border-amber-500/60 text-amber-100 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kuryeye bahşiş eklemek, talebinizin daha kısa sürede seçilmesini sağlar.</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Talebiniz kurye havuzunda beklemektedir. Antalya'daki moto kuryeler havuzda kazancı daha yüksek olan siparişleri öncelikli olarak kabul eder. Ekleyeceğiniz bahşiş doğrudan kurye kazancına yansıtılır.
              </p>
            </div>

            {/* Current Request Summary Strip */}
            <div className="p-3.5 bg-[#021813] border border-emerald-900/90 rounded-2xl flex items-center justify-between text-xs gap-3">
              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{activeWaitingOrder.sender.district} ➔ {activeWaitingOrder.receiver.district}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Paket: {activeWaitingOrder.packageName || 'Standart Kurye Paketi'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Mevcut Tutar</span>
                <span className="font-extrabold text-white text-sm">{currentPrice} TL</span>
              </div>
            </div>

            {/* Tip Amount Selection & Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span>Eklenecek Bahşiş Tutarını Seçin veya Girin:</span>
                <span className="text-amber-400 text-[11px]">Doğrudan Kuryeye Aktarılır</span>
              </label>

              {/* Fast Presets */}
              <div className="grid grid-cols-5 gap-2">
                {[30, 50, 75, 100, 150].map((amount) => {
                  const isSelected = selectedTip === amount && Number(customTipInput) === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handlePresetSelect(amount)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-102 border-2 border-amber-300'
                          : 'bg-[#032a22] hover:bg-[#043d31] border border-emerald-700/60 text-emerald-200'
                      }`}
                    >
                      <span>+{amount}</span>
                      <span className="text-[10px] opacity-80">TL</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Number Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                  <Coins className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customTipInput}
                  onChange={handleCustomInputChange}
                  placeholder="Farklı bir tutar girin (TL)"
                  className="w-full bg-[#021f19] border border-emerald-700/80 rounded-2xl pl-10 pr-12 py-3 text-sm font-bold text-white placeholder-emerald-700/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-amber-300">
                  TL
                </div>
              </div>
            </div>

            {/* Calculated New Price Preview */}
            <div className="p-3.5 rounded-2xl bg-[#02241d] border border-emerald-600/50 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-[11px] block">Güncellenecek Talep Tutarı:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-400 line-through text-xs">{currentPrice} TL</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-black text-amber-300 text-base">{newTotalPrice} TL</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-400 block font-medium">Yeni Kurye Kazancı:</span>
                <span className="font-extrabold text-emerald-200 text-sm">{newCourierEarnings} TL</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmTip}
                disabled={isSubmitting || numericTip <= 0}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-600/30 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Bahşiş Ekle & Fiyatı Güncelle (+{numericTip} TL)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-3 bg-[#011a14] hover:bg-[#022820] border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-2xl transition cursor-pointer flex items-center justify-center text-center"
              >
                Şimdilik Bekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

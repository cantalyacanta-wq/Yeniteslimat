import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  Share2, 
  Bike, 
  Package, 
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  X
} from 'lucide-react';
import { DeliveryRequest, DeliveryStatus } from '../types';
import { useDelivery } from '../context/DeliveryContext';
import { AntalyaMap } from './AntalyaMap';

export const OrderTracker: React.FC = () => {
  const { 
    requests, 
    selectedTrackingId, 
    setSelectedTrackingId, 
    rateDelivery,
    setCurrentView,
    cancelRequest 
  } = useDelivery();

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Active or selected order
  const currentOrder = requests.find(
    (r) => r.id === selectedTrackingId || r.trackingCode.toLowerCase() === searchQuery.trim().toLowerCase()
  ) || requests[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = requests.find(
      (r) => r.trackingCode.toLowerCase() === searchQuery.trim().toLowerCase() || r.id === searchQuery.trim()
    );
    if (found) {
      setSelectedTrackingId(found.id);
    }
  };

  const handleCopyShareLink = () => {
    if (!currentOrder) return;
    const shareText = `Antalya Şehir İçi Teslimat 7/24 - Paket Takip Numarası: ${currentOrder.trackingCode}\nDurum: ${currentOrder.status}\nAlış: ${currentOrder.sender.district}\nTeslim: ${currentOrder.receiver.district}`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    rateDelivery(currentOrder.id, ratingVal, feedbackText);
    setRatingSubmitted(true);
  };

  // Status mapping for progress timeline
  const getStatusStepIndex = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending_pool':
        return 0;
      case 'courier_assigned':
        return 1;
      case 'picked_up':
        return 2;
      case 'near_destination':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = currentOrder ? getStatusStepIndex(currentOrder.status) : 0;

  const steps = [
    { title: 'Talep Alındı', desc: 'Kurye havuzunda eşleşiyor' },
    { title: 'Kurye Atandı', desc: 'Paketi almaya gidiyor' },
    { title: 'Paket Alındı', desc: 'Teslimat adresine yolda' },
    { title: 'Adrese Ulaşıldı', desc: 'Kapıda teslim aşaması' },
    { title: 'Teslim Edildi', desc: 'Alıcıya ulaştırıldı' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-orange-600" />
            Canlı Paket ve Kurye Takip Ekranı
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sipariş takip numarasını girerek paketin anlık konumunu ve durumunu izleyin.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Takip No (Örn: ANT-9842)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 uppercase font-mono font-semibold focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Sorgula
          </button>
        </form>
      </div>

      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Order Details & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card & Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                      {currentOrder.trackingCode}
                    </span>
                    {currentOrder.urgency === 'express_vip' && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                        ⚡ VIP Jet Moto
                      </span>
                    )}
                    {currentOrder.status === 'cancelled' && (
                      <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                        ✕ İptal Edildi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Oluşturulma: {new Date(currentOrder.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • Antalya İçi
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => setConfirmCancelOpen(true)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Siparişi İptal Et</span>
                    </button>
                  )}

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium block">Tahmini Varış Süresi</span>
                    <span className="text-2xl font-black text-orange-600">
                      {currentOrder.status === 'delivered' ? 'Tamamlandı' : currentOrder.status === 'cancelled' ? 'İptal' : `${currentOrder.estimatedDurationMins} Dakika`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Timeline or Cancelled Notice */}
              {currentOrder.status === 'cancelled' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Bu sipariş iptal edilmiştir. Yeni bir gönderi için ana sayfadan veya müşteri panelinden talep oluşturabilirsiniz.</span>
                </div>
              ) : (
                <div className="relative mb-6">
                  <div className="hidden sm:grid grid-cols-5 gap-2 text-center relative z-10">
                    {steps.map((step, idx) => {
                      const isDone = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 ${
                              isDone
                                ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                                : 'bg-slate-100 text-slate-400'
                            } ${isCurrent ? 'animate-pulse' : ''}`}
                          >
                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <span className={`text-xs font-bold mt-2 ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar line */}
                  <div className="hidden sm:block absolute top-4.5 left-8 right-8 h-1 bg-slate-100 -z-0">
                    <div
                      className="h-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {/* Mobile vertical status */}
                  <div className="sm:hidden space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs">
                      <span className="font-bold text-orange-900 block">Güncel Durum:</span>
                      <p className="text-orange-800 font-medium mt-0.5">
                        {steps[currentStep]?.title} - {steps[currentStep]?.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Address Route Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Güzergah ve Adres Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Sender */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-700 uppercase tracking-wider text-[11px] mb-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Alış Adresi
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {currentOrder.sender.district} - {currentOrder.sender.neighborhood}
                  </p>
                  <p className="text-slate-600">{currentOrder.sender.addressDetail}</p>
                  <p className="text-slate-500 pt-2 border-t border-slate-200 mt-2">
                    Gönderici: <span className="font-semibold text-slate-700">{currentOrder.sender.contactName}</span> ({currentOrder.sender.contactPhone})
                  </p>
                </div>

                {/* Receiver */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 uppercase tracking-wider text-[11px] mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Teslimat Adresi
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {currentOrder.receiver.district} - {currentOrder.receiver.neighborhood}
                  </p>
                  <p className="text-slate-600">{currentOrder.receiver.addressDetail}</p>
                  <p className="text-slate-500 pt-2 border-t border-slate-200 mt-2">
                    Alıcı: <span className="font-semibold text-slate-700">{currentOrder.receiver.contactName}</span> ({currentOrder.receiver.contactPhone})
                  </p>
                </div>
              </div>

              {/* Package summary info */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>İçerik: <strong className="text-slate-800">{currentOrder.packageName}</strong> ({currentOrder.packageWeightKg} kg)</span>
                </div>
                <div>
                  <span>Tutar: <strong className="text-slate-900 text-sm">{currentOrder.price} ₺</strong> ({currentOrder.isPaid ? 'Online Ödendi' : 'Kapıda Ödeme'})</span>
                </div>
              </div>
            </div>

            {/* Live Map Preview */}
            <AntalyaMap highlightedOrderId={currentOrder.id} />
          </div>

          {/* Right 1 Column: Courier Info, Actions & Rating */}
          <div className="space-y-6">
            {/* Courier Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-blue-600" />
                Atanan Kurye Bilgileri
              </h3>

              {currentOrder.assignedCourier ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                      {currentOrder.assignedCourier.name.split(' ')[0][0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-100 text-sm">
                        {currentOrder.assignedCourier.name}
                      </h4>
                      <p className="text-xs text-emerald-300/80 font-mono">
                        {currentOrder.assignedCourier.phone}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mt-0.5">
                        ⭐ {currentOrder.assignedCourier.rating} ({currentOrder.assignedCourier.totalDeliveries} teslimat)
                      </div>
                    </div>
                  </div>

                  {/* Call and WhatsApp Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${currentOrder.assignedCourier.phone}`}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Ara
                    </a>
                    <a
                      href={`https://wa.me/90${currentOrder.assignedCourier.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 animate-spin">
                    <Bike className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 block">Kurye Aranıyor...</span>
                  Talebiniz Antalya kurye havuzunda en yakın sürücüye iletildi.
                </div>
              )}
            </div>

            {/* Share link card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-600" />
                Takip Bilgisini Paylaş
              </h3>
              <p className="text-xs text-slate-500">
                Alıcı veya göndericiye kargo takip kodunu tek tıkla iletin.
              </p>

              <button
                onClick={handleCopyShareLink}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Takip Metnini Kopyala
                  </>
                )}
              </button>
            </div>

            {/* Delivery Rating when completed */}
            {currentOrder.status === 'delivered' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Teslimatı Değerlendirin
                </h3>

                {currentOrder.customerRating || ratingSubmitted ? (
                  <div className="text-xs text-emerald-900 font-medium">
                    <p className="flex items-center gap-1 text-amber-600 font-bold mb-1">
                      {'★'.repeat(currentOrder.customerRating || ratingVal)} Puanınız Kaydedildi!
                    </p>
                    <p className="text-slate-600">Geri bildiriminiz için teşekkür ederiz.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="space-y-3">
                    <div className="flex gap-1 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingVal(star)}
                          className="text-2xl transition hover:scale-110 cursor-pointer"
                        >
                          <span className={star <= ratingVal ? 'text-amber-500' : 'text-slate-300'}>★</span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Kurye veya hız hakkında yorumunuz..."
                      className="w-full text-xs bg-white border border-emerald-200 rounded-xl p-2.5 text-slate-800 outline-hidden"
                    />

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Puanı Kaydet
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-600">Sipariş bulunamadı. Lütfen takip kodunuzu kontrol ediniz.</p>
        </div>
      )}
      {/* Confirmation Modal for Customer Cancellation */}
      {confirmCancelOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Siparişi İptal Et</h3>
                <p className="text-xs text-slate-500">{currentOrder.trackingCode} numaralı sipariş</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bu siparişi iptal etmek istediğinizden emin misiniz? Sipariş sistemden kaldırılacak ve atanmış kurye bilgilendirilecektir.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelRequest(currentOrder.id);
                  setConfirmCancelOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm"
              >
                Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

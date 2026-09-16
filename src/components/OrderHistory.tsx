import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  MapPin, 
  Navigation, 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Bike
} from 'lucide-react';
import { DeliveryRequest, DeliveryStatus } from '../types';
import { useDelivery } from '../context/DeliveryContext';
import { ReceiptModal } from './ReceiptModal';

export const OrderHistory: React.FC = () => {
  const { requests, currentUser, setSelectedTrackingId, setCurrentView } = useDelivery();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DeliveryRequest | null>(null);

  // Restore last customer order ID & contact phone for guest sessions
  const lastSavedOrderId = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_order_id') : null;
  const lastSavedPhone = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_phone') : null;

  // Strict data isolation:
  // - Couriers only see their own deliveries (assigned or delivered)
  // - Customers only see their own placed orders
  // - Admin can inspect all orders
  const userSpecificRequests = React.useMemo(() => {
    if (currentUser.role === 'admin') {
      return requests;
    }

    if (currentUser.role === 'courier') {
      return requests.filter(
        (r) =>
          r.assignedCourier?.id === currentUser.id ||
          r.courier?.id === currentUser.id ||
          (Boolean(currentUser.phone) &&
            (r.assignedCourier?.phone === currentUser.phone || r.courier?.phone === currentUser.phone))
      );
    }

    // Customer or Guest:
    if (currentUser.id !== 'user-guest-01') {
      return requests.filter((r) => {
        const matchesUserId = r.senderUserId === currentUser.id;
        const matchesPhone = Boolean(currentUser.phone) && r.sender?.contactPhone === currentUser.phone;
        const matchesEmail = Boolean(currentUser.email) && r.sender?.contactName === currentUser.name;
        const matchesSession = (Boolean(lastSavedOrderId) && r.id === lastSavedOrderId) ||
          (Boolean(lastSavedPhone) && r.sender?.contactPhone === lastSavedPhone);
        return matchesUserId || matchesPhone || matchesEmail || matchesSession;
      });
    }

    // Guest user: strictly only orders created in this browser session
    return requests.filter(
      (r) =>
        (Boolean(lastSavedOrderId) && r.id === lastSavedOrderId) ||
        (Boolean(lastSavedPhone) && r.sender?.contactPhone === lastSavedPhone)
    );
  }, [requests, currentUser, lastSavedOrderId, lastSavedPhone]);

  const filtered = userSpecificRequests.filter((req) => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (req.trackingCode || '').toLowerCase().includes(q) ||
        (req.packageName || '').toLowerCase().includes(q) ||
        (req.sender?.contactName || '').toLowerCase().includes(q) ||
        (req.receiver?.contactName || '').toLowerCase().includes(q) ||
        (req.sender?.district || '').toLowerCase().includes(q) ||
        (req.receiver?.district || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending_pool':
        return <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Havuzda Bekliyor</span>;
      case 'courier_assigned':
        return <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Kurye Yolda (Alış)</span>;
      case 'picked_up':
        return <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Dağıtımda (Varışa Gidiyor)</span>;
      case 'near_destination':
        return <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Teslimat Adresinde</span>;
      case 'delivered':
        return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Teslim Edildi</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-700" />
              {currentUser.role === 'courier'
                ? `Kurye Teslimat Geçmişim (${currentUser.name})`
                : currentUser.role === 'admin'
                ? 'Tüm Siparişler ve Teslimat Geçmişi (Yönetici Paneli)'
                : `Sipariş ve Teslimat Geçmişim (${currentUser.name})`}
            </h2>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Kişiye Özel Kayıtlar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === 'courier'
              ? 'Yalnızca sizin üstlendiğiniz ve alıcıya ulaştırdığınız kurye teslimatları listelenmektedir. Diğer kuryelerin geçmiş teslimatları gizlidir.'
              : currentUser.role === 'admin'
              ? 'Yönetici erişimi: Sistem genelindeki tüm siparişler ve teslimat hareketleri.'
              : 'Yalnızca tarafınızca oluşturulan ve size ait teslimat kayıtları listelenmektedir. Diğer müşterilerin siparişleri gizlidir.'}
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kod, kişi veya ilçe ara..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-hidden font-medium focus:bg-white focus:border-orange-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-hidden font-semibold cursor-pointer"
          >
            <option value="all">Tüm Durumlar ({userSpecificRequests.length})</option>
            <option value="pending_pool">Havuzda Bekleyen</option>
            <option value="picked_up">Dağıtımda Olan</option>
            <option value="delivered">Teslim Edilenler</option>
          </select>
        </div>
      </div>

      {/* Orders List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aradığınız kriterlere uygun sipariş bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {req.trackingCode}
                    </span>
                    {getStatusBadge(req.status)}
                    <span className="text-xs font-semibold text-slate-900">{req.packageName}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>{req.sender.district} ({req.sender.neighborhood})</span>
                    </div>
                    <span>➔</span>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-blue-500" />
                      <span>{req.receiver.district} ({req.receiver.neighborhood})</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium">{req.estimatedDistanceKm} km</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('tr-TR')} {new Date(req.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Right price & action buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 block">{req.price} ₺</span>
                    <span className="text-[10px] text-slate-500 block">
                      {req.isPaid ? 'Online Ödendi' : 'Kapıda'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedTrackingId(req.id);
                        setCurrentView('tracker');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Takip
                    </button>

                    <button
                      onClick={() => setSelectedReceiptOrder(req)}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Fiş
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};

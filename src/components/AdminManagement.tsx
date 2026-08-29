import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  Eye,
  Search,
  Filter,
  Shield,
  Bike,
  Plus,
  X,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  DollarSign,
  Package,
  Activity
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, DeliveryRequest, DeliveryStatus, UserAccount } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';
import { ReceiptModal } from './ReceiptModal';

export const AdminManagement: React.FC = () => {
  const {
    currentUser,
    users,
    courierUsers,
    addCourier,
    deleteCourier,
    updateCourier,
    requests,
    poolRequests,
    acceptRequest,
    cancelRequest,
    updateStatus,
    setSelectedTrackingId,
    setCurrentView,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetDefaultData,
    switchUser,
    activeStats,
  } = useDelivery();

  const [activeTab, setActiveTab] = useState<'couriers' | 'orders' | 'system'>('orders');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DeliveryRequest | null>(null);

  // Add Courier Modal State
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierPassword, setCourierPassword] = useState('1234');
  const [courierDistrict, setCourierDistrict] = useState<DistrictName>('Muratpaşa');
  const [addCourierError, setAddCourierError] = useState<string | null>(null);
  const [addCourierSuccess, setAddCourierSuccess] = useState<string | null>(null);

  // Delete Courier Confirmation Modal State
  const [deletingCourier, setDeletingCourier] = useState<UserAccount | null>(null);

  // Assign Courier Modal State
  const [assigningOrder, setAssigningOrder] = useState<DeliveryRequest | null>(null);
  const [selectedCourierForAssign, setSelectedCourierForAssign] = useState<string>('');

  // Handle Add Courier Form
  const handleAddCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCourierError(null);
    setAddCourierSuccess(null);

    if (!courierName.trim()) {
      setAddCourierError('Lütfen kurye ad ve soyadını giriniz.');
      return;
    }
    if (!courierPhone.trim()) {
      setAddCourierError('Lütfen kurye telefon numarasını giriniz.');
      return;
    }
    if (!courierEmail.trim()) {
      setAddCourierError('Lütfen kurye e-posta adresini giriniz.');
      return;
    }

    try {
      const created = addCourier({
        name: courierName.trim(),
        phone: courierPhone.trim(),
        email: courierEmail.trim(),
        password: courierPassword.trim() || '1234',
        district: courierDistrict,
      });

      setAddCourierSuccess(`${created.name} başarıyla sisteme kurye olarak eklendi.`);
      setCourierName('');
      setCourierPhone('');
      setCourierEmail('');
      setCourierPassword('1234');
      setTimeout(() => {
        setIsAddCourierOpen(false);
        setAddCourierSuccess(null);
      }, 1000);
    } catch (err: any) {
      setAddCourierError(err?.message || 'Kurye eklenirken bir hata oluştu.');
    }
  };

  // Handle Delete Courier
  const handleConfirmDeleteCourier = () => {
    if (deletingCourier) {
      deleteCourier(deletingCourier.id);
      setDeletingCourier(null);
    }
  };

  // Handle Manual Assign
  const handleConfirmAssign = () => {
    if (assigningOrder && selectedCourierForAssign) {
      acceptRequest(assigningOrder.id, selectedCourierForAssign);
      setAssigningOrder(null);
      setSelectedCourierForAssign('');
    }
  };

  // Filtered Orders
  const filteredOrders = requests.filter((req) => {
    if (orderStatusFilter !== 'all' && req.status !== orderStatusFilter) return false;
    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
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

  // Calculate Total Revenue
  const totalRevenue = requests
    .filter((r) => r.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] rounded-3xl border border-emerald-800/60 p-5 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Antalya Kurye Yönetim Paneli
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-md uppercase">
                Yönetici
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Kurye ekleme & silme, canlı havuz ve paket sipariş denetim merkezi.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs">
          <div className="bg-[#011410] px-3.5 py-2 rounded-2xl border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400/80 block">Kurye Sayısı</span>
            <strong className="text-sm sm:text-base font-black text-white">{courierUsers.length} Kurye</strong>
          </div>
          <div className="bg-[#011410] px-3.5 py-2 rounded-2xl border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400/80 block">Havuzda Bekleyen</span>
            <strong className="text-sm sm:text-base font-black text-amber-400">{poolRequests.length} Sipariş</strong>
          </div>
          <div className="bg-[#011410] px-3.5 py-2 rounded-2xl border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400/80 block">Toplam Sipariş</span>
            <strong className="text-sm sm:text-base font-black text-teal-300">{requests.length} Adet</strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('couriers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'couriers'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Kurye Yönetimi ({courierUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tüm Siparişler & Havuz ({requests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'system'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sistem & Yedekleme</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: KURYE YÖNETİMİ (KURYE EKLEME VE SİLME) */}
      {/* ===================================================================== */}
      {activeTab === 'couriers' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-[#021d17] p-4 sm:p-5 rounded-3xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Bike className="w-5 h-5 text-emerald-400" />
                <span>Sistemdeki Kuryeler ({courierUsers.length})</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Antalya bölgesinde çalışan kuryelerin listesi, durumları ve yönetim işlemleri.
              </p>
            </div>

            {/* "+ Yeni Kurye Ekle" Primary Action */}
            <button
              type="button"
              onClick={() => {
                setAddCourierError(null);
                setAddCourierSuccess(null);
                setIsAddCourierOpen(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Yeni Kurye Ekle</span>
            </button>
          </div>

          {/* Courier List Cards / Grid */}
          {courierUsers.length === 0 ? (
            <div className="bg-[#021f19] rounded-3xl border border-emerald-800/60 p-10 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center">
                <Bike className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Kayıtlı Kurye Bulunmuyor</h4>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                Sisteme yeni bir kurye eklemek için yukarıdaki "+ Yeni Kurye Ekle" butonunu kullanabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setIsAddCourierOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + İlk Kuryeyi Tanımla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courierUsers.map((courier) => (
                <div
                  key={courier.id}
                  className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-700/60 hover:border-emerald-400 transition p-5 flex flex-col justify-between gap-4 text-white shadow-xl"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-emerald-800/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                          {courier.name.split(' ')[0][0]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">
                            {courier.name}
                          </h4>
                          <span className="text-[11px] text-emerald-300/80 font-medium">
                            {courier.district || 'Antalya'}
                          </span>
                        </div>
                      </div>

                      {/* Online status indicator */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Aktif
                      </span>
                    </div>

                    {/* Contact & Details (No motor model, no plate) */}
                    <div className="bg-[#011410] p-3 rounded-2xl border border-emerald-800/40 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-emerald-300/90">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono">{courier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300/90 truncate">
                        <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{courier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300/90">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Bölge: <strong>{courier.district || 'Muratpaşa'}</strong></span>
                      </div>
                    </div>

                    {/* Earnings & Total Deliveries */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#011914] p-2.5 rounded-xl border border-emerald-800/30">
                        <span className="text-[10px] text-emerald-400/80 block">Toplam Teslimat</span>
                        <strong className="text-sm font-bold text-white">{courier.totalOrders || 0} Adet</strong>
                      </div>
                      <div className="bg-[#011914] p-2.5 rounded-xl border border-emerald-800/30">
                        <span className="text-[10px] text-emerald-400/80 block">Kazanılan Tutar</span>
                        <strong className="text-sm font-bold text-amber-400">{courier.totalEarnings || 0} ₺</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Delete Courier & Switch to Courier */}
                  <div className="pt-3 border-t border-emerald-800/50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        switchUser(courier.id);
                        setCurrentView('courier');
                      }}
                      className="px-3 py-2 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Kurye Olarak Gör</span>
                    </button>

                    {/* Delete Courier Button */}
                    <button
                      type="button"
                      onClick={() => setDeletingCourier(courier)}
                      title="Kuryeyi Sistemden Sil"
                      className="p-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TÜM SİPARİŞLER VE HAVUZ DENETİMİ */}
      {/* ===================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">

          {/* Dedicated Live Pool Alert Box (Visible whenever there are orders waiting for courier) */}
          {poolRequests.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/80 via-[#032a21] to-[#021f19] p-4 sm:p-5 rounded-3xl border-2 border-amber-500/70 shadow-2xl text-white space-y-3 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                  <h3 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-2">
                    <span>🔴 CANLI KURYE HAVUZU: {poolRequests.length} Yeni Müşteri Talebi Bekliyor</span>
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-amber-200 bg-amber-900/60 px-3 py-1 rounded-xl border border-amber-500/40">
                  Otomatik Canlı Takip Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {poolRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#011410] p-4 rounded-2xl border border-amber-500/40 hover:border-amber-400 transition flex flex-col justify-between gap-3 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black bg-amber-950 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/50">
                          {req.trackingCode}
                        </span>
                        <span className="text-xs font-black text-amber-400">{req.price} ₺</span>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-200">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-bold">Alış: {req.sender.district}</span>
                          <span className="text-emerald-400/80">({req.sender.contactName} - {req.sender.contactPhone})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-teal-200">
                          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-bold">Teslim: {req.receiver.district}</span>
                          <span className="text-teal-400/80">({req.receiver.contactName} - {req.receiver.contactPhone})</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic pt-1 truncate">
                          Paket: {req.packageName} ({req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'})
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningOrder(req);
                          setSelectedCourierForAssign(courierUsers[0]?.id || '');
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Kuryeye Ata</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(req)}
                        className="px-3 py-2 bg-[#021f19] hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        İrsaliye
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-[#021d17] p-4 sm:p-5 rounded-3xl border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>Tüm Sipariş Listesi & İrsaliyeler ({filteredOrders.length})</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Oluşturulan tüm paketler, atanan kuryeler ve teslimat durumları.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  placeholder="Kod, kişi veya ilçe..."
                  className="bg-[#011410] border border-emerald-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-emerald-500/70 outline-hidden font-medium focus:border-emerald-400"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-emerald-200 outline-hidden font-semibold cursor-pointer"
              >
                <option value="all">Tüm Durumlar ({requests.length})</option>
                <option value="pending_pool">Havuzda Bekleyen ({poolRequests.length})</option>
                <option value="courier_assigned">Kurye Atandı</option>
                <option value="picked_up">Dağıtımda / Yolda</option>
                <option value="delivered">Teslim Edilenler</option>
                <option value="cancelled">İptal Edilenler</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#021f19] rounded-3xl border border-emerald-800/60 overflow-hidden shadow-xl">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-emerald-300/70">
                Aradığınız kriterlere uygun sipariş kaydı bulunamadı.
              </div>
            ) : (
              <div className="divide-y divide-emerald-800/40 text-white">
                {filteredOrders.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 hover:bg-[#032820] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black bg-[#011410] text-amber-400 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                          {req.trackingCode}
                        </span>
                        
                        {req.status === 'pending_pool' && (
                          <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/60 px-2 py-0.5 rounded-full">
                            🛵 Havuzda Bekliyor
                          </span>
                        )}
                        {req.status === 'courier_assigned' && (
                          <span className="text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600/60 px-2 py-0.5 rounded-full">
                            🏍️ Kurye Yolda (Alış)
                          </span>
                        )}
                        {req.status === 'picked_up' && (
                          <span className="text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-600/60 px-2 py-0.5 rounded-full">
                            📦 Dağıtımda (Varışa Gidiyor)
                          </span>
                        )}
                        {req.status === 'delivered' && (
                          <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full">
                            ✓ Teslim Edildi
                          </span>
                        )}
                        {req.status === 'cancelled' && (
                          <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/60 px-2 py-0.5 rounded-full">
                            ✕ İptal Edildi
                          </span>
                        )}

                        <span className="text-xs font-bold text-emerald-100">{req.packageName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-300/80">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{req.sender.district}</span>
                        </div>
                        <span>➔</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-400" />
                          <span>{req.receiver.district}</span>
                        </div>
                        <span className="text-emerald-700">•</span>
                        <span>{req.estimatedDistanceKm} km</span>
                        <span className="text-emerald-700">•</span>
                        <span className="text-emerald-400/90 font-medium">
                          Kurye: {req.assignedCourier ? req.assignedCourier.name : 'Henüz Atanmadı'}
                        </span>
                      </div>
                    </div>

                    {/* Right Actions & Price */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-amber-400 block">{req.price} ₺</span>
                        <span className="text-[10px] text-emerald-400/70 block">
                          {req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Manuel Kurye Ata (if pending) */}
                        {req.status === 'pending_pool' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAssigningOrder(req);
                              setSelectedCourierForAssign(courierUsers[0]?.id || '');
                            }}
                            className="px-2.5 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700/60 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Kurye Ata</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrackingId(req.id);
                            setCurrentView('tracker');
                          }}
                          className="px-2.5 py-1.5 bg-[#011410] hover:bg-[#022019] text-emerald-200 border border-emerald-700/60 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Takip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(req)}
                          className="px-2.5 py-1.5 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Fiş</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SİSTEM, RAPORLAR & YEDEKLEME */}
      {/* ===================================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Revenue and KPI stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Toplam Sipariş Hacmi</span>
              <p className="text-2xl font-black text-white">{requests.length} Sipariş</p>
              <span className="text-[10px] text-emerald-300">Antalya içi tüm teslimatlar</span>
            </div>

            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Kayıtlı Aktif Kurye</span>
              <p className="text-2xl font-black text-emerald-400">{courierUsers.length} Kurye</p>
              <span className="text-[10px] text-emerald-300">Sistemde tanımlı sürücüler</span>
            </div>

            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Teslim Edilenler</span>
              <p className="text-2xl font-black text-teal-300">
                {requests.filter((r) => r.status === 'delivered').length} Paket
              </p>
              <span className="text-[10px] text-emerald-300">Başarıyla ulaştırıldı</span>
            </div>

            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Tamamlanan Toplam Gelir</span>
              <p className="text-2xl font-black text-amber-400">{totalRevenue} ₺</p>
              <span className="text-[10px] text-amber-300/80">Tamamlanan sipariş tutarı</span>
            </div>
          </div>

          {/* Database Backup & Reset Operations */}
          <div className="bg-[#021d17] p-6 rounded-3xl border border-emerald-800/60 text-white space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Veritabanı Yönetimi & Yedekleme</span>
            </h3>
            <p className="text-xs text-emerald-300/80">
              Sistemdeki kuryeleri, siparişleri ve ayarları JSON formatında yedekleyebilir veya geri yükleyebilirsiniz.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={exportDatabaseBackup}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Veritabanı Yedeği İndir (JSON)</span>
              </button>

              <button
                type="button"
                onClick={resetDefaultData}
                className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Verileri Sıfırla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD NEW COURIER MODAL */}
      {/* ===================================================================== */}
      {isAddCourierOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-5 sm:p-7 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsAddCourierOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/40 shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Yeni Kurye Ekle</h3>
                <p className="text-xs text-emerald-300/80">Antalya kurye sistemine yeni sürücü tanımlayın.</p>
              </div>
            </div>

            {addCourierError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addCourierError}</span>
              </div>
            )}

            {addCourierSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{addCourierSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddCourierSubmit} className="space-y-4 text-xs">
              {/* Ad Soyad */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Kurye Adı ve Soyadı *</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="0544 111 22 33"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* E-posta */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">E-posta Adresi (Giriş İçin) *</label>
                <input
                  type="email"
                  required
                  value={courierEmail}
                  onChange={(e) => setCourierEmail(e.target.value)}
                  placeholder="ahmet@antalyakurye.com"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Şifre */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Kurye Giriş Şifresi</label>
                <input
                  type="text"
                  value={courierPassword}
                  onChange={(e) => setCourierPassword(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* Çalışma Bölgesi (İlçe) */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Çalışma Bölgesi (İlçe)</label>
                <select
                  value={courierDistrict}
                  onChange={(e) => setCourierDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((districtName) => (
                    <option key={districtName} value={districtName} className="bg-[#021f19] text-white">
                      {districtName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm rounded-2xl transition shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-98"
                >
                  Kuryeyi Sisteme Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: DELETE COURIER CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      {deletingCourier && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02231c] rounded-3xl border border-rose-600/70 p-6 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-600/60 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-white">Kuryeyi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-emerald-300/80">
                <strong>{deletingCourier.name}</strong> adlı kurye sistemden tamamen silinecektir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourier(null)}
                className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteCourier}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-rose-600/40"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: ASSIGN COURIER MODAL */}
      {/* ===================================================================== */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3">
              <h3 className="font-extrabold text-sm text-white">Siparişe Kurye Ata</h3>
              <span className="font-mono text-xs text-amber-400">{assigningOrder.trackingCode}</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-emerald-200 block">Atanacak Kuryeyi Seçiniz:</label>
              <select
                value={selectedCourierForAssign}
                onChange={(e) => setSelectedCourierForAssign(e.target.value)}
                className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2.5 text-emerald-200 outline-hidden font-medium cursor-pointer"
              >
                {courierUsers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#021f19] text-white">
                    {c.name} ({c.district || 'Antalya'} - {c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleConfirmAssign}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
              >
                Görevi Ata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: RECEIPT MODAL */}
      {/* ===================================================================== */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

    </div>
  );
};

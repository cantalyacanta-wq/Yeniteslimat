import React, { useState } from 'react';
import { X, User, Bike, Shield, Check, Plus, ArrowRight, Phone, Mail, Building, MapPin } from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, UserRole } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    registerUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setCurrentView,
  } = useDelivery();

  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('switch');

  // Register Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [companyName, setCompanyName] = useState('');
  const [district, setDistrict] = useState<DistrictName>('Muratpaşa');
  const [vehicleType, setVehicleType] = useState<'Honda PCX 125' | 'Yamaha NMAX 155' | 'Elektrikli Moto' | 'Panelvan Araç'>('Honda PCX 125');
  const [plate, setPlate] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Lütfen ad ve soyad giriniz.');
      return;
    }
    if (!phone.trim()) {
      setError('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    const newUser = registerUser({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${phone.replace(/\D/g, '')}@antalyakurye.com`,
      role,
      companyName: companyName.trim() || undefined,
      district,
      vehicleType: role === 'courier' ? vehicleType : undefined,
      plate: role === 'courier' ? (plate.trim().toUpperCase() || '07 ANT 01') : undefined,
    });

    setIsAuthModalOpen(false);
    if (newUser.role === 'courier') {
      setCurrentView('courier');
    } else if (newUser.role === 'customer') {
      setCurrentView('customer');
    }
  };

  const handleSelectUser = (id: string, userRole: UserRole) => {
    switchUser(id);
    setIsAuthModalOpen(false);
    if (userRole === 'courier') {
      setCurrentView('courier');
    } else if (userRole === 'customer') {
      setCurrentView('customer');
    } else {
      setCurrentView('history');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Rol & Üyelik İşlemleri</h2>
            <p className="text-xs text-slate-500">Müşteri, Moto Kurye veya Yönetici rolü ile işlem yapın</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'switch'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mevcut Roller / Hızlı Giriş</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Üye Kaydı</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Kullanmak istediğiniz profili seçiniz:
              </p>

              <div className="space-y-2">
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  const roleColor =
                    u.role === 'customer'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : u.role === 'courier'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                  const RoleIcon =
                    u.role === 'customer' ? User : u.role === 'courier' ? Bike : Shield;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u.id, u.role)}
                      className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${roleColor}`}
                        >
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 truncate">
                              {u.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded-md">
                                <Check className="w-3 h-3" /> Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {u.role === 'customer'
                              ? `${u.companyName ? u.companyName + ' • ' : ''}${u.phone}`
                              : u.role === 'courier'
                              ? `${u.vehicleType || 'Moto Kurye'} (${u.plate || '07 ANT'}) • ${u.phone}`
                              : `Sistem Yöneticisi • ${u.phone}`}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-sky-600 shrink-0 ml-2">
                        Seç <ArrowRight className="w-3.5 h-3.5 inline" />
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Farklı bilgilerle yeni üyelik oluştur
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Üyelik Türü / Rolü Seçiniz *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      role === 'customer'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Müşteri / Gönderici</div>
                      <div className="text-[10px] text-slate-500">Paket ve kurye talebi oluştur</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('courier')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      role === 'courier'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Moto Kurye</div>
                      <div className="text-[10px] text-slate-500">Havuzdan paket al & teslim et</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ad Soyad *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Ali Yılmaz"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon Numarası *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-Posta (İsteğe bağlı)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Antalya İlçesi
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as DistrictName)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Fields based on Role */}
              {role === 'customer' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Şirket / İşletme Adı (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Örn: Yılmaz Hukuk veya Kişisel"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Kurye Aracı
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) =>
                        setVehicleType(
                          e.target.value as
                            | 'Honda PCX 125'
                            | 'Yamaha NMAX 155'
                            | 'Elektrikli Moto'
                            | 'Panelvan Araç'
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Honda PCX 125">Honda PCX 125</option>
                      <option value="Yamaha NMAX 155">Yamaha NMAX 155</option>
                      <option value="Elektrikli Moto">Elektrikli Moto</option>
                      <option value="Panelvan Araç">Panelvan Araç</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Araç Plakası
                    </label>
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      placeholder="07 ANT 99"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow transition cursor-pointer"
                >
                  Üyeliği Tamamla & Giriş Yap
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Verileriniz tarayıcınızda kalıcı olarak saklanır.</span>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

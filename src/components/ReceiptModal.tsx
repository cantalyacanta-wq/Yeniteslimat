import React from 'react';
import { X, Printer, Download, Bike, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { DeliveryRequest } from '../types';

interface ReceiptModalProps {
  order: DeliveryRequest;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Receipt Card */}
        <div id="printable-receipt" className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 tracking-tight">ANTALYA KURYE EXPRESS</h3>
                <p className="text-[10px] text-slate-500">Şehir İçi Hızlı Taşıma & Teslimat Belgesi</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono">BELGE NO:</span>
              <p className="font-mono font-bold text-xs text-slate-900">{order.trackingCode}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tarih / Saat</span>
                <span className="font-medium text-slate-800">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')} - {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hizmet Türü</span>
                <span className="font-bold text-orange-600">
                  {order.urgency === 'express_vip' ? 'VIP Jet Moto Kurye' : 'Standart Moto Kurye'}
                </span>
              </div>
            </div>

            {/* Sender & Receiver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-orange-600 font-bold uppercase block mb-1">Gönderici / Alış</span>
                <p className="font-bold text-slate-900">{order.sender.district} ({order.sender.neighborhood})</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{order.sender.addressDetail}</p>
                <p className="text-slate-500 text-[10px] mt-1">{order.sender.contactName} - {order.sender.contactPhone}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Alıcı / Teslimat</span>
                <p className="font-bold text-slate-900">{order.receiver.district} ({order.receiver.neighborhood})</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{order.receiver.addressDetail}</p>
                <p className="text-slate-500 text-[10px] mt-1">{order.receiver.contactName} - {order.receiver.contactPhone}</p>
              </div>
            </div>

            {/* Package & Courier */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Paket İçeriği:</span>
                <span className="font-medium text-slate-800">{order.packageName} ({order.packageWeightKg} kg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kurye Sürücüsü:</span>
                <span className="font-medium text-slate-800">
                  {order.assignedCourier ? `${order.assignedCourier.name} (${order.assignedCourier.phone})` : 'Havuzda Bekliyor'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mesafe:</span>
                <span className="font-medium text-slate-800">{order.estimatedDistanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ödeme Şekli:</span>
                <span className="font-medium text-slate-800">
                  {order.paymentMethod === 'alici_odemeli'
                    ? 'Alıcı Ödemeli (Teslimatta Ödeme)'
                    : order.paymentMethod === 'gonderici_odemeli'
                    ? 'Gönderici Ödemeli (Alışta Ödeme)'
                    : order.paymentMethod === 'online_credit_card'
                    ? 'Online Kredi Kartı'
                    : order.paymentMethod === 'cash_on_delivery'
                    ? 'Kapıda Nakit'
                    : 'Kapıda Kredi Kartı'}
                </span>
              </div>
            </div>

            {/* Total Fee */}
            <div className="bg-slate-900 text-white p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hizmet Bedeli</span>
                <span className="text-xs text-slate-300">KDV Dahil Net Tutar</span>
              </div>
              <span className="text-2xl font-black text-white">{order.price} ₺</span>
            </div>

            {/* Verification Stamp */}
            <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Elektronik Doğrulanmış Taşıma İrsaliyesi</span>
              </div>
              <span className="font-mono text-slate-500">Antalya Kurye Express</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Yazdır / PDF Kaydet
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

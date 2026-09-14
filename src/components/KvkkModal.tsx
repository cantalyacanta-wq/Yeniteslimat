import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { KVKK_TEXT } from '../data/kvkkText';

interface KvkkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const KvkkModal: React.FC<KvkkModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0c221a] via-[#081813] to-[#040e0b] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-emerald-600/80 space-y-4 text-white my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">KVKK Aydınlatma Metni</h3>
              <p className="text-[11px] text-emerald-400 font-medium">6698 Sayılı Kanun Kapsamında Bilgilendirme</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Document Text */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#02130e] rounded-2xl border border-emerald-900/80 text-xs text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-wrap select-text">
          {KVKK_TEXT}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="text-[11px] text-emerald-300/80">
            Kişisel verileriniz 6698 sayılı Kanun'a uygun olarak güvence altındadır.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Kapat
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Okudum ve Kabul Ediyorum</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

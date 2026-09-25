import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, Share2, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  showApkOption?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  showApkOption = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold ${className}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>Uygulama Yüklü</span>
      </div>
    );
  }

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {isInstallable ? (
          <button
            onClick={install}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/40 transition active:scale-95"
            title="Uygulamayı Cihazınıza Yükleyin"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Uygulamayı Yükle</span>
          </button>
        ) : isIOS ? (
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>iOS'a Yükle</span>
          </button>
        ) : showApkOption ? (
          <a
            href="/downloads/Antalya-Kurye-Talep-Havuzu.apk"
            download="Antalya-Kurye-Talep-Havuzu.apk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 text-slate-200 hover:text-white text-xs font-medium transition"
            title="Kurye Android APK İndir"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>APK İndir</span>
          </a>
        ) : null}
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-500" />
                iPhone / iPad'e Yükleme
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0">1</span>
                <span>Safari tarayıcısında alttaki <Share2 className="inline w-3.5 h-3.5 text-blue-400 mx-1" /> <strong>Paylaş</strong> düğmesine dokunun.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0">2</span>
                <span>Açılan menüde aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0">3</span>
                <span>Sağ üstteki <strong>"Ekle"</strong> butonuna basarak uygulamayı anında kullanmaya başlayın.</span>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

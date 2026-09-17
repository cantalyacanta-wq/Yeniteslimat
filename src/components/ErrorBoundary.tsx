import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, PhoneCall } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UNCAUGHT REACT ERROR]', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#021814] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#052019] border border-emerald-600/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Bir Görüntüleme Hatası Oluştu</h2>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Uygulama çalışırken beklenmedik bir durum oluştu. Lütfen sayfayı yenileyiniz veya doğrudan ana sayfaya dönünüz.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/40 border border-emerald-900 rounded-xl text-[11px] font-mono text-emerald-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sayfayı Yenile ve Ana Ekrana Dön</span>
              </button>

              <a
                href="tel:05077547484"
                className="w-full py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Destek Hattı: 0507 754 74 84</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}

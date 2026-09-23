import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageSquare, Star, CheckCircle, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { DeliveryRequest } from '../types';

interface AnimatedCourierSpeechBubbleProps {
  order: DeliveryRequest;
  onCallCourier?: () => void;
}

export const AnimatedCourierSpeechBubble: React.FC<AnimatedCourierSpeechBubbleProps> = ({
  order,
}) => {
  const courier = order.assignedCourier;
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  // Play a soft greeting audio chime when courier is first assigned
  useEffect(() => {
    if (courier && !hasPlayedChime) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
          // Wait for user interaction or silently skip
        } else {
          const now = audioCtx.currentTime;
          // Soft cheerful two-tone chime (F5 -> A5)
          const osc1 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(698.46, now); // F5
          osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
          gain1.gain.setValueAtTime(0.08, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc1.connect(gain1);
          gain1.connect(audioCtx.destination);
          osc1.start(now);
          osc1.stop(now + 0.4);
        }
      } catch {
        // AudioContext not allowed or unsupported
      }
      setHasPlayedChime(true);
    }
  }, [courier, hasPlayedChime]);

  if (!courier) return null;

  const courierName = courier.name || 'Kuryemiz';
  const courierFirstName = courierName.split(' ')[0];
  const phoneClean = courier.phone ? courier.phone.replace(/[^0-9]/g, '') : '';
  const waPhone = phoneClean.startsWith('90')
    ? phoneClean
    : phoneClean.length === 10
    ? `90${phoneClean}`
    : phoneClean.length === 11 && phoneClean.startsWith('0')
    ? `9${phoneClean}`
    : `90${phoneClean}`;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#023326] via-[#034433] to-[#01261d] border-2 border-emerald-500/80 rounded-3xl p-4 sm:p-6 shadow-2xl text-white my-3 animate-in zoom-in-95 duration-300">
      
      {/* Background ambient speed lines */}
      <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-300 via-emerald-400 to-transparent" />

      {/* Top Status Header */}
      <div className="flex items-center justify-between gap-2 border-b border-emerald-700/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
            Kuryeniz Talebinizi Kabul Etti!
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/50 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Yola Çıktı</span>
        </div>
      </div>

      {/* Main Interactive Stage: Animated Motor Courier & Speech Bubble */}
      <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-6">
        
        {/* Animated Motor Courier Illustration */}
        <div className="relative flex-col items-center justify-center shrink-0 flex select-none">
          
          {/* Headlight Glow Cone */}
          <div className="absolute -right-8 top-6 w-16 h-8 bg-gradient-to-r from-amber-400/40 via-amber-300/10 to-transparent -rotate-6 pointer-events-none blur-xs hidden sm:block" />

          {/* Motorcycle & Courier SVG */}
          <div className="relative animate-[bounce_1.8s_ease-in-out_infinite]">
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ground Shadow */}
              <ellipse cx="50" cy="88" rx="36" ry="4" fill="#01140e" opacity="0.6" />

              {/* Rear Wheel */}
              <g className="animate-[spin_2.5s_linear_infinite]" style={{ transformOrigin: '24px 75px' }}>
                <circle cx="24" cy="75" r="14" fill="#1f2937" stroke="#374151" strokeWidth="2.5" />
                <circle cx="24" cy="75" r="8" fill="#111827" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="24" cy="75" r="3" fill="#fbbf24" />
              </g>

              {/* Front Wheel */}
              <g className="animate-[spin_2.5s_linear_infinite]" style={{ transformOrigin: '76px 75px' }}>
                <circle cx="76" cy="75" r="14" fill="#1f2937" stroke="#374151" strokeWidth="2.5" />
                <circle cx="76" cy="75" r="8" fill="#111827" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="76" cy="75" r="3" fill="#fbbf24" />
              </g>

              {/* Motorcycle Frame & Engine */}
              <path d="M24 75 L45 72 L55 60 L76 75" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M45 72 L50 50 L68 50 L76 75" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="36" y="65" width="16" height="10" rx="3" fill="#374151" stroke="#1f2937" strokeWidth="1" />
              
              {/* Exhaust pipe with puff */}
              <path d="M30 76 L14 77" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
              <circle cx="9" cy="77" r="2.5" fill="#6ee7b7" opacity="0.7" className="animate-ping" />

              {/* Delivery Box (Rear Luggage) */}
              <rect x="14" y="44" width="18" height="18" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
              <path d="M14 50 L32 50" stroke="#b45309" strokeWidth="1" />
              <circle cx="23" cy="53" r="3" fill="#ffffff" />
              <path d="M21 53 L25 53" stroke="#b45309" strokeWidth="1" />

              {/* Handlebar & Windshield */}
              <path d="M66 48 L68 38 L62 37" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
              <path d="M69 39 L74 44" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

              {/* Front Headlight */}
              <circle cx="77" cy="49" r="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

              {/* Rider Body & Green Delivery Jacket */}
              <path d="M38 52 C38 42, 48 38, 54 44 L66 48" stroke="#047857" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M46 45 L58 48" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />

              {/* Rider Arm Reaching Handlebars */}
              <path d="M50 43 L64 45" stroke="#065f46" strokeWidth="4" strokeLinecap="round" />

              {/* Courier Helmet & Visor */}
              <circle cx="52" cy="28" r="9.5" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
              <path d="M52 25 Q60 26 60 31 Q54 32 50 31 Z" fill="#0f172a" />
              <path d="M54 26 Q59 27 59 29" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />

              {/* Friendly Waving Hand (animated) */}
              <g className="animate-[wiggle_1s_ease-in-out_infinite]" style={{ transformOrigin: '48px 36px' }}>
                <path d="M46 38 L40 30" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
                <circle cx="39" cy="28" r="3" fill="#fde68a" />
              </g>
            </svg>
          </div>

          {/* Courier Name & Rating Pill below bike */}
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-[#012019] rounded-full border border-emerald-600/60 shadow-md">
            <span className="font-extrabold text-xs text-white">{courierName}</span>
            <span className="text-[10px] text-amber-300 flex items-center font-bold">
              ★ {courier.rating?.toFixed(1) || '5.0'}
            </span>
          </div>
        </div>

        {/* SPEECH BUBBLE (Konuşma Balonu) */}
        <div className="relative flex-1 w-full">
          
          {/* Speech Bubble Pointer Tail (Desktop: points left to courier; Mobile: points up to courier) */}
          <div className="hidden md:block absolute -left-3 top-8 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-[14px] border-r-emerald-500/90 drop-shadow-sm" />
          <div className="md:hidden absolute left-1/2 -top-3 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-[12px] border-b-emerald-500/90 drop-shadow-sm" />

          {/* Speech Bubble Card */}
          <div className="bg-gradient-to-br from-[#032e23] via-[#043d2f] to-[#02281e] border-2 border-emerald-400/80 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 relative">
            
            {/* Speech Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <span>💬 Kurye Mesajı</span>
              </span>
              <span className="text-[11px] text-emerald-300/80 font-mono">
                Şimdi
              </span>
            </div>

            {/* Exact Speech Bubble Text requested by user */}
            <div className="p-3.5 bg-[#011d16]/90 rounded-2xl border border-emerald-600/50 shadow-inner">
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                “Merhaba! Ben <span className="text-amber-300 font-black underline decoration-amber-400/60 underline-offset-2">{courierName}</span>, paketinizi almaya geleceğim. Birazdan sizi arayacağım!”
              </p>
              <p className="text-xs text-emerald-300/90 mt-2 font-medium flex items-center gap-1.5">
                <span>📍</span>
                <span>Kuryeniz adresinize doğru hareket etmektedir. Lütfen telefonunuzu açık tutunuz.</span>
              </p>
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {courier.phone && (
                <a
                  href={`tel:${courier.phone}`}
                  className="flex-1 min-w-[140px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-700/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-emerald-400/40"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-100 animate-pulse" />
                  <span>Kuryeyi Ara ({courier.phone})</span>
                </a>
              )}

              {courier.phone && (
                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                    `Merhaba ${courierFirstName}, ${order.trackingCode} numaralı kurye teslimat talebim için yazıyorum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-teal-800 hover:bg-teal-700 text-teal-100 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-teal-500/50 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-300" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

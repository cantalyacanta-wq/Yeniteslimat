import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  MessageSquare,
  Phone,
  HelpCircle,
  Bike,
  Package,
  History,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionType?: 'new_order' | 'history' | 'whatsapp';
}

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  { label: '🛵 Nasıl Kurye Çağırırım?', query: 'Siteden nasıl kurye çağırabilirim ve paket gönderebilirim?' },
  { label: '⏱️ Teslimat Kaç Dakika?', query: 'Antalya içi kurye teslimatı ortalama kaç dakika sürer?' },
  { label: '💰 Ücretler Nasıl Hesaplanır?', query: 'Teslimat fiyatları ve ücretlendirme nasıl hesaplanıyor?' },
  { label: '📍 Hangi İlçelere Kurye Var?', query: 'Antalya\'nın hangi ilçelerine ve bölgelerine hizmet veriyorsunuz?' },
  { label: '🔍 Siparişimi Nasıl Takip Ederim?', query: 'Siparişimi ve kuryemi haritadan canlı nasıl takip edebilirim?' },
  { label: '💳 Ödeme Yöntemleri Neler?', query: 'Hangi ödeme yöntemleri geçerlidir? Kapıda nakit veya kart var mı?' },
  { label: '📞 Müşteri Hizmetleri İletişim', query: 'Yetkili müşteri temsilcisi telefon numarası ve WhatsApp hattı nedir?' },
];

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, setCurrentView } = useDelivery();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      text: `Merhaba Sayın **${currentUser.name || 'Müşterimiz'}**! 👋\n\nBen **Antalya Kurye Express Yapay Zeka Müşteri Temsilcinizim**.\n\nSitemizi nasıl kullanacağınızı, kurye çağırma adımlarını, teslimat sürelerini veya ücretleri öğrenmek için bana dilediğinizi sorabilirsiniz.\n\nAşağıdaki hazır sorulardan birine tıklayabilir veya aklınızdaki soruyu hemen yazabilirsiniz! 🛵`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/customer-support-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          userInfo: {
            name: currentUser.name,
            district: currentUser.district,
            role: currentUser.role,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Yanıt alınamadı');
      }

      const data = await res.json();
      const replyText = data.reply || 'Şu an sistem yanıt üretemedi, lütfen tekrar deneyiniz.';

      // Determine smart action button based on content
      let actionType: 'new_order' | 'history' | 'whatsapp' | undefined;
      const lowerReply = replyText.toLowerCase();
      if (lowerReply.includes('kurye çağır') || lowerReply.includes('yeni paket')) {
        actionType = 'new_order';
      } else if (lowerReply.includes('geçmiş') || lowerReply.includes('fatura') || lowerReply.includes('fiş')) {
        actionType = 'history';
      } else if (lowerReply.includes('0507') || lowerReply.includes('whatsapp') || lowerReply.includes('telefon')) {
        actionType = 'whatsapp';
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        actionType,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('AI Chat Error:', err);
      const fallbackMsg: ChatMessage = {
        id: `asst-fallback-${Date.now()}`,
        sender: 'assistant',
        text: `🛵 **Antalya Kurye Express Hızlı Bilgi:**\n\n• **Kurye Çağırmak İçin:** Üstteki yeşil **"Kurye Çağır"** butonuna basarak çıkış ve varış ilçesini seçebilirsiniz.\n• **Teslimat Süresi:** Şehir içi ortalama **30-45 dakikadır**.\n• **Canlı Destek:** Acil durumlar için **0507 754 74 84** no'lu WhatsApp hattımızdan 7/24 bize ulaşabilirsiniz.`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        actionType: 'new_order',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Sohbet sıfırlandı. Antalya Kurye platformu ile ilgili aklınıza takılan her şeyi sorabilirsiniz! 🛵',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to render bold markdown & bullet points nicely
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Bold formatting
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-extrabold text-amber-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div
      id="customer-support-ai-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#021c17] border border-emerald-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh] sm:max-h-[85vh] h-[650px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#032b22] via-[#043d30] to-[#02241c] p-4 sm:p-5 border-b border-emerald-800/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-300/40 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#021c17] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                  <span>Antalya Kurye AI Asistanı</span>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-300/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                <span>7/24 Müşteri Hizmetleri & Site Kullanım Rehberi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={clearChat}
              className="p-2 rounded-xl text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/40 transition cursor-pointer"
              title="Sohbeti Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-800/50 transition cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips Carousel */}
        <div className="bg-[#011612] px-3 sm:px-4 py-2.5 border-b border-emerald-900/60 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hızlı Sorular:</span>
          </span>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q.query)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-800/60 border border-emerald-800/60 hover:border-emerald-600 text-[11px] font-semibold text-emerald-200 hover:text-white whitespace-nowrap transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#021c17] via-[#021813] to-[#011410]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-md shadow-emerald-900/30'
                    : 'bg-[#032920] border border-emerald-700/60 text-slate-100 rounded-tl-xs shadow-lg'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Yapay Zeka Danışmanı</span>
                  </div>
                )}

                <div className="space-y-1 text-slate-100">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Optional Action Button under AI replies */}
                {msg.sender === 'assistant' && msg.actionType && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-800/60 flex flex-wrap gap-2">
                    {msg.actionType === 'new_order' && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setCurrentView('customer');
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Hemen Kurye Çağır</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    {msg.actionType === 'history' && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setCurrentView('history');
                        }}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Geçmiş Teslimatlarımı Aç</span>
                      </button>
                    )}

                    <a
                      href="https://wa.me/905077547484?text=Merhaba,%20Antalya%20Kurye%20hakkında%20bilgi%20almak%20istiyorum."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>0507 754 74 84 (WhatsApp)</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-emerald-500/70 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="bg-[#032920] border border-emerald-700/60 rounded-2xl rounded-tl-xs p-3.5 text-xs text-emerald-300 flex items-center gap-2 shadow-md">
                <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-semibold">Yapay zeka asistanı yanıt hazırlıyor</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#021f19] p-3 sm:p-4 border-t border-emerald-800/70 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Örn: Nasıl kurye çağırabilirim? Fiyatlar ne kadar?..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#011511] border border-emerald-800 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white placeholder-emerald-600/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 transition"
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
              title="Gönder"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-emerald-400/60">
            <span>💡 Sitenin kullanımı, teslimat süreleri veya fiyatları sorabilirsiniz.</span>
            <span className="hidden sm:inline font-mono">Antalya Kurye Express AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Bike,
  RotateCcw,
  Headphones,
  Navigation,
  Phone,
  Package,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { DistrictName } from '../types';
import { unlockAudioContext } from '../utils/audio';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

// Strict sanitizer to completely prevent 'harika', 'acaba', and any email/code mentions
const cleanAssistantSpeech = (text: string): string => {
  if (!text) return text;
  let res = text
    .replace(/\b(harika|acaba)\b[.,!?]?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = res.toLowerCase();
  if (
    lower.includes('mail') ||
    lower.includes('e-posta') ||
    lower.includes('eposta') ||
    lower.includes('onay kodu') ||
    lower.includes('güvenlik kodu') ||
    lower.includes('doğrulama kodu') ||
    lower.includes('kodunuz') ||
    lower.includes('4 haneli') ||
    lower.includes('kodu gir') ||
    lower.includes('kodu söyle')
  ) {
    res = 'Onaylıyorsanız adresinize hemen en yakın kuryeyi yönlendireceğim.';
  }

  if (res.length > 0) {
    res = res.charAt(0).toUpperCase() + res.slice(1);
  }
  return res;
};

interface ConversationState {
  step: 'greeting' | 'ask_pickup' | 'ask_destination' | 'ask_package_content' | 'ask_phone' | 'confirm' | 'completed';
  pickupAddress: string;
  pickupDistrict: DistrictName;
  destAddress: string;
  destDistrict: DistrictName;
  packageContent: string;
  phone: string;
  email: string;
  customerName: string;
  estimatedPrice: number;
  estimatedDurationMins: number;
  trackingCode?: string;
}

export const VoiceAIAssistantWidget: React.FC = () => {
  const { createNewRequest, setCurrentView, currentUser, currentView } = useDelivery();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [lastCreatedCode, setLastCreatedCode] = useState<string | null>(null);

  // Editing state for "Talebi Düzelt" button
  const [isEditingOrder, setIsEditingOrder] = useState<boolean>(false);
  const [editPickup, setEditPickup] = useState<string>('');
  const [editDest, setEditDest] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editPackage, setEditPackage] = useState<string>('');

  const initialGreeting =
    'Adresinize hemen kurye gönderebilirim. Paketiniz nereden, hangi mahalle veya adresten alınacak?';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [state, setState] = useState<ConversationState>({
    step: 'ask_pickup',
    pickupAddress: '',
    pickupDistrict: (currentUser?.district as DistrictName) || 'Muratpaşa',
    destAddress: '',
    destDistrict: 'Muratpaşa',
    packageContent: '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    customerName: currentUser?.name || 'Değerli Müşterimiz',
    estimatedPrice: 150,
    estimatedDurationMins: 35,
  });

  const stateRef = useRef<ConversationState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const processMessageRef = useRef<(text: string) => Promise<void>>(async () => {});
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isOpenRef = useRef<boolean>(false);
  const autoListenTimerRef = useRef<any>(null);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Listen to browser voice list updates so Turkish male voices (Tolga, Cem, Ahmet) are properly found
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            availableVoicesRef.current = v;
          }
        } catch (e) {}
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Hands-free continuous recognition: starts mic automatically whenever AI speech ends
  const autoStartListening = useCallback(() => {
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
    }

    autoListenTimerRef.current = setTimeout(() => {
      // Don't auto-listen if modal is closed, completed, or speech is active!
      if (
        !isOpenRef.current ||
        stateRef.current.step === 'completed' ||
        isSpeakingRef.current
      ) {
        setIsListening(false);
        isListeningRef.current = false;
        return;
      }
      if (!recognitionRef.current) return;

      try {
        if (!isListeningRef.current) {
          recognitionRef.current.start();
        }
      } catch (err: any) {
        console.debug('autoStartListening status:', err?.message);
      }
    }, 320); // 320ms natural pause after assistant speaks so speaker echo does not feed back
  }, []);

  // Preload initial greeting audio with male voice (Ahmet) and initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preloadAudio = new Audio(
        `/api/ai-voice/tts?voice=male&text=${encodeURIComponent(initialGreeting)}`
      );
      preloadAudio.preload = 'auto';
      sharedAudioRef.current = preloadAudio;
    }
  }, []);

  // Listen for Escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseWidget();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'tr-TR';
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsListening(true);
            isListeningRef.current = true;
          };

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript && transcript.trim()) {
              if (processMessageRef.current) {
                processMessageRef.current(transcript.trim());
              }
            }
          };

          recognition.onerror = (event: any) => {
            console.debug('Speech recognition error:', event?.error);
            setIsListening(false);
            isListeningRef.current = false;
            // If user paused or had brief silence, auto-restart listening
            if (
              event?.error === 'no-speech' &&
              isOpenRef.current &&
              !isSpeakingRef.current &&
              stateRef.current.step !== 'completed'
            ) {
              setTimeout(() => {
                if (
                  isOpenRef.current &&
                  !isSpeakingRef.current &&
                  !isListeningRef.current &&
                  stateRef.current.step !== 'completed'
                ) {
                  try {
                    recognitionRef.current?.start();
                  } catch (e) {}
                }
              }, 400);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
            isListeningRef.current = false;
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.debug('SpeechRecognition error:', e);
          setSpeechSupported(false);
        }
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (autoListenTimerRef.current) {
        clearTimeout(autoListenTimerRef.current);
      }
      if (sharedAudioRef.current) {
        try {
          sharedAudioRef.current.pause();
          sharedAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (ignored) {}
      }
    };
  }, []);

  // Prime and unlock audio pipeline on any user gesture
  const primeAudio = useCallback(() => {
    unlockAudioContext();
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      if (!sharedAudioRef.current) {
        const audio = new Audio();
        audio.preload = 'auto';
        sharedAudioRef.current = audio;
      }
      // Silently wake up the HTMLAudioElement without audible noise to guarantee autoplay clearance
      if (sharedAudioRef.current && !sharedAudioRef.current.src) {
        sharedAudioRef.current.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        sharedAudioRef.current.play().catch(() => {});
      }
    }
  }, []);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fallback Web Speech Synthesis (Always Male Voice Tone)
  const speakWithLocalSynthesis = useCallback(
    (cleanSpeech: string) => {
      if (isAudioMuted || !synthRef.current || typeof window === 'undefined') return;

      try {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.05; // Natural, authoritative customer service cadence

        const voices =
          availableVoicesRef.current.length > 0
            ? availableVoicesRef.current
            : synthRef.current.getVoices();

        const trMaleKeywords = [
          'tolga',
          'cem',
          'ahmet',
          'baris',
          'can',
          'sinan',
          'yusuf',
          'onur',
          'mert',
          'male',
          'erkek',
          'x-dfz#male',
          'x-efz#male',
        ];

        const trMaleVoice = voices.find(
          (v) =>
            (v.lang.includes('tr') || v.lang.includes('TR')) &&
            trMaleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
        );

        if (trMaleVoice) {
          utterance.voice = trMaleVoice;
          utterance.pitch = 0.88; // Natural, authoritative male tone
        } else {
          // If only a default voice is available, use clean natural frequency without robotic pitch distortion
          const trVoice = voices.find((v) => v.lang.includes('tr') || v.lang.includes('TR'));
          if (trVoice) {
            utterance.voice = trVoice;
          }
          utterance.pitch = 0.80; // Calm and smooth
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          autoStartListening();
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          autoStartListening();
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.debug('Local TTS error:', err);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        autoStartListening();
      }
    },
    [isAudioMuted, autoStartListening]
  );

  // High-Definition Neural Realistic Fast Male Voice (Ahmet) with robust credentialed fetch
  const speakText = useCallback(
    async (textToSpeak: string) => {
      if (isAudioMuted || typeof window === 'undefined') return;

      // Stop any running speech
      if (sharedAudioRef.current) {
        try {
          sharedAudioRef.current.pause();
          sharedAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }

      // Clean emojis, symbols, and remove forbidden words like 'harika' or 'acaba'
      const cleanSpeech = cleanAssistantSpeech(textToSpeak)
        .replace(/[#*•_~`]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

      if (!cleanSpeech) return;

      try {
        const audioUrl = `/api/ai-voice/tts?voice=male&text=${encodeURIComponent(cleanSpeech)}`;

        if (!sharedAudioRef.current && typeof Audio !== 'undefined') {
          sharedAudioRef.current = new Audio();
        }

        const audio = sharedAudioRef.current;
        if (!audio) {
          speakWithLocalSynthesis(cleanSpeech);
          return;
        }

        // Fetch Neural Male MP3 directly with 2-attempt retry
        let audioBlobUrl: string | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch(audioUrl, { credentials: 'include' });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && !contentType.includes('html')) {
              const blob = await res.blob();
              if (blob.type.includes('audio') || contentType.includes('audio')) {
                audioBlobUrl = URL.createObjectURL(blob);
                break;
              }
            }
          } catch (fetchErr) {
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 200));
            }
          }
        }

        if (audioBlobUrl) {
          audio.src = audioBlobUrl;
          audio.preload = 'auto';

          audio.onplay = () => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
          };

          audio.onended = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            // When assistant finishes speaking, automatically start listening hands-free!
            autoStartListening();
          };

          audio.onerror = () => {
            console.debug('Neural Voice playback error, using local male speech fallback');
            speakWithLocalSynthesis(cleanSpeech);
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.debug('Audio play failed, using local male synthesis:', err);
              speakWithLocalSynthesis(cleanSpeech);
            });
          }
        } else {
          // If server Neural audio cannot be fetched, fall back to pitch-adjusted local male speech
          speakWithLocalSynthesis(cleanSpeech);
        }
      } catch (err) {
        console.debug('Error initiating Neural TTS:', err);
        speakWithLocalSynthesis(cleanSpeech);
      }
    },
    [isAudioMuted, speakWithLocalSynthesis, autoStartListening]
  );

  // Open Fullscreen Widget
  const handleOpenWidget = () => {
    primeAudio();
    setIsOpen(true);
    isOpenRef.current = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    if (messages.length === 1 && !isAudioMuted) {
      speakText(messages[0].text);
    } else {
      autoStartListening();
    }
  };

  // Close Fullscreen Widget
  const handleCloseWidget = () => {
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
    }
    if (sharedAudioRef.current) {
      try {
        sharedAudioRef.current.pause();
      } catch (e) {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (ignored) {}
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setIsListening(false);
    isListeningRef.current = false;
    setIsOpen(false);
    isOpenRef.current = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  // Toggle voice recognition listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız ses tanıma (mikrofon) özelliğini desteklemiyor. Lütfen aşağıdaki kutuya yazarak belirtiniz.');
      return;
    }

    if (isListening) {
      if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      isListeningRef.current = false;
    } else {
      primeAudio();
      if (sharedAudioRef.current) {
        try {
          sharedAudioRef.current.pause();
          sharedAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsSpeaking(false);
      isSpeakingRef.current = false;

      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch (e) {
        console.debug('Error starting recognition:', e);
      }
    }
  };

  // Handle final order creation when confirmed
  const triggerOrderCreation = useCallback(
    (finalState: ConversationState) => {
      try {
        const fromDistrict = finalState.pickupDistrict || 'Muratpaşa';
        const toDistrict = finalState.destDistrict || 'Muratpaşa';
        const estimate = calculateDeliveryEstimate(fromDistrict, toDistrict, 'other', 'express_vip');

        const newReq = createNewRequest({
          senderUserId: currentUser?.id,
          sender: {
            district: fromDistrict,
            neighborhood: '',
            addressDetail: finalState.pickupAddress || 'Muratpaşa Merkez',
            contactName: currentUser?.name || finalState.customerName || 'Sesli Asistan Müşterisi',
            contactPhone: finalState.phone || currentUser?.phone || '0500 000 00 00',
            contactEmail: finalState.email || currentUser?.email || '',
            lat: 36.8860,
            lng: 30.7065,
          },
          receiver: {
            district: toDistrict,
            neighborhood: '',
            addressDetail: finalState.destAddress || 'Antalya Teslimat Adresi',
            contactName: 'Alıcı',
            contactPhone: finalState.phone || '0500 000 00 00',
            lat: 36.8732,
            lng: 30.6384,
          },
          packageType: 'other',
          packageName: finalState.packageContent ? `Sesli Kurye: ${finalState.packageContent}` : 'Sesli Asistan Acil Kurye',
          packageWeightKg: 1,
          urgency: 'express_vip',
          paymentMethod: 'gonderici_odemeli',
          isPaid: false,
          noteForCourier: `[🎙️ Sesli Kurye Talebi] İçerik: ${finalState.packageContent || 'Belirtilmedi'}. 30-45 Dk Acil Kurye. Müşteri İletişim: ${finalState.phone}`,
          estimatedDistanceKm: estimate.distanceKm,
          estimatedDurationMins: estimate.durationMins,
        });

        const trackingCode = newReq?.trackingCode || `ANT-${Math.floor(1000 + Math.random() * 9000)}`;
        setLastCreatedCode(trackingCode);

        setState((prev) => ({
          ...prev,
          step: 'completed',
          trackingCode,
        }));

        const successSpeech = `Siparişiniz oluşturuldu, takip kodunuz #${trackingCode}. En yakın kuryemiz hemen yönlendirildi, sizi müşteri panelinize aktarıyorum.`;

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'ai',
            text: successSpeech,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        speakText(successSpeech);

        // Misafir müşteri sipariş oluşturduktan sonra doğrudan müşteri paneline yönlendirilir
        setTimeout(() => {
          handleCloseWidget();
          setCurrentView('home');
        }, 2500);
      } catch (err: any) {
        console.error('Error creating voice request:', err);
      }
    },
    [createNewRequest, currentUser, speakText, setCurrentView]
  );

  // Send message to AI and update conversation
  const processMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // Add user message to UI
    const newUserMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    const currentState = stateRef.current;

    try {
      const response = await fetch('/api/ai-voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(4000), // Max 4s wait so user never suffers long delays
        body: JSON.stringify({
          message: userText,
          state: currentState,
        }),
      });

      if (!response.ok) {
        throw new Error('Sunucu gecikmeli yanıt verdi');
      }

      const data = await response.json();

      if (data.success && data.replyText && data.replyText.trim()) {
        const nextState = { ...(data.state || currentState) };
        if ((nextState.step as any) === 'ask_email' || (nextState.step as any) === 'ask_code') {
          nextState.step = 'confirm';
        }
        setState(nextState);
        stateRef.current = nextState;

        let reply = cleanAssistantSpeech(data.replyText.trim());
        if (nextState.step === 'confirm' && (reply.toLowerCase().includes('mail') || reply.toLowerCase().includes('kod'))) {
          reply = 'Onaylıyorsanız adresinize hemen en yakın kuryeyi yönlendireceğim.';
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Speak AI response with male voice
        speakText(reply);

        // If user confirmed, immediately trigger order creation
        if (data.shouldCreateOrder || nextState.step === 'completed') {
          triggerOrderCreation(nextState);
        }
        return;
      }
      throw new Error('Geçersiz sunucu yanıtı veya boş metin');
    } catch (err: any) {
      console.warn('AI Voice Chat Deterministic In-Browser Progression:', err?.message);
      // Instant in-browser state machine progression: 100% reliable, zero delay
      const current = stateRef.current;
      const lower = userText.toLowerCase();
      let nextReply = '';
      let shouldCreate = false;
      const nextState: ConversationState = { ...current };

      if (lower.includes('iptal') || lower.includes('vazgeçtim') || lower.includes('kapat')) {
        nextReply = 'Talebiniz iptal edildi. Dilediğiniz zaman mikrofona dokunarak bana seslenebilirsiniz, iyi günler dilerim!';
        nextState.step = 'ask_pickup';
      } else if (current.step === 'ask_pickup' || current.step === 'greeting' || !current.pickupAddress) {
        nextState.pickupAddress = userText;
        nextState.step = 'ask_destination';
        nextReply = 'Paketiniz nereye, hangi adrese teslim edilecek?';
      } else if (current.step === 'ask_destination' || !current.destAddress) {
        nextState.destAddress = userText;
        nextState.step = 'ask_package_content';
        nextReply = 'Paketinizin içeriği nedir?';
      } else if (current.step === 'ask_package_content' || !current.packageContent) {
        nextState.packageContent = userText.trim();
        nextState.step = 'ask_phone';
        nextReply = 'Kuryemizin size kolayca ulaşabilmesi için telefon numaranızı söyler misiniz?';
      } else if (current.step === 'ask_phone' || !current.phone) {
        const digits = userText.replace(/\D/g, '');
        nextState.phone = digits.length >= 7 ? userText.trim() : (current.phone || '0500 000 00 00');
        const estimate = calculateDeliveryEstimate(
          nextState.pickupDistrict || 'Muratpaşa',
          nextState.destDistrict || 'Muratpaşa',
          'other',
          'express_vip'
        );
        nextState.estimatedPrice = estimate.price || 150;
        nextState.step = 'confirm';
        nextReply = 'Bilgilerinizi aldım. Onaylıyorsanız adresinize hemen en yakın kuryeyi yönlendireceğim.';
      } else if (current.step === 'confirm') {
        const positiveWords = ['evet', 'onay', 'onaylıyorum', 'onayliyorum', 'tamam', 'tamamdır', 'tamamdir', 'olur', 'gönder', 'gonder', 'çağır', 'cagir', 'gelsin', 'yolla'];
        if (positiveWords.some((w) => lower.includes(w))) {
          nextState.step = 'completed';
          nextReply = 'Siparişiniz oluşturuldu, en yakın kuryemiz hemen yönlendirildi! Sizi müşteri panelinize aktarıyorum, iyi günler dilerim.';
          shouldCreate = true;
        } else {
          nextReply = 'Anladım. Değiştirmek istediğiniz bilgiyi belirtebilir ya da onaylıyorsanız "Evet" diyebilirsiniz.';
        }
      } else {
        nextState.destAddress = userText;
        nextState.step = 'ask_package_content';
        nextReply = 'Paketinizin içeriği nedir?';
      }

      nextReply = cleanAssistantSpeech(nextReply);
      setState(nextState);
      stateRef.current = nextState;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: nextReply,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(nextReply);

      if (shouldCreate) {
        triggerOrderCreation(nextState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bind latest processMessage to ref
  useEffect(() => {
    processMessageRef.current = processMessage;
  });

  const handleUserSpeech = (transcript: string) => {
    processMessage(transcript);
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    processMessage(text);
  };

  const handleStartEditOrder = () => {
    setEditPickup(state.pickupAddress || '');
    setEditDest(state.destAddress || '');
    setEditPhone(state.phone || '');
    setEditPackage(state.packageContent || '');
    setIsEditingOrder(true);
  };

  const handleSaveOrderEdits = () => {
    const updatedPickup = editPickup.trim() || state.pickupAddress;
    const updatedDest = editDest.trim() || state.destAddress;
    const updatedPhone = editPhone.trim() || state.phone;
    const updatedPackage = editPackage.trim() || state.packageContent;

    const fromDist = state.pickupDistrict || 'Muratpaşa';
    const toDist = state.destDistrict || 'Muratpaşa';
    const estimate = calculateDeliveryEstimate(fromDist, toDist, 'other', 'express_vip');

    const nextState: ConversationState = {
      ...state,
      pickupAddress: updatedPickup,
      destAddress: updatedDest,
      phone: updatedPhone,
      packageContent: updatedPackage,
      estimatedPrice: estimate.price,
    };
    setState(nextState);
    stateRef.current = nextState;
    setIsEditingOrder(false);

    const updateNotice = `Talebiniz güncellendi: ${updatedPickup} ➔ ${updatedDest} | İletişim: ${updatedPhone} | Paket: ${updatedPackage}.`;
    setMessages((prev) => [
      ...prev,
      {
        id: `edit-msg-${Date.now()}`,
        sender: 'ai',
        text: updateNotice,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleManualConfirm = () => {
    processMessage('Evet, onaylıyorum');
  };

  const handleManualReset = () => {
    setState({
      step: 'ask_pickup',
      pickupAddress: '',
      pickupDistrict: 'Muratpaşa',
      destAddress: '',
      destDistrict: 'Muratpaşa',
      packageContent: '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      customerName: currentUser?.name || 'Değerli Müşterimiz',
      estimatedPrice: 150,
      estimatedDurationMins: 35,
    });
    const resetText = 'Bilgileri sıfırladım. Paketiniz nereden, hangi adresten veya mahalleden alınacak?';
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-reset-${Date.now()}`,
        sender: 'ai',
        text: resetText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    speakText(resetText);
  };

  // Kurye panelinde, kurye rolündeyken, /pakettalebi ekranında veya APK içindeyken Müşteri Hizmetleri butonu ASLA gösterilmez!
  const isAndroidApk =
    typeof window !== 'undefined' &&
    Boolean((window as any).AndroidApp || navigator.userAgent.includes('AntalyaKuryeApp'));

  const isPaketTalebi =
    typeof window !== 'undefined' &&
    (window.location.hash.includes('pakettalebi') || window.location.pathname.includes('pakettalebi'));

  if (
    currentView === 'courier' ||
    currentUser?.role === 'courier' ||
    isAndroidApk ||
    isPaketTalebi
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
          {/* Floating Pill Tooltip */}
          <div
            onClick={handleOpenWidget}
            className="hidden sm:flex items-center gap-2 bg-[#021f19]/95 backdrop-blur-md text-emerald-200 text-xs px-4 py-2.5 rounded-2xl border border-emerald-500/50 shadow-xl shadow-emerald-950/60 cursor-pointer hover:bg-[#032a22] transition-all hover:scale-105 select-none"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-white">Müşteri Hizmetleri</span>
          </div>

          {/* Main Circular Button with Wave Rings */}
          <button
            type="button"
            onClick={handleOpenWidget}
            className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-2xl shadow-emerald-600/50 hover:shadow-emerald-500/80 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-400/80 cursor-pointer"
            aria-label="Sesli Kurye Çağır"
          >
            <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 blur-sm group-hover:opacity-75 animate-pulse transition"></span>

            <div className="relative z-10 flex items-center justify-center">
              <Headphones className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
              <Mic className="w-3.5 h-3.5 text-amber-300 absolute -bottom-1 -right-1 fill-amber-300" />
            </div>

            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#021814] rounded-full"></span>
          </button>
        </div>
      )}

      {/* FULLSCREEN Customer Screen (Ekrani Kaplayan Sesli Kurye Modu) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] w-full h-[100dvh] max-h-[100dvh] bg-[#011410] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Top Fullscreen Header Navigation Bar */}
          <header className="px-4 sm:px-8 py-3.5 bg-gradient-to-r from-[#021e17] via-[#043328] to-[#021e17] border-b border-emerald-800/80 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg border border-emerald-300/40">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#011410] rounded-full"></span>
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                  Müşteri Hizmetleri
                </h1>
                <p className="text-xs text-emerald-300/80">Antalya 7/24 Sesli Kurye & Paket Yönlendirme</p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/60'
                    : 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-800/50'
                }`}
                title={isAudioMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              >
                {isAudioMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Ses Kapalı</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Ses Açık</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCloseWidget}
                className="px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-rose-900/80 border border-emerald-700/80 hover:border-rose-600 text-emerald-200 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Kapat (ESC)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Kapat</span>
              </button>
            </div>
          </header>

          {/* Subheader Status Strip */}
          <div className="bg-[#021813] px-4 sm:px-8 py-2.5 border-b border-emerald-900/80 flex flex-wrap items-center justify-between text-xs gap-3 shrink-0">
            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-[300px] overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400 font-medium">Alış:</span>
                <span className="font-semibold text-emerald-200 max-w-[140px] truncate">
                  {state.pickupAddress ? state.pickupAddress : 'Bekleniyor...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Navigation className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400 font-medium">Teslim:</span>
                <span className="font-semibold text-amber-200 max-w-[140px] truncate">
                  {state.destAddress ? state.destAddress : 'Bekleniyor...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Package className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-400 font-medium">İçerik:</span>
                <span className="font-semibold text-purple-200 max-w-[120px] truncate">
                  {state.packageContent ? state.packageContent : 'Bekleniyor...'}
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-400 font-medium">Telefon:</span>
                <span className="font-semibold text-teal-200 truncate">
                  {state.phone ? state.phone : 'Bekleniyor...'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Fullscreen Workspace Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-start bg-gradient-to-b from-[#011410] via-[#021c17] to-[#011410]">
            <div className="w-full max-w-4xl flex flex-col flex-1 space-y-6">
              {/* Speaking Avatar & Live Pulse Visualizer */}
              <div className="flex flex-col items-center justify-center text-center pt-2 pb-2 shrink-0">
                <div className="relative mb-3">
                  <div
                    className={`absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl transition-all duration-300 ${
                      isSpeaking || isListening ? 'scale-125 opacity-100' : 'scale-100 opacity-30'
                    }`}
                  ></div>
                  <div
                    className={`absolute -inset-2 rounded-full border-2 border-emerald-400/40 transition-all duration-300 ${
                      isSpeaking ? 'animate-ping' : ''
                    }`}
                  ></div>

                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border-4 border-emerald-400/80 shadow-2xl flex items-center justify-center text-white">
                    <Headphones className="w-9 h-9 sm:w-11 sm:h-11" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Müşteri Hizmetleri
                </h3>
                <p className="text-xs text-emerald-300/80 max-w-md mt-0.5">
                  Mikrofon butonuna dokunarak konuşabilir veya aşağıdaki kutuya yazabilirsiniz.
                </p>

                {/* 7-Bar Frequency Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-8 mt-3">
                  {[30, 60, 95, 100, 75, 50, 85].map((h, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isListening
                          ? 'bg-amber-400 animate-pulse'
                          : isSpeaking
                          ? 'bg-emerald-400 animate-bounce'
                          : 'bg-emerald-900/60'
                      }`}
                      style={{
                        height: isListening || isSpeaking ? `${h}%` : '20%',
                        animationDelay: `${idx * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Conversation Messages Transcript (Full-Width Card) */}
              <div className="flex-1 bg-[#021d17]/80 border border-emerald-800/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl overflow-y-auto max-h-[46vh] sm:max-h-[50vh]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-400/50 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                        <Headphones className="w-4 h-4 text-emerald-200" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-md ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs font-medium'
                          : 'bg-[#032a22] border border-emerald-700/70 text-emerald-100 rounded-tl-xs'
                      }`}
                    >
                      {m.sender === 'ai' && (
                        <span className="block text-[11px] font-bold text-amber-300 mb-1">
                          Müşteri Hizmetleri
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <span className="block text-[10px] opacity-60 text-right mt-1 font-mono">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 italic bg-[#032820] border border-emerald-800/60 w-fit px-4 py-2 rounded-2xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Yanıt hazırlanıyor...</span>
                  </div>
                )}

                {/* Confirmation Box (When all details are collected) */}
                {state.step === 'confirm' && (
                  <div className="p-4 sm:p-5 bg-[#03342a] border-2 border-amber-500/90 rounded-3xl space-y-3.5 shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span>Sipariş Özeti & Kurye Onayı</span>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {state.estimatedPrice} TL • 30-45 Dk
                      </span>
                    </div>

                    {/* Talebi Düzeltme Modu */}
                    {isEditingOrder ? (
                      <div className="p-4 bg-[#011410] border-2 border-amber-400 rounded-2xl space-y-3 animate-in zoom-in-95">
                        <h4 className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" />
                          <span>Talebi Düzenle</span>
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[11px] text-emerald-300 font-bold block mb-1">📍 Alış Adresi (Nereden):</label>
                            <input
                              type="text"
                              value={editPickup}
                              onChange={(e) => setEditPickup(e.target.value)}
                              className="w-full bg-[#021d17] border border-emerald-600 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-amber-300 font-bold block mb-1">🏁 Teslimat Adresi (Nereye):</label>
                            <input
                              type="text"
                              value={editDest}
                              onChange={(e) => setEditDest(e.target.value)}
                              className="w-full bg-[#021d17] border border-emerald-600 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-teal-300 font-bold block mb-1">📞 İletişim Telefon Numarası:</label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full bg-[#021d17] border border-emerald-600 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-purple-300 font-bold block mb-1">📦 Paket İçeriği:</label>
                            <input
                              type="text"
                              value={editPackage}
                              onChange={(e) => setEditPackage(e.target.value)}
                              className="w-full bg-[#021d17] border border-emerald-600 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveOrderEdits}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Kaydet & Özete Dön
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingOrder(false)}
                            className="px-3 py-2 bg-[#021b15] hover:bg-[#032920] border border-slate-700 text-slate-300 text-xs rounded-xl"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm space-y-2 bg-[#011c16] p-3.5 rounded-2xl border border-emerald-800/80">
                        <div className="flex items-center justify-between pb-1.5 border-b border-emerald-800/80">
                          <span className="font-bold text-emerald-300 text-xs">Teslimat & İletişim Detayları</span>
                          <button
                            type="button"
                            onClick={handleStartEditOrder}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Talebi Düzelt"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Talebi Düzelt</span>
                          </button>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">📍 Alış Adresi (Nereden):</span>
                          <span className="text-slate-200 font-semibold">{state.pickupAddress} ({state.pickupDistrict})</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">🏁 Teslimat Adresi (Nereye):</span>
                          <span className="text-slate-200 font-semibold">{state.destAddress} ({state.destDistrict})</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-teal-400 font-bold shrink-0">📞 İletişim Telefonu:</span>
                          <span className="text-amber-300 font-bold font-mono">{state.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold shrink-0">📦 Paket İçeriği:</span>
                          <span className="text-slate-200 font-semibold">{state.packageContent || 'Standart Paket'}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-amber-200 font-semibold">
                      Onaylıyorsanız adresinize hemen en yakın kuryeyi yönlendireceğim.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleManualConfirm}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Evet, Kurye Gönder</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleStartEditOrder}
                        className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        title="Talebi Düzelt"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Talebi Düzelt</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleManualReset}
                        className="px-4 py-3 bg-[#021b15] hover:bg-[#032920] border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        title="Yeniden Başla"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Sıfırla</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Created Success Box */}
                {state.step === 'completed' && lastCreatedCode && (
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-[#043b2f] to-[#02241c] border-2 border-emerald-400 rounded-3xl text-center space-y-4 shadow-2xl animate-in zoom-in-95">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 mx-auto flex items-center justify-center">
                      <Bike className="w-8 h-8 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base sm:text-lg">
                        Kurye Adresinize Yönlendirildi!
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-300/90 mt-1">
                        Takip Kodunuz:{' '}
                        <strong className="text-amber-300 text-sm sm:text-base font-mono">
                          #{lastCreatedCode}
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-lg mx-auto">
                      <button
                        type="button"
                        onClick={() => {
                          handleCloseWidget();
                          setCurrentView('home');
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>Müşteri Paneline Git</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleManualReset}
                        className="py-3 px-5 bg-[#011813] hover:bg-[#02241d] border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-2xl transition cursor-pointer"
                      >
                        Yeni Paket Gönder
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </main>

          {/* Bottom Fullscreen Controller Bar (Text Input Row on Top + Conditional Mic) */}
          <footer className="px-4 sm:px-8 py-3 sm:py-3.5 bg-[#01120e] border-t-2 border-emerald-800/80 shrink-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2.5">
              {/* Text Input Row - FIRST and ALWAYS VISIBLE */}
              <form onSubmit={handleSubmitText} className="w-full flex items-center gap-2 max-w-2xl">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    state.step === 'confirm'
                      ? 'Onaylamak için "Evet" yazabilir veya butona tıklayabilirsiniz...'
                      : 'Klavyenizle buraya yazarak cevaplayabilirsiniz...'
                  }
                  className="flex-1 bg-[#022019] border-2 border-emerald-500/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-emerald-400/60 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/20 transition shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95 shrink-0"
                  title="Gönder"
                >
                  <Send className="w-4 h-4" />
                  <span>Gönder</span>
                </button>
              </form>

              {/* Primary Large Microphone Button */}
              {state.step !== 'completed' && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`relative flex items-center justify-center gap-2.5 px-6 sm:px-10 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm transition-all shadow-xl cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/60 ring-4 ring-rose-500/30 animate-pulse scale-102'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/60 hover:scale-102 active:scale-95'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 animate-spin" />
                      <span>Dinliyorum, Konuşun... (Durdurmak İçin Dokunun)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Sesle Konuşmak İçin Dokunun</span>
                    </>
                  )}
                </button>
              )}

              {/* Status info for confirmation step */}
              {state.step === 'confirm' && (
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-300 font-semibold py-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Onaylamak için &quot;Evet&quot; diyebilir veya yukarıdaki &quot;Evet, Kurye Gönder&quot; butonuna dokunabilirsiniz.</span>
                </div>
              )}
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

/**
 * Pure Web Audio API synthesized sound alert system for courier & customer events.
 * Designed to bypass browser autoplay policies safely and produce crisp, audible tones.
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

const SOUND_STORAGE_KEY = 'antalya_kurye_sound_alerts_enabled';

/**
 * Check if sound alerts are enabled by user preference (default: true)
 */
export function isSoundAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

/**
 * Toggle or set sound alerts preference
 */
export function setSoundAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('antalya_sound_toggle', { detail: { enabled } }));
  } catch {}
}

/**
 * Retrieve or initialize AudioContext safely
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Unlock AudioContext by playing an inaudible 1-sample buffer on user gesture.
 * Crucial for iOS Safari and Android Chrome to permit background sound triggers.
 */
export function unlockAudioContext(): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Play tiny silent buffer
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    isAudioUnlocked = true;
    return true;
  } catch (err) {
    console.debug('Audio context unlock notice:', err);
    return false;
  }
}

// Global user interaction listener to silently unlock audio context on first touch/click
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    if (!isAudioUnlocked) {
      unlockAudioContext();
    }
  };

  ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, handleInteraction, { capture: true, passive: true, once: false });
  });
}

/**
 * Play a synthesized sound with envelope helper
 */
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainLevel = 0.25,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Attack & exponential decay to prevent clicking
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * 1. YENİ PAKET TALEBİ UYARI SESİ (New Package Alert Sound)
 * Hem kurye hem müşteri tarafında çalar:
 * Dikkat çeken çift tonlu "Ding-Dong! Ding-Dong!" kurye çağrı melodisi
 */
export function playNewOrderSound() {
  if (!isSoundAlertsEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Pulse 1: Ding-Dong (784Hz G5 -> 1046Hz C6)
    playTone(ctx, 784.0, now, 0.18, 0.32, 'triangle');
    playTone(ctx, 1046.5, now + 0.08, 0.28, 0.35, 'sine');

    // Pulse 2: Second Ding-Dong for high attentiveness (courier dispatch feel)
    const secondPulse = now + 0.24;
    playTone(ctx, 880.0, secondPulse, 0.18, 0.34, 'triangle');
    playTone(ctx, 1318.51, secondPulse + 0.08, 0.38, 0.38, 'sine'); // E6
  } catch (e) {
    console.debug('playNewOrderSound error:', e);
  }
}

/**
 * 1.5 ULTRA-LOUD KURYE HAVUZ SİRENİ (High Urgency Pool Dispatch Alarm)
 * Trafikte veya cepte olan kuryelerin yeni siparişi anında fark etmesi için
 * yüksek sesli, 3 tekrarlı acil çağrı melodisi
 */
export function playCourierPoolSiren() {
  if (!isSoundAlertsEnabled()) return;

  // If in Android native APK container, fire native loud alarm sound:
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.playAlarmSound) {
    try {
      (window as any).AndroidApp.playAlarmSound();
    } catch (e) {
      console.debug('AndroidApp.playAlarmSound error:', e);
    }
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // 3 rapid pulses of high frequency dispatch beeps
    for (let i = 0; i < 3; i++) {
      const offset = now + i * 0.22;
      playTone(ctx, 987.77, offset, 0.09, 0.45, 'sawtooth'); // B5
      playTone(ctx, 1318.51, offset + 0.09, 0.11, 0.50, 'sine'); // E6
    }
  } catch (e) {
    console.debug('playCourierPoolSiren error:', e);
  }
}

/**
 * 2. KURYE ATANDI UYARI SESİ (Courier Assigned Alert Sound)
 * Hem kurye (görev atandığında) hem müşteri (kurye yola çıktığında) tarafında çalar:
 * Canlı, neşeli ve onaylayıcı 4 notalı yükselen melodi (C5 -> E5 -> G5 -> C6)
 */
export function playCourierAssignedSound() {
  if (!isSoundAlertsEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, dur: 0.15, gain: 0.25 },     // C5
      { freq: 659.25, time: 0.09, dur: 0.15, gain: 0.28 },  // E5
      { freq: 783.99, time: 0.18, dur: 0.18, gain: 0.32 },  // G5
      { freq: 1046.5, time: 0.27, dur: 0.45, gain: 0.36 },  // C6 (bright final bell)
    ];

    notes.forEach((n) => {
      playTone(ctx, n.freq, now + n.time, n.dur, n.gain, 'sine');
    });

    // Subtly enrich with a warm harmonic
    playTone(ctx, 1046.5 * 1.5, now + 0.27, 0.35, 0.15, 'triangle');
  } catch (e) {
    console.debug('playCourierAssignedSound error:', e);
  }
}

/**
 * Alias for backward compatibility with acceptRequest handlers
 */
export function playAcceptSound() {
  playCourierAssignedSound();
}

/**
 * 3. SİPARİŞ TAMAMLANDI SESİ (Delivery Completed Chime)
 */
export function playSuccessSound() {
  if (!isSoundAlertsEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // Fanfare
    notes.forEach((freq, idx) => {
      playTone(ctx, freq, now + idx * 0.08, 0.35, 0.25, 'sine');
    });
  } catch (e) {
    console.debug('playSuccessSound error:', e);
  }
}

/**
 * 4. DURUM GÜNCELLEMESİ ZİLİ (Status Update Chime)
 */
export function playStatusChime() {
  if (!isSoundAlertsEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    playTone(ctx, 659.25, now, 0.22, 0.25, 'sine');
    playTone(ctx, 1046.5, now + 0.12, 0.35, 0.28, 'sine');
  } catch (e) {
    console.debug('playStatusChime error:', e);
  }
}

/**
 * Interactive Sound Tester for UI test buttons
 */
export function testAudioAlert(type: 'new_order' | 'courier_assigned' = 'new_order'): boolean {
  unlockAudioContext();
  if (type === 'new_order') {
    playNewOrderSound();
  } else {
    playCourierAssignedSound();
  }
  return true;
}

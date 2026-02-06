import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Sound generation functions using Web Audio API
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  const ctx = getAudioContext();

  // Resume audio context if suspended (iOS requirement)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Envelope: quick attack, sustain, fade out
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + duration * 0.7);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Sound effect presets
const sounds = {
  correct: () => {
    // Happy ascending arpeggio
    playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.25), 80); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 160); // G5
  },

  incorrect: () => {
    // Gentle low tone
    playTone(220, 0.3, 'sine', 0.2); // A3
  },

  star: () => {
    // Sparkly high tones
    playTone(1046.5, 0.08, 'sine', 0.15); // C6
    setTimeout(() => playTone(1318.5, 0.08, 'sine', 0.15), 60); // E6
    setTimeout(() => playTone(1568, 0.12, 'sine', 0.2), 120); // G6
  },

  unlock: () => {
    // Achievement sound - major chord arpeggio
    playTone(523.25, 0.15, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.25), 100); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.25), 200); // G5
    setTimeout(() => playTone(1046.5, 0.25, 'sine', 0.3), 300); // C6
  },

  tap: () => {
    // Subtle tap feedback
    playTone(800, 0.05, 'sine', 0.1);
  },

  complete: () => {
    // Level complete fanfare
    playTone(523.25, 0.12, 'triangle', 0.3); // C5
    setTimeout(() => playTone(659.25, 0.12, 'triangle', 0.3), 100); // E5
    setTimeout(() => playTone(783.99, 0.12, 'triangle', 0.3), 200); // G5
    setTimeout(() => playTone(1046.5, 0.12, 'triangle', 0.3), 300); // C6
    setTimeout(() => playTone(1318.5, 0.25, 'triangle', 0.35), 400); // E6
  },

  streak: () => {
    // Streak celebration
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playTone(400 + i * 100, 0.1, 'sine', 0.2);
      }, i * 80);
    }
  },
};

export type SoundEffect = keyof typeof sounds;

interface UseAudioResult {
  play: (sound: SoundEffect) => void;
  isEnabled: boolean;
}

export function useAudio(): UseAudioResult {
  const settings = useSettingsStore(state => state.settings);
  const isEnabled = settings?.soundEnabled ?? true;
  const pendingUnlock = useRef(false);

  // Unlock audio context on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (pendingUnlock.current) return;
      pendingUnlock.current = true;

      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Remove listeners after first interaction
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  const play = useCallback(
    (sound: SoundEffect) => {
      if (!isEnabled) return;

      try {
        sounds[sound]();
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    },
    [isEnabled]
  );

  return { play, isEnabled };
}

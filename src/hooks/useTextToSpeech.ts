import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface UseTextToSpeechResult {
  speak: (text: string) => void;
  stop: () => void;
  isEnabled: boolean;
  isSpeaking: boolean;
}

export function useTextToSpeech(): UseTextToSpeechResult {
  const settings = useSettingsStore(state => state.settings);
  const isEnabled = settings?.readAloudEnabled ?? true;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!isEnabled) return;
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice settings for kid-friendly speech
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 1;

    // Try to find a good voice (prefer female, English voices)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    ) || voices.find(
      v => v.lang.startsWith('en')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, [isEnabled]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
  }, []);

  return {
    speak,
    stop,
    isEnabled,
    isSpeaking: isSpeakingRef.current,
  };
}

// Helper component that automatically speaks text when mounted
import { useEffect as useEffectReact } from 'react';

export function useSpeakOnMount(text: string, dependencies: unknown[] = []) {
  const { speak, isEnabled } = useTextToSpeech();

  useEffectReact(() => {
    if (isEnabled && text) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => speak(text), 300);
      return () => clearTimeout(timer);
    }
  }, [text, isEnabled, speak, ...dependencies]);
}

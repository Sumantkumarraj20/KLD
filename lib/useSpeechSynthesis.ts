import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechSynthesisOptions {
  rate?: number; // 0.5 to 2 (default 1)
  pitch?: number; // 0.5 to 2 (default 1)
  volume?: number; // 0 to 1 (default 1)
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  // Use standard defaults for cross-browser compatibility
  const { rate = 0.9, pitch = 1.0, volume = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize voices on first load (important for Firefox)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) return;

    // Pre-load voices by calling getVoices
    synth.getVoices();

    // Also listen for voiceschanged event (important for Firefox and async loading)
    const loadVoices = () => {
      synth.getVoices();
    };

    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;

      const synth = window.speechSynthesis;
      if (!synth) {
        console.warn("[Speech] Speech Synthesis API not supported");
        return;
      }

      // Cancel any ongoing speech
      synth.cancel();

      const SpeechSynthesisUtterance =
        window.SpeechSynthesisUtterance ||
        (window as any).webkitSpeechSynthesisUtterance;

      if (!SpeechSynthesisUtterance) {
        console.warn("[Speech] Speech Synthesis Utterance not available");
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set speech properties exactly like testSpeech() does
        utterance.rate = rate;  // Don't clamp - use the exact value
        utterance.pitch = pitch; // Keep consistent
        utterance.volume = volume;
        utterance.lang = "en-US";

        // Get voices - Firefox needs immediate voice selection
        const voices = synth.getVoices?.() || [];
        
        if (voices.length > 0) {
          // Pick first English voice - simple and predictable
          const englishVoice = voices.find((v) => v.lang.startsWith("en"));
          if (englishVoice) {
            utterance.voice = englishVoice;
            console.log(`[Speech] Using: ${englishVoice.name} (${englishVoice.lang})`);
          }
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          setIsSpeaking(false);
          console.warn("[Speech] Error:", event.error);
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
      } catch (error) {
        console.error("[Speech] Error:", error);
        setIsSpeaking(false);
      }
    },
    [rate, pitch, volume]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause?.();
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume?.();
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
  };
}

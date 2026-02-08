/**
 * Debug utility to check speech synthesis availability and configuration.
 * Useful for troubleshooting Firefox and Linux speech issues.
 */

export function logSpeechSynthesisInfo() {
  if (typeof window === "undefined") {
    console.log("[Speech] SSR environment, skipping speech synthesis info");
    return;
  }

  const synth = window.speechSynthesis;

  if (!synth) {
    console.warn("[Speech] Speech Synthesis API not available in this browser");
    return;
  }

  console.log("[Speech] Speech Synthesis API available");
  console.log("[Speech] User-Agent:", navigator.userAgent);

  const voices = synth.getVoices();
  console.log(`[Speech] ${voices.length} voices available:`);

  if (voices.length === 0) {
    console.warn(
      "[Speech] No voices found! Firefox may still be loading voices. Wait a moment and try again."
    );
  } else {
    voices.slice(0, 5).forEach((voice, i) => {
      console.log(
        `  ${i + 1}. ${voice.name} (${voice.lang}) - ${voice.default ? "DEFAULT" : "alternate"}`
      );
    });
    if (voices.length > 5) {
      console.log(`  ... and ${voices.length - 5} more voices`);
    }
  }

  console.log(
    "[Speech] Testing utterance with neutral settings (rate: 0.9, pitch: 1.0, volume: 1)"
  );
}

/**
 * Test speech synthesis with a simple message.
 * Call this in browser console to verify speech is working.
 */
export function testSpeechSynthesis() {
  if (typeof window === "undefined") {
    console.log("[Speech] SSR environment, cannot test");
    return;
  }

  logSpeechSynthesisInfo();

  const synth = window.speechSynthesis;
  if (!synth) {
    console.error("[Speech] Speech Synthesis not available");
    return;
  }

  // Cancel any previous utterances
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(
    "Hello! Testing speech synthesis. This should sound clear and understandable."
  );
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1;
  utterance.lang = "en-US";

  const voices = synth.getVoices();
  if (voices.length > 0) {
    utterance.voice = voices[0];
    console.log(`[Speech] Using voice: ${voices[0].name}`);
  }

  utterance.onstart = () => {
    console.log("[Speech] Speech started");
  };

  utterance.onend = () => {
    console.log("[Speech] Speech ended");
  };

  utterance.onerror = (event) => {
    console.error("[Speech] Error:", event.error);
  };

  synth.speak(utterance);
  console.log("[Speech] Utterance queued for playback");
}

// Export for direct console use
if (typeof window !== "undefined") {
  (window as any).testSpeech = testSpeechSynthesis;
  (window as any).logSpeechInfo = logSpeechSynthesisInfo;
}

import { useSpeechSynthesis } from "@/lib/useSpeechSynthesis";

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * A button component that reads text aloud for kids.
 * Works across browsers including Firefox on Linux with clear, understandable speech.
 */
export function SpeakButton({
  text,
  label = "🔊 Read Aloud",
  className = "",
  size = "md",
}: SpeakButtonProps) {
  // Match testSpeech() settings exactly for consistency
  const { speak, stop, isSpeaking } = useSpeechSynthesis({
    rate: 0.9, // Same as testSpeech for consistency
    pitch: 1.0, // Keep stable - no pitch changes
    volume: 1,
  });

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium
        transition-all duration-200
        ${
          isSpeaking
            ? "bg-emerald-500 text-white hover:bg-emerald-600 animate-pulse"
            : "bg-sky-100 text-sky-700 hover:bg-sky-200 active:scale-95"
        }
        ${sizeClasses[size]}
        ${className}
      `}
      title={isSpeaking ? "Click to stop" : "Click to hear out loud"}
    >
      {isSpeaking ? (
        <>
          <span className="text-lg">🔊</span>
          <span>Stop</span>
        </>
      ) : (
        <>
          <span className="text-lg">🔊</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

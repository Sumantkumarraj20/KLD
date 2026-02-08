"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Kid {
  kid_id: string;
  name: string;
  balance: number;
  emoji: string;
}

interface ProfileSwitcherProps {
  kids: Kid[];
  activeKid: Kid | null;
  onSelectKid: (kid: Kid) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  kids,
  activeKid,
  onSelectKid,
  isLoading = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectKid = (kid: Kid) => {
    if (kid.kid_id !== activeKid?.kid_id) {
      onSelectKid(kid);
    }
    try {
      // Persist selection globally
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedKidId", kid.kid_id);
        window.dispatchEvent(new CustomEvent("kidChanged", { detail: kid }));
      }
    } catch (e) {
      // ignore
    }
    setIsOpen(false);
  };

  // Don't render if no kids or not active
  if (!activeKid || kids.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center ${compact ? "h-9 w-9 p-0 justify-center rounded-full" : "gap-2 h-9 px-3 rounded-lg"} bg-white/15 hover:bg-white/25 
                   text-white transition-colors duration-200 text-sm font-medium
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                   disabled:opacity-50 disabled:cursor-not-allowed`}
        title={activeKid ? `Switch profile: ${activeKid.name}` : "Switch profile"}
      >
        <span className="text-base">{activeKid.emoji}</span>
        {!compact && (
          <span className="hidden sm:inline max-w-[100px] truncate">
            {activeKid.name}
          </span>
        )}
        {!compact && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-xl 
                     border border-neutral-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Select Profile
            </p>
          </div>

          {/* Kids List */}
          <div className="max-h-72 overflow-y-auto">
            {kids.map((kid) => (
              <button
                key={kid.kid_id}
                onClick={() => handleSelectKid(kid)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150
                           ${
                             kid.kid_id === activeKid.kid_id
                               ? "bg-blue-50 text-blue-900 border-l-4 border-blue-500"
                               : "hover:bg-neutral-50 text-neutral-800"
                           }`}
              >
                <span className="text-2xl">{kid.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{kid.name}</p>
                  <p className="text-xs text-neutral-500">
                    {kid.balance} ⭐
                  </p>
                </div>
                {kid.kid_id === activeKid.kid_id && (
                  <span className="text-blue-500 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Footer - Back to Dashboard */}
          <div className="border-t border-neutral-100 px-4 py-2 bg-neutral-50">
            <a
              href="/kids"
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;

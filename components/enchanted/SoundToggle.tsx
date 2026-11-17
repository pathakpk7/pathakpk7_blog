"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { journalAudio } from "@/lib/audio/journalAudio";

export function SoundToggle({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(journalAudio.getEnabled());
  }, []);

  const handleToggle = () => {
    const next = journalAudio.toggle();
    setEnabled(next);
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-serif text-[#B99A63] bg-[#24190F]/70 hover:bg-[#24190F] border border-[#B99A63]/30 hover:border-[#B99A63]/70 transition-all shadow-md backdrop-blur-xs cursor-pointer select-none ${className}`}
      title={enabled ? "Mute journal sounds" : "Enable atmospheric journal sounds"}
      aria-label={enabled ? "Mute journal sounds" : "Enable atmospheric journal sounds"}
    >
      {enabled ? (
        <Volume2 className="w-3.5 h-3.5 text-[#B99A63] group-hover:scale-110 transition-transform" />
      ) : (
        <VolumeX className="w-3.5 h-3.5 text-[#8C6745] group-hover:scale-110 transition-transform" />
      )}
      <span className="hidden sm:inline text-[11px] tracking-wide text-[#E8D5AD]/80">
        {enabled ? "Sound On" : "Muted"}
      </span>
    </button>
  );
}

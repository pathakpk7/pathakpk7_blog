"use client";

import { ReactNode } from "react";
import { DustParticles } from "./DustParticles";
import { SoundToggle } from "./SoundToggle";

interface EnchantedDeskProps {
  children: ReactNode;
  className?: string;
  showSoundToggle?: boolean;
}

export function EnchantedDesk({
  children,
  className = "",
  showSoundToggle = true,
}: EnchantedDeskProps) {
  return (
    <div
      className={`relative min-h-screen w-full desk-surface overflow-hidden flex flex-col justify-center items-center py-8 sm:py-16 px-4 sm:px-6 select-none ${className}`}
    >
      {/* 1. Warm Candlelight Ambience Glow (top-right corner) */}
      <div className="absolute -top-16 -right-16 w-96 h-96 sm:w-[480px] sm:h-[480px] rounded-full bg-radial from-[#F59E0B]/18 via-[#B99A63]/10 to-transparent blur-3xl pointer-events-none animate-candle z-0" />

      {/* 2. Secondary soft amber light pool (centre desk illumination) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-radial from-[#D6BD91]/8 via-[#8C6745]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* 3. Deep Vignette Edges (Deep Shadow #17110D) */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#17110D]/40 to-[#100B08]/90 pointer-events-none z-0" />

      {/* 4. Floating Atmospheric Dust Particles */}
      <DustParticles count={24} />

      {/* 5. Top Controls: Atmospheric Sound Toggle */}
      {showSoundToggle && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-40">
          <SoundToggle />
        </div>
      )}

      {/* 6. Desk Focal Content */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

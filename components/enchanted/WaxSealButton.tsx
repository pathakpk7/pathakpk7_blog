"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { journalAudio } from "@/lib/audio/journalAudio";

interface WaxSealButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: "seal" | "flourish";
  type?: "button" | "submit";
}

export function WaxSealButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  variant = "seal",
  type = "button",
}: WaxSealButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    journalAudio.playMagicalUnseal();
    if (onClick) onClick();
  };

  if (variant === "flourish") {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`group inline-flex items-center space-x-2 text-xs sm:text-sm font-serif italic text-[#6E4522] hover:text-[#1A1209] transition-colors cursor-pointer disabled:opacity-50 py-1 px-3 ${className}`}
      >
        <span className="text-[#8C6745] group-hover:-translate-x-1 transition-transform">~</span>
        <span className="underline decoration-[#8C6745]/40 group-hover:decoration-[#1A1209] underline-offset-4">
          {children}
        </span>
        <span className="text-[#8C6745] group-hover:translate-x-1 transition-transform">~</span>
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={`relative group inline-flex items-center space-x-3.5 px-6 py-2.5 rounded-full cursor-pointer select-none transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        filter: isHovered
          ? "drop-shadow(0 6px 14px rgba(74, 15, 10, 0.45)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.35))"
          : "drop-shadow(0 4px 8px rgba(36, 10, 6, 0.35))",
      }}
      aria-label={typeof children === "string" ? children : "Unseal the journal"}
    >
      {/* 1. Realistic 3D Crimson Sealing Wax Stamp (Organic Melted Perimeter) */}
      <div className="relative w-12 h-12 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform group-hover:rotate-6 transition-transform duration-300"
        >
          <defs>
            {/* Deep rich crimson red wax gradient */}
            <radialGradient id="waxBody" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#A82820" />
              <stop offset="40%" stopColor="#8C1C14" />
              <stop offset="75%" stopColor="#66100B" />
              <stop offset="100%" stopColor="#400805" />
            </radialGradient>

            {/* Candlelight specular glint on wax rim */}
            <linearGradient id="waxGlint" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF8B80" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#A82820" stopOpacity="0" />
              <stop offset="70%" stopColor="#400805" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#250402" stopOpacity="0.9" />
            </linearGradient>

            {/* Embossed gold stamped impression */}
            <linearGradient id="goldSeal" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5D082" />
              <stop offset="50%" stopColor="#C99846" />
              <stop offset="100%" stopColor="#7A521E" />
            </linearGradient>
          </defs>

          {/* Organic Melted Wax Outer Silhouette (Natural uneven droplets) */}
          <path
            d="M 50 6 
               C 62 5, 74 10, 83 18 
               C 92 27, 96 38, 95 50 
               C 96 64, 89 77, 79 86 
               C 68 95, 54 96, 42 94 
               C 28 95, 14 87, 8 74 
               C 3 62, 4 48, 8 36 
               C 13 23, 24 11, 38 6 Z"
            fill="url(#waxBody)"
            stroke="url(#waxGlint)"
            strokeWidth="2.5"
          />

          {/* Recessed Stamped Center Ring */}
          <circle cx="50" cy="50" r="28" fill="#5E0E0A" stroke="#3D0604" strokeWidth="1.8" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="url(#goldSeal)" strokeWidth="0.8" strokeOpacity="0.7" strokeDasharray="3 1.5" />

          {/* Stamped Emblem: Ancient Grimoire / Quill Monogram in Gold */}
          <g transform="translate(34, 34) scale(0.32)">
            <path
              d="M 50 15 C 35 15, 20 22, 10 32 L 10 82 C 22 72, 38 68, 50 68 C 62 68, 78 72, 90 82 L 90 32 C 80 22, 65 15, 50 15 Z"
              fill="url(#goldSeal)"
            />
            <line x1="50" y1="18" x2="50" y2="68" stroke="#3D0604" strokeWidth="3" />
            <path d="M 50 35 L 75 10 L 72 25 Z" fill="#F5D082" opacity="0.9" />
          </g>

          {/* Candlelight Specular Highlight Arc */}
          <path
            d="M 28 20 C 40 13, 62 14, 76 22"
            stroke="#FFA89F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />
        </svg>
      </div>

      {/* 2. Manuscript Calligraphic Action Text */}
      <div className="flex flex-col text-left">
        <span className="font-serif tracking-widest text-[11px] sm:text-xs uppercase text-[#8C1C14] group-hover:text-[#5E0E0A] font-semibold transition-colors">
          {loading ? "Breaking the Seal..." : children}
        </span>
        <span className="font-handwritten text-xs sm:text-sm text-[#6E4522] italic -mt-0.5">
          Press to unseal the folio
        </span>
      </div>
    </motion.button>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FeatherQuillProps {
  state: "resting" | "lifting" | "dipping" | "writing";
  onClick?: () => void;
  className?: string;
  cursorPos?: { x: number; y: number } | null;
  interactive?: boolean;
}

export function FeatherQuill({
  state,
  onClick,
  className = "",
  cursorPos,
  interactive = true,
}: FeatherQuillProps) {
  const [isHovered, setIsHovered] = useState(false);

  // When writing on desktop, if cursorPos is provided, position smoothly near cursor
  if (state === "writing" && cursorPos) {
    return (
      <motion.div
        animate={{
          x: cursorPos.x + 8,
          y: cursorPos.y - 75,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.2 }}
        className="fixed pointer-events-none z-50 select-none hidden md:block"
        style={{ transformOrigin: "bottom left" }}
      >
        <svg
          width="110"
          height="130"
          viewBox="0 0 110 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow(4px 10px 10px rgba(23,17,13,0.5)) -rotate-12"
        >
          <QuillGraphics />
        </svg>
      </motion.div>
    );
  }

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Resting shadow on wooden desk */}
      <motion.div
        animate={{
          scale: isHovered || state !== "resting" ? 1.08 : 1,
          opacity: state === "resting" ? (isHovered ? 0.7 : 0.55) : 0.25,
          y: state === "resting" ? 0 : 12,
        }}
        className="absolute -bottom-4 -left-3 w-48 h-10 bg-[#17110D] rounded-full blur-md -rotate-35 pointer-events-none"
      />

      <motion.button
        type="button"
        disabled={!interactive || state !== "resting"}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          rotate: state === "resting" ? (isHovered ? -28 : -32) : state === "lifting" ? -15 : state === "dipping" ? 15 : -25,
          y: state === "resting" ? (isHovered ? -8 : 0) : state === "lifting" ? -25 : state === "dipping" ? 12 : -10,
          scale: isHovered && state === "resting" ? 1.04 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-20 group block focus:outline-none cursor-pointer ${
          !interactive ? "pointer-events-none" : ""
        }`}
        aria-label="Pick up the feather quill"
      >
        {/* Golden glow aura on hover */}
        {isHovered && state === "resting" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.6, scale: 1.08 }}
            className="absolute inset-0 bg-radial from-[#B99A63]/30 via-transparent to-transparent blur-lg rounded-full pointer-events-none"
          />
        )}

        {/* Realistic Feather Quill Graphic */}
        <svg
          width="130"
          height="160"
          viewBox="0 0 110 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow(2px 6px 12px rgba(23,17,13,0.65))"
        >
          <QuillGraphics />
        </svg>

        {/* Hover Tooltip */}
        {state === "resting" && interactive && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="px-2.5 py-1 text-[11px] font-serif text-[#E8D5AD] bg-[#24190F]/90 border border-[#B99A63]/50 rounded-sm shadow-md">
              Pick up the quill
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}

function QuillGraphics() {
  return (
    <>
      <defs>
        {/* Feather Vane Gradient (Natural antique parchment-toned swan feather) */}
        <linearGradient id="featherVane" x1="20" y1="10" x2="90" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF4E6" />
          <stop offset="35%" stopColor="#EAD8B8" />
          <stop offset="70%" stopColor="#D2BD95" />
          <stop offset="100%" stopColor="#9C784F" />
        </linearGradient>

        {/* Central Rachis Shaft Gradient */}
        <linearGradient id="quillShaft" x1="15" y1="110" x2="85" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5EDD6" />
          <stop offset="60%" stopColor="#C9AB75" />
          <stop offset="100%" stopColor="#7B5633" />
        </linearGradient>

        {/* Antique Gold/Brass Ferrule */}
        <linearGradient id="brassNib" x1="10" y1="110" x2="25" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B99A63" />
          <stop offset="40%" stopColor="#E5C788" />
          <stop offset="70%" stopColor="#8C6745" />
          <stop offset="100%" stopColor="#24190F" />
        </linearGradient>
      </defs>

      {/* Main Feather Vane (Left & Right Barbs) */}
      <path
        d="M88 12 C 78 30, 68 55, 48 85 C 42 94, 32 104, 25 110 C 22 105, 26 95, 34 82 C 45 64, 62 40, 75 22 C 79 16, 84 13, 88 12 Z"
        fill="url(#featherVane)"
      />
      <path
        d="M88 12 C 96 28, 92 50, 75 75 C 62 92, 45 106, 25 110 C 35 100, 48 85, 60 68 C 72 50, 82 32, 88 12 Z"
        fill="url(#featherVane)"
        opacity="0.9"
      />

      {/* Feather Barb Texture Details */}
      <path
        d="M78 24 L60 38 M72 35 L52 50 M65 48 L46 63 M58 60 L38 76 M50 72 L32 88 M42 85 L26 98"
        stroke="#8C6745"
        strokeWidth="0.5"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      <path
        d="M84 28 L92 35 M77 42 L88 50 M70 56 L80 66 M60 70 L70 80"
        stroke="#8C6745"
        strokeWidth="0.5"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Natural Feather Vane Clefts (Imperfections of real feather) */}
      <path d="M68 38 L62 40" stroke="#17110D" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M52 58 L46 61" stroke="#17110D" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M76 46 L82 48" stroke="#17110D" strokeWidth="0.8" strokeOpacity="0.3" />

      {/* Central Rachis / Quill Shaft */}
      <path
        d="M88 12 C 76 35, 58 65, 35 95 L 23 112 L 20 116 L 23 113 C 45 85, 66 52, 88 12 Z"
        fill="url(#quillShaft)"
        stroke="#49321F"
        strokeWidth="0.5"
      />

      {/* Brass / Gold Ferrule Ring */}
      <path
        d="M19 114 L24 111 L27 115 L22 118 Z"
        fill="url(#brassNib)"
        stroke="#49321F"
        strokeWidth="0.6"
      />

      {/* Steel / Dark Iron Writing Nib */}
      <path
        d="M20 117 L12 126 C 11.5 126.8, 12 127.2, 12.8 126.5 L17 122 Z"
        fill="#24190F"
      />
      <path
        d="M12 126 L17 121"
        stroke="#B99A63"
        strokeWidth="0.75"
        strokeLinecap="round"
      />

      {/* Nib slit */}
      <line x1="12" y1="126" x2="16" y2="121" stroke="#FAF4E6" strokeWidth="0.4" strokeOpacity="0.8" />
    </>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { journalAudio } from "@/lib/audio/journalAudio";

interface LeatherBookCoverProps {
  isOpen: boolean;
  onOpen: () => void;
  className?: string;
}

export function LeatherBookCover({ isOpen, onOpen, className = "" }: LeatherBookCoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = () => {
    if (isUnlocking || isOpen) return;
    setIsUnlocking(true);
    journalAudio.playMagneticClick();

    // After magnetic click, swing the book open
    setTimeout(() => {
      journalAudio.playPaperTurn();
      onOpen();
      setIsUnlocking(false);
    }, 450);
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ perspective: "1600px" }}
    >
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateY: isUnlocking ? -25 : 0,
            }}
            exit={{
              rotateY: -115,
              opacity: [1, 1, 0],
              scale: [1, 1.02, 0.95],
              transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
            className="relative w-[340px] sm:w-[420px] md:w-[480px] h-[480px] sm:h-[560px] md:h-[620px] cursor-pointer"
            onClick={handleUnlock}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Deep physical shadow cast onto the desk */}
            <div className="absolute -inset-2 bg-[#0a0604] rounded-xl blur-2xl opacity-80 translate-y-6 pointer-events-none" />
            <div className="absolute right-0 -bottom-4 w-40 h-16 bg-[#0a0604] rounded-full blur-xl opacity-70 pointer-events-none" />

            {/* Book Pages Stack Rim (Visible paper edge on right & bottom) */}
            <div className="absolute top-2 right-1 bottom-2 w-6 bg-[#E8D5AD] rounded-r-md border border-[#8C6745]/40 shadow-inner flex flex-col justify-around py-4">
              <div className="w-full h-[1px] bg-[#8C6745]/20" />
              <div className="w-full h-[1px] bg-[#8C6745]/20" />
              <div className="w-full h-[1px] bg-[#8C6745]/20" />
              <div className="w-full h-[1px] bg-[#8C6745]/20" />
            </div>

            {/* Cognac Saddle-Tan Leather Cover Body */}
            <div className="relative w-full h-full rounded-l-md rounded-r-xl overflow-hidden shadow-2xl border-t border-l border-[#B56734]/40 border-r border-b border-[#3D1A07]">
              {/* Rich Saddle Tan Leather Gradient with Ambient Light */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: "#8F451B",
                  backgroundImage: `
                    radial-gradient(ellipse at 35% 25%, rgba(214, 133, 79, 0.45) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 80%, rgba(61, 26, 7, 0.55) 0%, transparent 70%),
                    linear-gradient(135deg, #A85A2A 0%, #8F451B 50%, #6E3110 100%)
                  `,
                }}
              />

              {/* Leather Grain Micro-Texture */}
              <div
                className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none z-1"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                  backgroundSize: "6px 6px",
                }}
              />

              {/* Left Spine Shadow Crease */}
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#3D1A07]/80 via-[#3D1A07]/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-8 w-[1.5px] bg-[#3D1A07]/60 z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-9 w-[1px] bg-[#E2B383]/30 z-10 pointer-events-none" />

              {/* Perimeter Stitched Border Detail (Identical to reference image) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <rect
                  x="14"
                  y="14"
                  width="calc(100% - 28px)"
                  height="calc(100% - 28px)"
                  rx="10"
                  fill="none"
                  stroke="#E2B383"
                  strokeWidth="1.2"
                  strokeOpacity="0.65"
                  strokeDasharray="4 3"
                />
              </svg>

              {/* Embossed & Gilt Cover Title: "Pathak.pk Blog" */}
              <div className="relative z-20 flex flex-col items-center justify-center h-full px-8 text-center space-y-4">
                <span className="text-[10px] sm:text-xs font-serif tracking-[0.3em] uppercase text-[#F5D082]/70 font-medium">
                  The Enchanted Folio
                </span>

                <div className="space-y-1">
                  <h1
                    className="font-manuscript text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight"
                    style={{
                      color: "#F5D082",
                      textShadow:
                        "0 1px 1px rgba(255,255,255,0.3), 0 -1px 2px rgba(61,26,7,0.8), 0 2px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    Pathak.pk Blog
                  </h1>
                  <p
                    className="font-cormorant text-base sm:text-lg italic"
                    style={{
                      color: "#E2B383",
                      textShadow: "0 -1px 1px rgba(61,26,7,0.7)",
                    }}
                  >
                    Interpretation over repetition
                  </p>
                </div>

                {/* Subtle Ornamental Vignette */}
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#F5D082]/60 to-transparent mt-2" />

                {/* Clasp Instruction Tooltip */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="pt-16 sm:pt-20"
                >
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-serif tracking-wider text-[#FAF4E6] bg-[#3D1A07]/75 border border-[#F5D082]/30 shadow-md backdrop-blur-xs">
                    {isUnlocking ? "Unlocking magnetic clasp..." : "Click magnetic lock to open →"}
                  </span>
                </motion.div>
              </div>

              {/* =========================================================================
                  THE MAGNETIC CLASP STRAP & GUNMETAL OVAL RING (From Reference Photo)
              ========================================================================= */}
              <motion.div
                animate={{
                  x: isUnlocking ? 24 : isHovered ? 4 : 0,
                  rotateY: isUnlocking ? 25 : 0,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute top-1/2 -translate-y-1/2 right-0 z-30 flex items-center cursor-pointer"
                style={{ transformOrigin: "right center" }}
              >
                {/* Leather Strap Flap */}
                <div
                  className="relative h-16 sm:h-20 w-24 sm:w-28 rounded-l-md shadow-2xl flex items-center justify-start pl-3 sm:pl-4 border-t border-b border-l border-[#B56734]/50"
                  style={{
                    backgroundColor: "#8F451B",
                    backgroundImage: "linear-gradient(135deg, #A85A2A 0%, #8F451B 60%, #6E3110 100%)",
                  }}
                >
                  {/* Flap perimeter stitching */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path
                      d="M 90 6 L 8 6 C 5 6, 4 8, 4 12 L 4 68 C 4 72, 5 74, 8 74 L 90 74"
                      fill="none"
                      stroke="#E2B383"
                      strokeWidth="1.2"
                      strokeOpacity="0.75"
                      strokeDasharray="4 3"
                    />
                  </svg>

                  {/* Gunmetal Oval Magnetic Ring Clasp Lock (Matching Photo) */}
                  <div className="relative w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center">
                    <svg viewBox="0 0 60 60" className="w-full h-full filter drop-shadow(0 4px 6px rgba(0,0,0,0.6))">
                      <defs>
                        {/* Metallic brushed gunmetal ring gradient */}
                        <linearGradient id="gunmetalRing" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#8A8F98" />
                          <stop offset="25%" stopColor="#4A4E57" />
                          <stop offset="50%" stopColor="#2A2D34" />
                          <stop offset="75%" stopColor="#555963" />
                          <stop offset="100%" stopColor="#1E2025" />
                        </linearGradient>

                        {/* Inner magnetic cylinder button */}
                        <linearGradient id="magneticCylinder" x1="15" y1="20" x2="45" y2="40" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#A8ADB6" />
                          <stop offset="45%" stopColor="#3C4048" />
                          <stop offset="100%" stopColor="#1B1C20" />
                        </linearGradient>
                      </defs>

                      {/* Outer Gunmetal Oval Ring */}
                      <circle cx="30" cy="30" r="26" fill="url(#gunmetalRing)" stroke="#17181C" strokeWidth="2" />
                      <circle cx="30" cy="30" r="23" fill="#1C1D21" />

                      {/* Inner Magnetic Release Capsule Lock */}
                      <rect
                        x="14"
                        y="22"
                        width="32"
                        height="16"
                        rx="8"
                        fill="url(#magneticCylinder)"
                        stroke="#0D0E10"
                        strokeWidth="1.5"
                      />

                      {/* Specular metallic highlight glint */}
                      <path
                        d="M 16 25 Q 30 23 44 25"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeOpacity="0.5"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

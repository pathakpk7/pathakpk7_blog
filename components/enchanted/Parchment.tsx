"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ParchmentProps {
  children: ReactNode;
  variant?: "aged" | "fresh";
  className?: string;
  isUnfolding?: boolean;
}

export function Parchment({
  children,
  variant = "aged",
  className = "",
  isUnfolding = false,
}: ParchmentProps) {
  const isFresh = variant === "fresh";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={
        isUnfolding
          ? {
              scale: [1, 1.04, 1.25],
              opacity: [1, 1, 0],
              filter: ["blur(0px)", "blur(2px)", "blur(8px)"],
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: isUnfolding ? 0.85 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative max-w-2xl w-full mx-auto ${className}`}
    >
      {/* Multi-layered physical drop shadow onto desk */}
      <div className="absolute inset-2 sm:inset-4 bg-[#17110D] rounded-xs blur-xl opacity-75 transform translate-y-6 -z-10 pointer-events-none" />
      <div className="absolute inset-1 sm:inset-2 bg-[#24190F] rounded-xs blur-md opacity-45 transform translate-y-3 -z-10 pointer-events-none" />

      {/* The Physical Parchment Sheet */}
      <div
        className={`relative z-10 p-6 sm:p-12 md:p-16 rounded-xs overflow-hidden transition-all duration-300 ${
          isFresh ? "parchment-texture-fresh" : "parchment-texture"
        }`}
        style={{
          border: isFresh ? "1px solid rgba(185, 154, 99, 0.35)" : "1px solid rgba(140, 103, 69, 0.4)",
        }}
      >
        {/* Organic SVG Paper Fiber Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-multiply"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="paperFiber">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feColorMatrix
              type="matrix"
              values="0.33 0.33 0.33 0 0
                      0.33 0.33 0.33 0 0
                      0.33 0.33 0.33 0 0
                      0    0    0    0.15 0"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#paperFiber)" />
        </svg>

        {/* Aged paper subtle vignette burn around corners */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-transparent to-[#49321F]/20" />

        {/* Vintage Top Corner Crease */}
        <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#D6BD91] border-b border-l border-[#8C6745]/40 shadow-xs rotate-45 transform" />
        </div>

        {/* Content Inside Parchment */}
        <div className="relative z-20 text-[#24190F]">{children}</div>
      </div>
    </motion.div>
  );
}

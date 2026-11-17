"use client";

import { motion } from "framer-motion";

interface InkpotProps {
  isRippling?: boolean;
  className?: string;
}

export function Inkpot({ isRippling = false, className = "" }: InkpotProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Deep contact shadow on desk */}
      <div className="absolute -bottom-2 w-20 h-8 bg-[#17110D] rounded-full blur-md opacity-80" />

      {/* Antique Glass Inkpot SVG */}
      <svg
        width="80"
        height="84"
        viewBox="0 0 80 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow(0 8px 12px rgba(23,17,13,0.6))"
      >
        <defs>
          <linearGradient id="glassBody" x1="0" y1="0" x2="80" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2e2217" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#1a120c" stopOpacity="0.98" />
            <stop offset="70%" stopColor="#0f0a06" stopOpacity="1" />
            <stop offset="100%" stopColor="#24190f" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="brassCollar" x1="20" y1="12" x2="60" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="45%" stopColor="#b99a63" />
            <stop offset="70%" stopColor="#8c6745" />
            <stop offset="100%" stopColor="#5a422d" />
          </linearGradient>

          <radialGradient id="inkSurface" cx="40" cy="22" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#100b07" />
            <stop offset="60%" stopColor="#1a120b" />
            <stop offset="100%" stopColor="#24190f" />
          </radialGradient>
        </defs>

        {/* Inkpot Glass Base (Faceted octagon) */}
        <path
          d="M22 24 L58 24 L68 40 L72 68 L60 80 L20 80 L8 68 L12 40 Z"
          fill="url(#glassBody)"
          stroke="#49321f"
          strokeWidth="1.5"
        />

        {/* Glass Facet Shading */}
        <path
          d="M22 24 L20 80 M58 24 L60 80 M68 40 L60 80 M12 40 L20 80"
          stroke="#8c6745"
          strokeWidth="0.75"
          strokeOpacity="0.4"
        />

        {/* Ambient Dark Ink Level inside bottle */}
        <path
          d="M13 46 L67 46 L70 66 L59 78 L21 78 L10 66 Z"
          fill="#17110d"
          fillOpacity="0.9"
        />

        {/* Glass Reflection Highlight */}
        <path
          d="M16 42 Q 13 56 16 70"
          stroke="#b99a63"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        <path
          d="M20 38 Q 18 52 20 64"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeOpacity="0.25"
        />

        {/* Brass Collar Rim */}
        <ellipse cx="40" cy="20" rx="18" ry="7" fill="url(#brassCollar)" stroke="#b99a63" strokeWidth="1" />
        <ellipse cx="40" cy="18" rx="15" ry="5.5" fill="#49321f" stroke="#8c6745" strokeWidth="0.8" />

        {/* Ink Well Opening */}
        <ellipse cx="40" cy="18" rx="12" ry="4.5" fill="url(#inkSurface)" />

        {/* Subtle Ink Shimmer */}
        <ellipse cx="38" cy="17" rx="6" ry="1.8" fill="#362517" opacity="0.6" />
      </svg>

      {/* Ink Ripple Animation when dipping quill */}
      {isRippling && (
        <motion.div
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute top-5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border border-[#b99a63]/70 pointer-events-none"
        />
      )}
    </div>
  );
}

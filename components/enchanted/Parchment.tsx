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
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={
        isUnfolding
          ? {
              scale: [1, 1.05, 1.28],
              opacity: [1, 1, 0],
              filter: ["blur(0px)", "blur(2px)", "blur(10px)"],
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: isUnfolding ? 0.85 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative max-w-2xl w-full mx-auto select-none ${className}`}
    >
      {/* =========================================================================
          1. PHYSICAL MULTI-TIER SHADOWS (Parchment resting on antique wood)
          - Tight contact shadow directly under center
          - Wide ambient desk penumbra
          - Lifting corner shadows on bottom-left and bottom-right
      ========================================================================= */}
      {/* Center contact shadow */}
      <div className="absolute inset-x-8 top-10 bottom-4 bg-[#0a0604] rounded-sm blur-md opacity-75 -z-10 pointer-events-none" />
      {/* Directional desk shadow from candlelight */}
      <div className="absolute inset-x-4 top-12 -bottom-6 bg-[#140d08] rounded-md blur-2xl opacity-80 -z-10 pointer-events-none translate-y-3" />
      {/* Left corner lift shadow */}
      <div className="absolute -left-2 -bottom-5 w-32 h-16 bg-[#0a0604] rounded-full blur-xl opacity-65 -z-10 pointer-events-none -rotate-12" />
      {/* Right corner lift shadow (greater elevation) */}
      <div className="absolute -right-3 -bottom-6 w-36 h-20 bg-[#0a0604] rounded-full blur-xl opacity-75 -z-10 pointer-events-none rotate-12" />

      {/* =========================================================================
          2. THE AUTHENTIC DECKLE-EDGE PARCHMENT LEAF
          Rendered with organic deckle borders, burnt sepia margins, creases, and stains.
      ========================================================================= */}
      <div className="relative z-10 w-full overflow-hidden rounded-[4px] p-6 sm:p-12 md:p-14 transition-all duration-300">
        {/* Background SVG Canvas providing genuine organic ragged deckle edge & paper grain */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
          viewBox="0 0 700 900"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Turbulence for microscopic torn paper fibers along edges */}
            <filter id="deckleFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* High-resolution paper grain surface relief */}
            <filter id="vellumGrain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="4" result="paperNoise" />
              <feColorMatrix
                type="matrix"
                values="0.33 0.33 0.33 0 0
                        0.33 0.33 0.33 0 0
                        0.33 0.33 0.33 0 0
                        0    0    0    0.22 0"
                result="colorNoise"
              />
              <feComposite in="SourceGraphic" in2="colorNoise" operator="in" />
            </filter>

            {/* Parchment Base Gradient (Darker burnt sepia at perimeter, aged gold in center) */}
            <radialGradient id="agedParchmentBase" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor={isFresh ? "#F2E6CE" : "#EAD6B0"} />
              <stop offset="45%" stopColor={isFresh ? "#E9D9BC" : "#DFC79C"} />
              <stop offset="75%" stopColor={isFresh ? "#D4BF9A" : "#CDB082"} />
              <stop offset="92%" stopColor={isFresh ? "#B8996F" : "#A88355"} />
              <stop offset="100%" stopColor={isFresh ? "#825E3B" : "#6E4522"} />
            </radialGradient>

            {/* Burnt Edge Gradient around border */}
            <linearGradient id="edgeBurnTop" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A2F17" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#7A5230" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#7A5230" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="edgeBurnBottom" x1="0" y1="900" x2="0" y2="850" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B220E" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#694320" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#694320" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="edgeBurnLeft" x1="0" y1="0" x2="45" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A2F17" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7A5230" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7A5230" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="edgeBurnRight" x1="700" y1="0" x2="655" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A2F17" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7A5230" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7A5230" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Organic Ragged Deckle-Edge Parchment Leaf Silhouette */}
          <path
            d="M 18 14 
               C 70 12, 140 16, 210 13 
               C 280 15, 350 12, 420 14 
               C 490 12, 560 16, 630 13 
               C 660 14, 680 16, 684 22 
               C 689 35, 685 80, 688 150 
               C 685 220, 689 290, 686 360 
               C 689 430, 685 500, 688 570 
               C 686 640, 689 710, 686 780 
               C 688 830, 685 868, 680 882 
               C 670 889, 640 886, 580 888 
               C 510 885, 440 888, 370 886 
               C 300 888, 230 885, 160 887 
               C 90 885, 40 888, 22 882 
               C 14 870, 16 830, 14 770 
               C 17 700, 13 630, 16 560 
               C 13 490, 17 420, 14 350 
               C 16 280, 13 210, 16 140 
               C 14 80, 16 35, 18 14 Z"
            fill="url(#agedParchmentBase)"
            stroke="#5A3A1E"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            filter="url(#deckleFilter)"
          />

          {/* 2. Micro-Deckle Edge Shading / Burnt Borders */}
          <rect x="0" y="0" width="700" height="40" fill="url(#edgeBurnTop)" />
          <rect x="0" y="850" width="700" height="50" fill="url(#edgeBurnBottom)" />
          <rect x="0" y="0" width="45" height="900" fill="url(#edgeBurnLeft)" />
          <rect x="655" y="0" width="45" height="900" fill="url(#edgeBurnRight)" />

          {/* 3. Physical Manuscript Ruling (Authentic pale sepia horizontal scribe lines) */}
          <g stroke="#8C6745" strokeOpacity="0.16" strokeDasharray="4 2" strokeWidth="0.8">
            <line x1="55" y1="110" x2="645" y2="110" />
            <line x1="55" y1="145" x2="645" y2="145" />
            <line x1="55" y1="180" x2="645" y2="180" />
            <line x1="55" y1="215" x2="645" y2="215" />
            <line x1="55" y1="250" x2="645" y2="250" />
            <line x1="55" y1="285" x2="645" y2="285" />
            <line x1="55" y1="320" x2="645" y2="320" />
            <line x1="55" y1="355" x2="645" y2="355" />
            <line x1="55" y1="390" x2="645" y2="390" />
            <line x1="55" y1="425" x2="645" y2="425" />
            <line x1="55" y1="460" x2="645" y2="460" />
            <line x1="55" y1="495" x2="645" y2="495" />
            <line x1="55" y1="530" x2="645" y2="530" />
            <line x1="55" y1="565" x2="645" y2="565" />
            <line x1="55" y1="600" x2="645" y2="600" />
            <line x1="55" y1="635" x2="645" y2="635" />
            <line x1="55" y1="670" x2="645" y2="670" />
            <line x1="55" y1="705" x2="645" y2="705" />
            <line x1="55" y1="740" x2="645" y2="740" />
            <line x1="55" y1="775" x2="645" y2="775" />
            <line x1="55" y1="810" x2="645" y2="810" />
          </g>

          {/* 4. Vertical Scribe Pricking Margins (Historical text boundaries) */}
          <line x1="55" y1="60" x2="55" y2="840" stroke="#8C6745" strokeOpacity="0.22" strokeWidth="0.8" />
          <line x1="645" y1="60" x2="645" y2="840" stroke="#8C6745" strokeOpacity="0.22" strokeWidth="0.8" />

          {/* 5. Center Longitudinal Paper Crease (Fold mark down the spine) */}
          <line x1="349.5" y1="14" x2="349.5" y2="886" stroke="#FAF4E6" strokeOpacity="0.3" strokeWidth="1.2" />
          <line x1="351" y1="14" x2="351" y2="886" stroke="#4A2F17" strokeOpacity="0.2" strokeWidth="1.2" />

          {/* 6. Ancient Dried Tea / Watermark Stain in Upper Right */}
          <ellipse
            cx="540"
            cy="190"
            rx="52"
            ry="48"
            fill="none"
            stroke="#8C6745"
            strokeWidth="3.5"
            strokeOpacity="0.08"
            strokeDasharray="18 4 3 6"
          />
          <ellipse
            cx="542"
            cy="192"
            rx="46"
            ry="42"
            fill="#8C6745"
            fillOpacity="0.03"
          />

          {/* 7. Organic Foxing Age Spots */}
          <circle cx="120" cy="280" r="3" fill="#6E4522" fillOpacity="0.18" />
          <circle cx="580" cy="620" r="2.5" fill="#6E4522" fillOpacity="0.15" />
          <circle cx="210" cy="740" r="4" fill="#6E4522" fillOpacity="0.12" />
          <circle cx="480" cy="380" r="2" fill="#6E4522" fillOpacity="0.14" />
          <circle cx="95" cy="510" r="3.5" fill="#6E4522" fillOpacity="0.1" />

          {/* 8. Handcrafted Dog-Ear Corner Curl (Top Right) */}
          <g filter="drop-shadow(-3px 4px 5px rgba(20,13,8,0.45))">
            {/* The folded back side of parchment */}
            <path
              d="M 640 14 L 684 58 L 640 58 Z"
              fill="#D4BA8C"
              stroke="#6E4522"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            {/* Soft inner shadow on the fold */}
            <path
              d="M 640 14 L 684 58 L 638 60 Z"
              fill="#5A3A1E"
              fillOpacity="0.25"
            />
          </g>
        </svg>

        {/* Cellulose Paper Grain Texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply z-1"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, rgba(90,58,30,0.15) 100%)`,
          }}
        />

        {/* =========================================================================
            3. MANUSCRIPT LEAF CONTENT CONTAINER
            Generous historical margins, authentic dark iron-gall ink text rendering
        ========================================================================= */}
        <div className="relative z-10 text-[#1A1209] px-2 sm:px-6 md:px-8 py-2">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

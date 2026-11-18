"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HorizontalParchmentProps {
  children: ReactNode;
  className?: string;
  isPageTurning?: boolean;
}

export function HorizontalParchment({
  children,
  className = "",
  isPageTurning = false,
}: HorizontalParchmentProps) {
  return (
    <div
      className={`relative w-full max-w-5xl h-[80vh] max-h-[580px] min-h-[460px] mx-auto select-none flex items-center justify-center ${className}`}
      style={{ perspective: "1800px" }}
    >
      {/* Deep desk contact shadow */}
      <div className="absolute inset-x-8 top-12 -bottom-4 bg-[#0a0604] rounded-2xl blur-2xl opacity-85 -z-10 pointer-events-none" />
      <div className="absolute -left-4 -bottom-6 w-44 h-24 bg-[#0a0604] rounded-full blur-xl opacity-75 -z-10 pointer-events-none -rotate-6" />
      <div className="absolute -right-4 -bottom-6 w-44 h-24 bg-[#0a0604] rounded-full blur-xl opacity-75 -z-10 pointer-events-none rotate-6" />

      {/* The Physical Horizontal Bhojpatra Birch Bark Manuscript */}
      <motion.div
        animate={
          isPageTurning
            ? {
                rotateY: [0, -18, 0],
                scale: [1, 0.99, 1],
                filter: ["brightness(1)", "brightness(0.92)", "brightness(1)"],
              }
            : { rotateY: 0, scale: 1, filter: "brightness(1)" }
        }
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full rounded-[6px] overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-between shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "left center",
        }}
      >
        {/* =========================================================================
            BHOJPATRA (HIMALAYAN BIRCH BARK) PARCHMENT SVG
            Ragged peeling bark edges, horizontal bark lenticels, aged amber patina
        ========================================================================= */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
          viewBox="0 0 1000 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Edge tearing filter */}
            <filter id="barkEdgeFilter" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* Bhojpatra Honey-Amber Bark Gradient */}
            <radialGradient id="bhojpatraGradient" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#F0DCB4" />
              <stop offset="50%" stopColor="#E5C796" />
              <stop offset="80%" stopColor="#D4AE77" />
              <stop offset="94%" stopColor="#9C6B38" />
              <stop offset="100%" stopColor="#5E3816" />
            </radialGradient>

            {/* Peeling Dark Outer Bark Rim Gradients */}
            <linearGradient id="barkLeft" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#381E09" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#6E4018" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6E4018" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="barkRight" x1="1000" y1="0" x2="940" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#381E09" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#6E4018" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6E4018" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="barkTop" x1="0" y1="0" x2="0" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A290E" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4A290E" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="barkBottom" x1="0" y1="600" x2="0" y2="555" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#331A06" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#331A06" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Natural Bhojpatra Bark Contour Path (Organic ragged edges) */}
          <path
            d="M 22 18 
               C 100 14, 250 19, 400 16 
               C 550 18, 700 15, 850 18 
               C 920 16, 965 19, 978 26 
               C 986 42, 982 120, 986 220 
               C 983 320, 987 420, 984 520 
               C 982 560, 976 578, 968 584 
               C 920 588, 800 585, 650 588 
               C 500 585, 350 587, 200 585 
               C 100 588, 45 586, 24 578 
               C 15 565, 17 480, 14 380 
               C 18 280, 13 180, 16 80 
               C 14 45, 17 28, 22 18 Z"
            fill="url(#bhojpatraGradient)"
            stroke="#4A290E"
            strokeWidth="2"
            filter="url(#barkEdgeFilter)"
          />

          {/* 2. Peeling Birch Bark Shading along 4 Margins */}
          <rect x="0" y="0" width="60" height="600" fill="url(#barkLeft)" />
          <rect x="940" y="0" width="60" height="600" fill="url(#barkRight)" />
          <rect x="0" y="0" width="1000" height="45" fill="url(#barkTop)" />
          <rect x="0" y="555" width="1000" height="45" fill="url(#barkBottom)" />

          {/* 3. Horizontal Birch Bark Lenticels (Characteristic Bhojpatra streaks) */}
          <g stroke="#5E3816" strokeOpacity="0.18" strokeLinecap="round">
            <line x1="80" y1="75" x2="160" y2="75" strokeWidth="2" />
            <line x1="280" y1="65" x2="350" y2="65" strokeWidth="1.5" />
            <line x1="620" y1="80" x2="710" y2="80" strokeWidth="2.5" />
            <line x1="840" y1="90" x2="910" y2="90" strokeWidth="1.8" />

            <line x1="120" y1="180" x2="220" y2="180" strokeWidth="2" />
            <line x1="450" y1="160" x2="560" y2="160" strokeWidth="3" />
            <line x1="780" y1="190" x2="860" y2="190" strokeWidth="2" />

            <line x1="90" y1="310" x2="170" y2="310" strokeWidth="1.8" />
            <line x1="320" y1="340" x2="420" y2="340" strokeWidth="2.5" />
            <line x1="650" y1="300" x2="740" y2="300" strokeWidth="2" />
            <line x1="820" y1="320" x2="890" y2="320" strokeWidth="1.6" />

            <line x1="140" y1="440" x2="250" y2="440" strokeWidth="2.5" />
            <line x1="480" y1="460" x2="590" y2="460" strokeWidth="2" />
            <line x1="720" y1="430" x2="810" y2="430" strokeWidth="2.2" />

            <line x1="210" y1="520" x2="300" y2="520" strokeWidth="1.5" />
            <line x1="610" y1="535" x2="690" y2="535" strokeWidth="2" />
            <line x1="790" y1="515" x2="880" y2="515" strokeWidth="2.5" />
          </g>

          {/* 4. Fine Horizontal Scribe Ruling Lines across the Leaf */}
          <g stroke="#7A5230" strokeOpacity="0.14" strokeDasharray="3 3" strokeWidth="0.8">
            <line x1="70" y1="110" x2="930" y2="110" />
            <line x1="70" y1="150" x2="930" y2="150" />
            <line x1="70" y1="190" x2="930" y2="190" />
            <line x1="70" y1="230" x2="930" y2="230" />
            <line x1="70" y1="270" x2="930" y2="270" />
            <line x1="70" y1="310" x2="930" y2="310" />
            <line x1="70" y1="350" x2="930" y2="350" />
            <line x1="70" y1="390" x2="930" y2="390" />
            <line x1="70" y1="430" x2="930" y2="430" />
            <line x1="70" y1="470" x2="930" y2="470" />
            <line x1="70" y1="510" x2="930" y2="510" />
          </g>

          {/* 5. Center Spine Division (Double-folio spread line) */}
          <line x1="499.5" y1="18" x2="499.5" y2="584" stroke="#FAF4E6" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="500.5" y1="18" x2="500.5" y2="584" stroke="#4A290E" strokeOpacity="0.2" strokeWidth="1.2" />

          {/* 6. Realistic Bark Peeling Curl in Bottom-Right Corner */}
          <g filter="drop-shadow(-3px -3px 4px rgba(20,10,4,0.4))">
            <path
              d="M 940 584 L 978 546 L 940 546 Z"
              fill="#C49A62"
              stroke="#5E3816"
              strokeWidth="1"
            />
          </g>
        </svg>

        {/* Ambient Wood Pulp Fiber overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply z-1"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, rgba(74,41,14,0.18) 100%)`,
          }}
        />

        {/* Interior Content Container (Fits in 1 frame, no scrolling down) */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden text-[#1A1209]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

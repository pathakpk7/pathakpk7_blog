"use client";

import { ReactNode } from "react";

interface BhojpatraManuscriptProps {
  children: ReactNode;
  className?: string;
}

/**
 * Authentic Himalayan Bhojpatra (Birch Bark) Manuscript Container
 * Inspired by reference photo 2 (sacred ancient birch bark leaf):
 * - Organic ragged peeling bark edges
 * - Horizontal lenticel striations
 * - Warm honey-amber/gold bark patina
 * - Stretched across the screen, adapting to all screen sizes & font sizes
 */
export function BhojpatraManuscript({ children, className = "" }: BhojpatraManuscriptProps) {
  return (
    <div className={`relative w-full min-h-screen py-6 sm:py-10 px-2 sm:px-4 md:px-6 lg:px-8 select-text ${className}`}>
      {/* Surrounding Ambient Desk Glow */}
      <div className="absolute inset-0 bg-[#0F0A06] -z-20 pointer-events-none" />
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 15%, rgba(245, 158, 11, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 85%, rgba(185, 154, 99, 0.08) 0%, transparent 70%)
          `,
        }}
      />

      {/* Main Bhojpatra Sheet Container — Stretched across the screen */}
      <div className="relative w-full max-w-5xl xl:max-w-6xl mx-auto rounded-lg overflow-hidden shadow-2xl">
        {/* Physical Drop Shadows on Desk */}
        <div className="absolute -inset-3 bg-[#050302] rounded-2xl blur-2xl opacity-90 -z-10 pointer-events-none" />
        <div className="absolute -inset-1 bg-[#241508]/60 rounded-xl blur-lg -z-10 pointer-events-none" />

        {/* =========================================================================
            BHOJPATRA BIRCH BARK BACKGROUND (SVG DECKLE & LENTICELS)
        ========================================================================= */}
        <div className="relative w-full overflow-hidden bg-[#E8D0A7] border border-[#6E4018]/40">
          {/* Bark Edge & Lenticel SVG Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
            viewBox="0 0 1000 1000"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Bhojpatra Honey-Amber Gradient */}
              <radialGradient id="articleBarkGradient" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#F5E4C4" />
                <stop offset="35%" stopColor="#EAD0A2" />
                <stop offset="70%" stopColor="#D9B780" />
                <stop offset="90%" stopColor="#A87740" />
                <stop offset="100%" stopColor="#633C17" />
              </radialGradient>

              {/* Burnt Margins Gradients */}
              <linearGradient id="edgeLeft" x1="0" y1="0" x2="35" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#381E09" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#381E09" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="edgeRight" x1="1000" y1="0" x2="965" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#381E09" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#381E09" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="edgeTop" x1="0" y1="0" x2="0" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A290E" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#4A290E" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="edgeBottom" x1="0" y1="1000" x2="0" y2="970" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#331A06" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#331A06" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Base Fill */}
            <rect width="1000" height="1000" fill="url(#articleBarkGradient)" />

            {/* Perimeter Peeling Edges */}
            <rect x="0" y="0" width="35" height="1000" fill="url(#edgeLeft)" />
            <rect x="965" y="0" width="35" height="1000" fill="url(#edgeRight)" />
            <rect x="0" y="0" width="1000" height="30" fill="url(#edgeTop)" />
            <rect x="0" y="970" width="1000" height="30" fill="url(#edgeBottom)" />

            {/* Characteristic Horizontal Birch Bark Lenticels */}
            <g stroke="#5E3816" strokeOpacity="0.16" strokeLinecap="round">
              <line x1="60" y1="90" x2="160" y2="90" strokeWidth="2.5" />
              <line x1="320" y1="120" x2="440" y2="120" strokeWidth="2" />
              <line x1="720" y1="95" x2="840" y2="95" strokeWidth="2.2" />

              <line x1="140" y1="240" x2="260" y2="240" strokeWidth="2" />
              <line x1="580" y1="260" x2="700" y2="260" strokeWidth="3" />
              <line x1="820" y1="230" x2="910" y2="230" strokeWidth="1.8" />

              <line x1="80" y1="420" x2="180" y2="420" strokeWidth="2.2" />
              <line x1="360" y1="450" x2="490" y2="450" strokeWidth="2.8" />
              <line x1="750" y1="410" x2="860" y2="410" strokeWidth="2" />

              <line x1="120" y1="620" x2="240" y2="620" strokeWidth="2" />
              <line x1="480" y1="640" x2="610" y2="640" strokeWidth="2.6" />
              <line x1="790" y1="630" x2="920" y2="630" strokeWidth="2.2" />

              <line x1="90" y1="810" x2="210" y2="810" strokeWidth="2.4" />
              <line x1="410" y1="830" x2="540" y2="830" strokeWidth="2.8" />
              <line x1="690" y1="800" x2="800" y2="800" strokeWidth="1.8" />

              <line x1="180" y1="940" x2="310" y2="940" strokeWidth="2.2" />
              <line x1="620" y1="950" x2="740" y2="950" strokeWidth="2.5" />
            </g>

            {/* Subtle Drypoint Ruling Guidelines */}
            <g stroke="#7A5230" strokeOpacity="0.08" strokeDasharray="4 4" strokeWidth="0.8">
              <line x1="50" y1="180" x2="950" y2="180" />
              <line x1="50" y1="360" x2="950" y2="360" />
              <line x1="50" y1="540" x2="950" y2="540" />
              <line x1="50" y1="720" x2="950" y2="720" />
              <line x1="50" y1="900" x2="950" y2="900" />
            </g>
          </svg>

          {/* Natural Wood Pulp Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-1"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, rgba(74,41,14,0.2) 100%)`,
            }}
          />

          {/* Manuscript Content Layer */}
          <div className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 text-[#1A1209]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

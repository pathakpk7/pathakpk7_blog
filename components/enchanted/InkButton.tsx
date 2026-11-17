"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { journalAudio } from "@/lib/audio/journalAudio";

interface InkButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export function InkButton({
  children,
  variant = "primary",
  className = "",
  loading = false,
  onClick,
  disabled,
  ...props
}: InkButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    journalAudio.playPaperTurn();
    if (onClick) onClick(e);
  };

  if (variant === "secondary") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        className={`px-4 py-2 font-serif text-xs sm:text-sm tracking-wider text-[#49321F] hover:text-[#24190F] underline decoration-[#8C6745]/40 hover:decoration-[#24190F] transition-all cursor-pointer disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      disabled={loading || disabled}
      className={`relative group inline-flex items-center justify-center px-6 sm:px-8 py-3 rounded-xs font-serif text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer overflow-hidden select-none disabled:opacity-50 shadow-md ${
        isHovered
          ? "bg-[#17110D] text-[#E8D5AD] border border-[#B99A63]"
          : "bg-[#24190F] text-[#E8D5AD] border border-[#8C6745]/60"
      } ${className}`}
      style={{
        boxShadow: isHovered
          ? "0 4px 18px rgba(36, 25, 15, 0.45), 0 0 12px rgba(185, 154, 99, 0.25)"
          : "0 2px 8px rgba(36, 25, 15, 0.3)",
      }}
      {...props}
    >
      {/* Subtle Living Ink Spread Aura on hover */}
      {isHovered && (
        <span className="absolute inset-0 bg-radial from-[#B99A63]/15 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Button Text */}
      <span className="relative z-10 font-medium">
        {loading ? "Inscribing..." : children}
      </span>
    </motion.button>
  );
}

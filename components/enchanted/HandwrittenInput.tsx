"use client";

import { useState, InputHTMLAttributes, forwardRef } from "react";
import { journalAudio } from "@/lib/audio/journalAudio";

interface HandwrittenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "handwritten" | "editorial";
  hint?: string;
  error?: string;
}

export const HandwrittenInput = forwardRef<HTMLInputElement, HandwrittenInputProps>(
  (
    {
      label,
      variant = "editorial",
      hint,
      error,
      className = "",
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Gentle scratch sound on typing
      if (Math.random() > 0.4) {
        journalAudio.playQuillScratch();
      }
      if (onChange) onChange(e);
    };

    return (
      <div className="relative w-full space-y-1.5 my-3">
        {label && (
          <label className="block text-xs font-serif tracking-wide text-[#49321F]/80 uppercase">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              journalAudio.playQuillLift();
              if (onFocus) onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (onBlur) onBlur(e);
            }}
            className={`w-full bg-transparent border-0 border-b border-[#8C6745]/30 focus:border-transparent py-2 px-1 text-lg sm:text-xl text-[#24190F] placeholder:text-[#8C6745]/50 focus:outline-none transition-all ${
              variant === "handwritten"
                ? "font-handwritten text-2xl sm:text-3xl text-ink"
                : "font-cormorant text-xl tracking-normal text-ink"
            } ${className}`}
            style={{
              textShadow: "0 0 0.6px rgba(36, 25, 15, 0.4)",
            }}
            {...props}
          />

          {/* Living Ink Underline (Blooms on focus) */}
          <div
            className={`absolute bottom-0 left-0 h-[1.5px] bg-[#24190F] transition-all duration-300 pointer-events-none ${
              isFocused ? "w-full opacity-90 shadow-xs" : "w-0 opacity-0"
            }`}
            style={{
              boxShadow: isFocused ? "0 0 4px rgba(36, 25, 15, 0.3)" : "none",
            }}
          />
        </div>

        {/* Handwritten Error or Hint Annotation */}
        {error ? (
          <p className="font-handwritten text-sm sm:text-base text-[#8a1c14] tracking-wide pt-0.5 animate-fadeIn">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[11px] font-serif text-[#8C6745]/70 italic pt-0.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);

HandwrittenInput.displayName = "HandwrittenInput";

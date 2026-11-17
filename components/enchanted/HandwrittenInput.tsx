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
      <div className="relative w-full space-y-1 my-4">
        {label && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-serif tracking-widest text-[#6E4522] uppercase font-medium">
              {label}
            </span>
            <div className="h-[1px] flex-1 bg-[#8C6745]/20" />
          </div>
        )}

        <div className="relative flex items-center">
          {/* Authentic Calligraphic Nib Prompt Icon */}
          <span className="text-[#8C6745]/50 text-sm mr-2 select-none">✒</span>

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
            className={`w-full bg-transparent border-0 py-1.5 px-0 text-[#1A1209] placeholder:text-[#8C6745]/45 placeholder:italic focus:outline-none transition-all ${
              variant === "handwritten"
                ? "font-handwritten text-2xl sm:text-3xl tracking-wide"
                : "font-cormorant text-xl tracking-normal"
            } ${className}`}
            style={{
              textShadow: "0 0 0.6px rgba(26, 18, 9, 0.45)",
            }}
            {...props}
          />

          {/* Scribe Guideline (Darkens to rich wet ink on focus) */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[1.5px] transition-all duration-300 pointer-events-none ${
              isFocused
                ? "bg-[#1A1209] opacity-90 shadow-xs"
                : "bg-[#8C6745]/35 opacity-70"
            }`}
          />
        </div>

        {/* Handwritten Error or Hint Annotation */}
        {error ? (
          <p className="font-handwritten text-sm sm:text-base text-[#8C1C14] tracking-wide pt-0.5 animate-fadeIn">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[11px] font-serif text-[#6E4522]/80 italic pt-0.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);

HandwrittenInput.displayName = "HandwrittenInput";

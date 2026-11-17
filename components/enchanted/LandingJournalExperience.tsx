"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnchantedDesk } from "./EnchantedDesk";
import { Parchment } from "./Parchment";
import { FeatherQuill } from "./FeatherQuill";
import { Inkpot } from "./Inkpot";
import { InkButton } from "./InkButton";
import { HandwrittenInput } from "./HandwrittenInput";
import { journalAudio } from "@/lib/audio/journalAudio";

interface LandingJournalExperienceProps {
  onEnterJournal: (name?: string) => void;
}

type Stage =
  | "checking" // reading localStorage
  | "returning" // welcome back, [Name]
  | "intro" // "Every story begins with a thought..."
  | "lifting" // quill lifting and moving to inkpot
  | "dipping" // nib dipping into inkpot with ripple
  | "question" // "Before we begin, tell me... who has found their way into these pages?"
  | "greeting" // "Ah, [Name]... I've been expecting a curious mind."
  | "unfolding"; // page transition unfolding to blog

export function LandingJournalExperience({ onEnterJournal }: LandingJournalExperienceProps) {
  const [stage, setStage] = useState<Stage>("intro");
  const [visitorName, setVisitorName] = useState("");
  const [inputName, setInputName] = useState("");
  const [isRippling, setIsRippling] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check visitor recognition on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("thepathak_journal_name");
      if (savedName && savedName.trim()) {
        setVisitorName(savedName.trim());
        setStage("returning");
      }
    } catch {}
  }, []);
      setStage("intro");
    }
  }, []);

  // Track cursor position when writing on desktop
  useEffect(() => {
    if (stage !== "question") {
      setCursorPos(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [stage]);

  // Handle picking up the quill
  const handlePickUpQuill = () => {
    if (stage !== "intro") return;

    journalAudio.playQuillLift();
    setStage("lifting");

    // Sequence: Lift -> Dip into inkpot -> Reveal Question
    setTimeout(() => {
      setStage("dipping");
      setIsRippling(true);
      journalAudio.playInkDip();

      setTimeout(() => {
        setIsRippling(false);
        setStage("question");
        journalAudio.playPaperTurn();

        // Focus input automatically after transition
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }, 700);
    }, 600);
  };

  // Submit name
  const handleSubmitName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = inputName.trim();
    if (!cleanName) return;

    try {
      localStorage.setItem("thepathak_journal_name", cleanName);
    } catch {}

    setVisitorName(cleanName);
    journalAudio.playPaperTurn();
    setStage("greeting");
  };

  // Final Enter the Journal
  const handleFinalEnter = () => {
    journalAudio.playMagicalUnseal();
    setStage("unfolding");

    setTimeout(() => {
      onEnterJournal(visitorName);
    }, 800);
  };

  // Re-introduce yourself
  const handleIntroduceAgain = () => {
    try {
      localStorage.removeItem("thepathak_journal_name");
    } catch {}
    setVisitorName("");
    setInputName("");
    journalAudio.playPaperTurn();
    setStage("intro");
  };

  // Quick Skip Introduction
  const handleSkip = () => {
    journalAudio.playPaperTurn();
    onEnterJournal(visitorName);
  };

  return (
    <EnchantedDesk>
      {/* Discreet Skip Button (Top Left) */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-40">
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-serif text-[#B99A63]/70 hover:text-[#E8D5AD] tracking-wider transition-colors cursor-pointer py-1 px-2.5 rounded-sm hover:bg-[#24190F]/50"
          aria-label="Skip introduction and proceed to journal"
        >
          Skip to Journal →
        </button>
      </div>

      <div className="w-full flex flex-col items-center justify-center my-auto min-h-[80vh] px-2">
        {/* The Central Aged Parchment */}
        <Parchment isUnfolding={stage === "unfolding"} className="my-auto">
          <AnimatePresence mode="wait">
            {/* 1. Stage: RETURNING VISITOR */}
            {stage === "returning" && (
              <motion.div
                key="returning"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-8 py-4 sm:py-8"
              >
                <div className="space-y-4">
                  <span className="text-xs font-serif tracking-widest uppercase text-[#8C6745]">
                    The Enchanted Journal
                  </span>
                  <h1 className="font-manuscript text-3xl sm:text-5xl text-ink leading-tight">
                    Welcome back, <span className="font-handwritten text-4xl sm:text-6xl text-[#17110D]">{visitorName}</span>.
                  </h1>
                  <p className="font-cormorant text-xl sm:text-2xl text-[#49321F]/90 italic max-w-lg mx-auto">
                    Another page awaits your curious mind...
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <InkButton onClick={handleFinalEnter}>
                    ENTER THE JOURNAL
                  </InkButton>
                  <InkButton variant="secondary" onClick={handleIntroduceAgain}>
                    Introduce Yourself Again
                  </InkButton>
                </div>
              </motion.div>
            )}

            {/* 2. Stage: INITIAL UNTOUCHED MANUSCRIPT */}
            {stage === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-8 py-6 sm:py-10"
              >
                <div className="space-y-4">
                  <span className="text-[11px] font-serif tracking-widest uppercase text-[#8C6745]/90">
                    The Forgotten Manuscript
                  </span>
                  <h1 className="font-manuscript text-2xl sm:text-4xl text-ink leading-relaxed">
                    &ldquo;Every story begins with a thought.<br />
                    Every thought deserves a place to live.&rdquo;
                  </h1>
                </div>

                <div className="pt-6 sm:pt-10">
                  <button
                    type="button"
                    onClick={handlePickUpQuill}
                    className="group inline-flex flex-col items-center space-y-2 cursor-pointer focus:outline-none"
                  >
                    <span className="font-cormorant italic text-lg sm:text-xl text-[#49321F] group-hover:text-[#17110D] transition-colors">
                      Pick up the quill to begin
                    </span>
                    <span className="w-12 h-[1px] bg-[#8C6745]/50 group-hover:w-20 group-hover:bg-[#24190F] transition-all duration-300" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. Stage: LIFTING & DIPPING (Visual Transition) */}
            {(stage === "lifting" || stage === "dipping") && (
              <motion.div
                key="transitioning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 space-y-4"
              >
                <p className="font-handwritten text-2xl sm:text-3xl text-[#49321F]/70 italic animate-pulse">
                  The ink is awakening...
                </p>
              </motion.div>
            )}

            {/* 4. Stage: THE ENCHANTED QUESTION */}
            {stage === "question" && (
              <motion.div
                key="question"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 py-4 sm:py-8"
              >
                <div className="text-center space-y-3">
                  <span className="text-xs font-serif tracking-widest uppercase text-[#8C6745]">
                    A Query from the Pages
                  </span>
                  <h2 className="font-manuscript text-2xl sm:text-4xl text-ink leading-snug">
                    Before we begin, tell me...<br />
                    <span className="italic font-normal">who has found their way into these pages?</span>
                  </h2>
                </div>

                <form onSubmit={handleSubmitName} className="max-w-md mx-auto space-y-6">
                  <HandwrittenInput
                    ref={inputRef}
                    variant="handwritten"
                    autoFocus
                    required
                    maxLength={40}
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Write your name here..."
                    aria-label="Your name"
                  />

                  <div className="text-center pt-2">
                    <InkButton
                      onClick={() => handleSubmitName()}
                      disabled={!inputName.trim()}
                    >
                      INSCRIBE
                    </InkButton>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 5. Stage: PERSONALISED GREETING */}
            {stage === "greeting" && (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-8 py-6 sm:py-10"
              >
                <div className="space-y-4 max-w-lg mx-auto">
                  <h2 className="font-manuscript text-3xl sm:text-5xl text-ink leading-tight">
                    Ah, <span className="font-handwritten text-4xl sm:text-6xl text-[#17110D]">{visitorName}</span>...
                  </h2>
                  <p className="font-cormorant text-xl sm:text-2xl text-[#49321F] italic leading-relaxed">
                    I&apos;ve been expecting a curious mind.
                  </p>
                  <p className="font-eb-garamond text-base sm:text-lg text-[#49321F]/80">
                    A mind that wanders deserves a place to wander.
                  </p>
                </div>

                <div className="pt-4">
                  <InkButton onClick={handleFinalEnter}>
                    ENTER THE JOURNAL
                  </InkButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Parchment>

        {/* Physical Writing Objects on Desk: Feather Quill & Antique Inkpot */}
        <div className="w-full max-w-2xl flex items-end justify-between px-6 sm:px-12 mt-6 sm:mt-10 relative z-30">
          {/* Antique Inkpot */}
          <div className="relative">
            <Inkpot isRippling={isRippling} />
          </div>

          {/* Feather Quill */}
          <div className="relative">
            <FeatherQuill
              state={
                stage === "lifting"
                  ? "lifting"
                  : stage === "dipping"
                  ? "dipping"
                  : stage === "question" || stage === "greeting"
                  ? "writing"
                  : "resting"
              }
              onClick={handlePickUpQuill}
              cursorPos={cursorPos}
              interactive={stage === "intro"}
            />
          </div>
        </div>
      </div>
    </EnchantedDesk>
  );
}

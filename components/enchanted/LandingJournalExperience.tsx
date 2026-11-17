"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnchantedDesk } from "./EnchantedDesk";
import { Parchment } from "./Parchment";
import { FeatherQuill } from "./FeatherQuill";
import { Inkpot } from "./Inkpot";
import { WaxSealButton } from "./WaxSealButton";
import { HandwrittenInput } from "./HandwrittenInput";
import { journalAudio } from "@/lib/audio/journalAudio";

interface LandingJournalExperienceProps {
  onEnterJournal: (name?: string) => void;
}

type Stage =
  | "intro" // "Every story begins with a thought..."
  | "returning" // "Welcome back, [Name]..."
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
    }, 850);
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
      {/* Discreet Calligraphic Skip Link (Top Left) */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-40">
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-serif italic text-[#C9AB75]/80 hover:text-[#FAF4E6] tracking-wider transition-colors cursor-pointer py-1 px-3 rounded-sm hover:bg-[#1A1209]/60"
          aria-label="Skip introduction and proceed to journal"
        >
          ~ Skip to Journal → ~
        </button>
      </div>

      <div className="w-full flex flex-col items-center justify-center my-auto min-h-[82vh] px-2 sm:px-4">
        {/* The Authentic Deckle-Edge Manuscript Leaf */}
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
                className="text-center space-y-8 py-6 sm:py-10"
              >
                <div className="space-y-4">
                  <span className="text-[11px] font-serif tracking-[0.25em] uppercase text-[#7A5230] font-medium">
                    ❦ The Enchanted Journal ❦
                  </span>
                  <h1 className="font-manuscript text-3xl sm:text-5xl text-[#1A1209] leading-tight font-normal">
                    Welcome back, <span className="font-handwritten text-4xl sm:text-6xl text-[#3D0604]">{visitorName}</span>.
                  </h1>
                  <p className="font-cormorant text-xl sm:text-2xl text-[#4A2F17] italic max-w-lg mx-auto leading-relaxed">
                    Another page awaits your curious mind...
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <WaxSealButton onClick={handleFinalEnter}>
                    OPEN THE JOURNAL
                  </WaxSealButton>
                  <WaxSealButton variant="flourish" onClick={handleIntroduceAgain}>
                    Introduce Yourself Again
                  </WaxSealButton>
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
                className="text-center space-y-10 py-8 sm:py-14"
              >
                <div className="space-y-4">
                  <span className="text-[11px] font-serif tracking-[0.25em] uppercase text-[#7A5230] font-medium">
                    ❦ The Forgotten Manuscript ❦
                  </span>
                  <h1 className="font-manuscript text-2xl sm:text-4xl text-[#1A1209] leading-relaxed font-normal">
                    &ldquo;Every story begins with a thought.<br />
                    Every thought deserves a place to live.&rdquo;
                  </h1>
                </div>

                <div className="pt-4 sm:pt-8">
                  <button
                    type="button"
                    onClick={handlePickUpQuill}
                    className="group inline-flex flex-col items-center space-y-2.5 cursor-pointer focus:outline-none"
                  >
                    <span className="font-cormorant italic text-xl sm:text-2xl text-[#5A3A1E] group-hover:text-[#1A1209] transition-colors">
                      ~ Pick up the quill to begin ~
                    </span>
                    <span className="w-16 h-[1.5px] bg-[#7A5230]/40 group-hover:w-28 group-hover:bg-[#1A1209] transition-all duration-300" />
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
                <p className="font-handwritten text-3xl text-[#4A2F17]/80 italic animate-pulse">
                  The dark ink awakens upon the vellum...
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
                className="space-y-8 py-6 sm:py-10"
              >
                <div className="text-center space-y-3">
                  <span className="text-[11px] font-serif tracking-[0.25em] uppercase text-[#7A5230] font-medium">
                    ❦ A Query from the Pages ❦
                  </span>
                  <h2 className="font-manuscript text-2xl sm:text-4xl text-[#1A1209] leading-snug font-normal">
                    Before we begin, tell me...<br />
                    <span className="italic">who has found their way into these pages?</span>
                  </h2>
                </div>

                <form onSubmit={handleSubmitName} className="max-w-md mx-auto space-y-6 pt-2">
                  <HandwrittenInput
                    ref={inputRef}
                    variant="handwritten"
                    autoFocus
                    required
                    maxLength={40}
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Inscribe your name here..."
                    aria-label="Your name"
                  />

                  <div className="text-center pt-2">
                    <WaxSealButton
                      type="submit"
                      disabled={!inputName.trim()}
                    >
                      INSCRIBE MY NAME
                    </WaxSealButton>
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
                className="text-center space-y-8 py-8 sm:py-12"
              >
                <div className="space-y-4 max-w-lg mx-auto">
                  <h2 className="font-manuscript text-3xl sm:text-5xl text-[#1A1209] leading-tight font-normal">
                    Ah, <span className="font-handwritten text-4xl sm:text-6xl text-[#3D0604]">{visitorName}</span>...
                  </h2>
                  <p className="font-cormorant text-xl sm:text-2xl text-[#4A2F17] italic leading-relaxed">
                    I&apos;ve been expecting a curious mind.
                  </p>
                  <p className="font-eb-garamond text-base sm:text-lg text-[#5A3A1E]/90 leading-relaxed">
                    A mind that wanders deserves a place to wander.
                  </p>
                </div>

                <div className="pt-6">
                  <WaxSealButton onClick={handleFinalEnter}>
                    BREAK THE SEAL & ENTER
                  </WaxSealButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Parchment>

        {/* Physical Writing Objects on Desk: Feather Quill & Antique Inkpot */}
        <div className="w-full max-w-2xl flex items-end justify-between px-6 sm:px-12 mt-6 sm:mt-8 relative z-30">
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

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnchantedDesk } from "./EnchantedDesk";
import { HorizontalParchment } from "./HorizontalParchment";
import { LeatherBookCover } from "./LeatherBookCover";
import { SequentialAuthFolio } from "./SequentialAuthFolio";
import { FeatherQuill } from "./FeatherQuill";
import { Inkpot } from "./Inkpot";
import { WaxSealButton } from "./WaxSealButton";
import { HandwrittenInput } from "./HandwrittenInput";
import { journalAudio } from "@/lib/audio/journalAudio";

interface LandingJournalExperienceProps {
  onEnterJournal: (name?: string) => void;
}

type Stage =
  | "book" // Closed leather testimonial book with magnetic clasp
  | "intro" // "Every story begins with a thought..."
  | "returning" // "Welcome back, [Name]..."
  | "lifting" // quill lifting and moving to inkpot
  | "dipping" // nib dipping into inkpot with ripple
  | "question" // "Before we begin, tell me... who has found their way into these pages?"
  | "greeting" // "Ah, [Name]... I've been expecting a curious mind."
  | "auth" // Sequential multi-step page-turn auth
  | "unfolding"; // transition to main blog

export function LandingJournalExperience({ onEnterJournal }: LandingJournalExperienceProps) {
  const [stage, setStage] = useState<Stage>("book");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [inputName, setInputName] = useState("");
  const [isRippling, setIsRippling] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check visitor recognition from previous sessions
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("thepathak_journal_name");
      if (savedName && savedName.trim()) {
        setVisitorName(savedName.trim());
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

  // Handle opening the magnetic clasp book
  const handleOpenBook = () => {
    setIsBookOpen(true);
    if (visitorName) {
      setStage("returning");
    } else {
      setStage("intro");
    }
  };

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

  // Launch sequential auth directly inside the horizontal desk
  const handleLaunchAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setStage("auth");
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
          className="text-xs font-serif italic text-[#C9AB75]/80 hover:text-[#FAF4E6] tracking-wider transition-colors cursor-pointer py-1.5 px-3 rounded-sm hover:bg-[#1A1209]/60 border border-[#8C6745]/30"
          aria-label="Skip introduction and enter journal directly"
        >
          ~ Skip to Journal → ~
        </button>
      </div>

      <div className="w-full flex flex-col items-center justify-center my-auto min-h-[85vh] px-2 sm:px-4">
        {/* =========================================================================
            STAGE 1: CLOSED LEATHER TESTIMONIAL BOOK WITH MAGNETIC CLASP
            (Matching user reference photo 1: "Pathak.pk Blog")
        ========================================================================= */}
        {stage === "book" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <LeatherBookCover
              isOpen={isBookOpen}
              onOpen={handleOpenBook}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-cormorant italic text-sm sm:text-base text-[#D4AE77]/80 tracking-wide text-center"
            >
              ~ Click the magnetic lock to unseal Pathak.pk Blog ~
            </motion.p>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: SEQUENTIAL MULTI-STEP AUTH FOLIO (If user chose Login/Signup)
            Fits completely in ONE single horizontal frame without vertical scroll
        ========================================================================= */}
        {stage === "auth" && (
          <div className="w-full">
            <SequentialAuthFolio
              initialMode={authMode}
              onSuccess={() => handleFinalEnter()}
              onCancel={() => setStage(visitorName ? "returning" : "intro")}
            />
          </div>
        )}

        {/* =========================================================================
            STAGE 3: THE HORIZONTAL BHOJPATRA FOLIO (Landing Manuscript Interaction)
            Single frame, no scroll down, authentic birch bark texture
        ========================================================================= */}
        {stage !== "book" && stage !== "auth" && (
          <HorizontalParchment className="my-auto">
            <AnimatePresence mode="wait">
              {/* 1. Stage: RETURNING VISITOR */}
              {stage === "returning" && (
                <motion.div
                  key="returning"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col justify-between text-center py-2"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-serif tracking-[0.28em] uppercase text-[#7A5230] font-semibold">
                      ❦ Pathak.pk Blog • The Enchanted Folio ❦
                    </span>
                    <h1 className="font-manuscript text-3xl sm:text-4xl text-[#1A1209] leading-tight font-normal">
                      Welcome back, <span className="font-handwritten text-4xl sm:text-5xl text-[#3D0604]">{visitorName}</span>.
                    </h1>
                    <p className="font-cormorant text-lg sm:text-xl text-[#4A2F17] italic">
                      Another page awaits your curious mind...
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
                    <WaxSealButton onClick={handleFinalEnter}>
                      OPEN THE JOURNAL
                    </WaxSealButton>
                    <WaxSealButton variant="flourish" onClick={handleIntroduceAgain}>
                      Introduce Yourself Again
                    </WaxSealButton>
                  </div>

                  {/* Auth shortcuts at folio footer */}
                  <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#8C6745]/20 text-xs font-serif text-[#7A5230]">
                    <button
                      type="button"
                      onClick={() => handleLaunchAuth("login")}
                      className="italic hover:text-[#1A1209] transition-colors cursor-pointer"
                    >
                      ~ Unseal Scribe Account (Sign In) ~
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleLaunchAuth("signup")}
                      className="italic hover:text-[#1A1209] transition-colors cursor-pointer"
                    >
                      ~ Write First Page (Sign Up) ~
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 2. Stage: INITIAL UNTOUCHED MANUSCRIPT */}
              {stage === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col justify-between text-center py-2"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-serif tracking-[0.28em] uppercase text-[#7A5230] font-semibold">
                      ❦ Pathak.pk Blog • The Forgotten Manuscript ❦
                    </span>
                    <h1 className="font-manuscript text-2xl sm:text-4xl text-[#1A1209] leading-relaxed font-normal max-w-2xl mx-auto">
                      &ldquo;Every story begins with a thought.<br />
                      Every thought deserves a place to live.&rdquo;
                    </h1>
                  </div>

                  <div className="py-2">
                    <button
                      type="button"
                      onClick={handlePickUpQuill}
                      className="group inline-flex flex-col items-center space-y-2 cursor-pointer focus:outline-none"
                    >
                      <span className="font-cormorant italic text-xl sm:text-2xl text-[#5A3A1E] group-hover:text-[#1A1209] transition-colors">
                        ~ Pick up the quill to begin ~
                      </span>
                      <span className="w-16 h-[1.5px] bg-[#7A5230]/40 group-hover:w-32 group-hover:bg-[#1A1209] transition-all duration-300" />
                    </button>
                  </div>

                  {/* Auth shortcuts at folio footer */}
                  <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#8C6745]/20 text-xs font-serif text-[#7A5230]">
                    <button
                      type="button"
                      onClick={() => handleLaunchAuth("login")}
                      className="italic hover:text-[#1A1209] transition-colors cursor-pointer"
                    >
                      ~ Unseal Scribe Account (Sign In) ~
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleLaunchAuth("signup")}
                      className="italic hover:text-[#1A1209] transition-colors cursor-pointer"
                    >
                      ~ Write First Page (Sign Up) ~
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 3. Stage: LIFTING & DIPPING */}
              {(stage === "lifting" || stage === "dipping") && (
                <motion.div
                  key="transitioning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-10"
                >
                  <p className="font-handwritten text-3xl sm:text-4xl text-[#3D0604] italic animate-pulse">
                    The dark iron-gall ink awakens upon the vellum...
                  </p>
                </motion.div>
              )}

              {/* 4. Stage: THE ENCHANTED QUESTION */}
              {stage === "question" && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col justify-between py-2 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-serif tracking-[0.28em] uppercase text-[#7A5230] font-semibold">
                      ❦ A Query from the Pages ❦
                    </span>
                    <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                      Before we begin, tell me...<br />
                      <span className="italic font-cormorant text-xl sm:text-2xl text-[#4A2F17]">
                        who has found their way into these pages?
                      </span>
                    </h2>
                  </div>

                  <form onSubmit={handleSubmitName} className="max-w-md mx-auto w-full space-y-4">
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

                    <div className="pt-2">
                      <WaxSealButton
                        type="submit"
                        disabled={!inputName.trim()}
                      >
                        INSCRIBE MY NAME
                      </WaxSealButton>
                    </div>
                  </form>

                  <div className="pt-2 text-[11px] font-serif italic text-[#7A5230]/80">
                    Press Enter to inscribe and proceed
                  </div>
                </motion.div>
              )}

              {/* 5. Stage: PERSONALISED GREETING */}
              {stage === "greeting" && (
                <motion.div
                  key="greeting"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col justify-between text-center py-2"
                >
                  <div className="space-y-2 max-w-lg mx-auto">
                    <h2 className="font-manuscript text-3xl sm:text-4xl text-[#1A1209] font-normal">
                      Ah, <span className="font-handwritten text-4xl sm:text-5xl text-[#3D0604]">{visitorName}</span>...
                    </h2>
                    <p className="font-cormorant text-xl sm:text-2xl text-[#4A2F17] italic">
                      I&apos;ve been expecting a curious mind.
                    </p>
                    <p className="font-eb-garamond text-base sm:text-lg text-[#5A3A1E]/90">
                      A mind that wanders deserves a place to wander.
                    </p>
                  </div>

                  <div className="py-3">
                    <WaxSealButton onClick={handleFinalEnter}>
                      BREAK THE SEAL & ENTER
                    </WaxSealButton>
                  </div>

                  <div className="pt-2 text-[11px] font-serif italic text-[#7A5230]">
                    ❦ Pathak.pk Blog • Vol. IV ❦
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </HorizontalParchment>
        )}

        {/* Physical Writing Objects on Desk: Feather Quill & Antique Inkpot */}
        {stage !== "book" && stage !== "auth" && (
          <div className="w-full max-w-3xl flex items-end justify-between px-6 sm:px-12 mt-4 sm:mt-6 relative z-30">
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
        )}
      </div>
    </EnchantedDesk>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HorizontalParchment } from "./HorizontalParchment";
import { HandwrittenInput } from "./HandwrittenInput";
import { WaxSealButton } from "./WaxSealButton";
import { FeatherQuill } from "./FeatherQuill";
import { Inkpot } from "./Inkpot";
import { journalAudio } from "@/lib/audio/journalAudio";
import { validateUsername } from "@/lib/validation/username";
import { signIn } from "next-auth/react";

interface SequentialAuthFolioProps {
  initialMode?: "signup" | "login";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SequentialAuthFolio({
  initialMode = "signup",
  onSuccess,
  onCancel,
}: SequentialAuthFolioProps) {
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [step, setStep] = useState<number>(1);
  const [isPageTurning, setIsPageTurning] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    error?: string;
  }>({ checking: false });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on step change
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  }, [step, mode]);

  // Live handle availability check
  useEffect(() => {
    if (mode !== "signup" || step !== 2 || !username.trim()) {
      setUsernameStatus({ checking: false });
      return;
    }

    const val = validateUsername(username);
    if (!val.valid) {
      setUsernameStatus({ checking: false, available: false, error: val.error });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(val.cleanUsername || "")}`
        );
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ checking: false, available: true });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            error: data.error || "This pseudonym is already claimed.",
          });
        }
      } catch {
        setUsernameStatus({ checking: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, mode, step]);

  // Turn to Next Page with realistic 3D paper curl
  const turnToPage = (nextStep: number) => {
    setError("");
    setIsPageTurning(true);
    journalAudio.playPaperTurn();

    setTimeout(() => {
      setStep(nextStep);
      setIsPageTurning(false);
    }, 450);
  };

  // Turn to Previous Page
  const turnBack = () => {
    if (step > 1) {
      turnToPage(step - 1);
    }
  };

  // Handle Signup Submission
  const handleFinalSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password !== confirmPassword) {
      setError("The ciphers do not match. Re-inscribe your password.");
      journalAudio.playQuillScratch();
      return;
    }

    setLoading(true);
    setError("");

    try {
      journalAudio.playPaperTurn();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.toLowerCase().trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "The ink failed to bind. Please check your details.");
        setLoading(false);
        return;
      }

      setRegisteredSuccess(true);
      journalAudio.playMagicalUnseal();

      // Sign in automatically
      await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1600);
    } catch {
      setError("An unexpected enchantment failed. Please try again.");
      setLoading(false);
    }
  };

  // Handle Login Submission
  const handleFinalLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      journalAudio.playPaperTurn();
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("The ink doesn't recognize these credentials. Try again.");
        journalAudio.playQuillScratch();
        setLoading(false);
      } else {
        journalAudio.playMagicalUnseal();
        setRegisteredSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1200);
      }
    } catch {
      setError("The quill faltered in transmission. Please try once more.");
      setLoading(false);
    }
  };

  return (
    <HorizontalParchment isPageTurning={isPageTurning}>
      {/* Top Header Row of the Horizontal Parchment */}
      <div className="flex items-center justify-between border-b border-[#7A5230]/25 pb-3 px-2 sm:px-4">
        <div className="flex items-center space-x-2 text-xs font-serif text-[#6E4018]">
          <span className="font-semibold tracking-[0.2em] uppercase">
            {mode === "signup" ? "❦ Book of New Authors ❦" : "❦ The Returning Scribe ❦"}
          </span>
          <span className="text-[#8C6745]/60">•</span>
          <span className="italic text-[11px] text-[#7A5230]/90">
            {mode === "signup" ? `Leaf ${step} of 5` : `Leaf ${step} of 2`}
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center space-x-3 text-xs font-serif">
          {mode === "signup" ? (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setStep(1);
                setError("");
                journalAudio.playPaperTurn();
              }}
              className="text-[#6E4018] hover:text-[#1A1209] italic underline decoration-[#8C6745]/40 hover:decoration-[#1A1209] cursor-pointer"
            >
              Already inscribe here? Turn to Login →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setStep(1);
                setError("");
                journalAudio.playPaperTurn();
              }}
              className="text-[#6E4018] hover:text-[#1A1209] italic underline decoration-[#8C6745]/40 hover:decoration-[#1A1209] cursor-pointer"
            >
              New author? Inscribe a fresh page →
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-[#8C6745] hover:text-[#1A1209] text-xs cursor-pointer ml-2"
              title="Close Folio"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Middle Interactive Scribe Stage */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 sm:px-6 my-auto">
        <AnimatePresence mode="wait">
          {/* =========================================================================
              SUCCESS STATE
          ========================================================================= */}
          {registeredSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-8 animate-fadeIn"
            >
              <span className="text-xs font-serif tracking-[0.25em] uppercase text-[#7A5230]">
                Binding Complete
              </span>
              <h2 className="font-manuscript text-3xl sm:text-5xl text-[#1A1209] leading-tight font-normal">
                {mode === "signup" ? (
                  <>
                    Your first page awaits,{" "}
                    <span className="font-handwritten text-4xl sm:text-6xl text-[#3D0604]">{name}</span>.
                  </>
                ) : (
                  <>
                    Welcome back,{" "}
                    <span className="font-handwritten text-4xl sm:text-6xl text-[#3D0604]">Scribe</span>.
                  </>
                )}
              </h2>
              <p className="font-cormorant text-xl text-[#5A3A1E] italic">
                Opening the pages of the living journal...
              </p>
            </motion.div>
          ) : mode === "signup" ? (
            /* =========================================================================
                SIGNUP STEPS (5 Horizontal Pages with Automatic Page Turn)
            ========================================================================= */
            step === 1 ? (
              /* Step 1: Full Name */
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Before we begin, tell me...<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      what name was bestowed upon you in the world?
                    </span>
                  </h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim()) turnToPage(2);
                  }}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Full Name"
                    variant="handwritten"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Leonardo da Vinci"
                  />

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      disabled={!name.trim()}
                    >
                      TURN LEAF →
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            ) : step === 2 ? (
              /* Step 2: Unique Pseudonym (Username) */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Choose a name I shall call you...<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      your unique pseudonym within these sacred pages.
                    </span>
                  </h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (username.trim() && usernameStatus.available) turnToPage(3);
                  }}
                  className="space-y-4 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Author Handle"
                    required
                    maxLength={30}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="your_handle"
                    error={usernameStatus.error}
                    hint="thepathak.tech/@handle"
                  />
                  {usernameStatus.available && (
                    <p className="font-handwritten text-base text-[#1E5C38] text-center italic">
                      This pseudonym is free to claim.
                    </p>
                  )}

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      disabled={!username.trim() || !usernameStatus.available}
                    >
                      TURN LEAF →
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            ) : step === 3 ? (
              /* Step 3: Proof (Email) */
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Provide proof of your identity...<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      an address to receive letters from the archive.
                    </span>
                  </h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim().includes("@")) turnToPage(4);
                  }}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Proof (Email Address)"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scribe@domain.com"
                  />

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      disabled={!email.trim() || !email.includes("@")}
                    >
                      TURN LEAF →
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            ) : step === 4 ? (
              /* Step 4: Secrets (Password) */
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Inscribe your secret cipher...<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      that only you and this journal shall know.
                    </span>
                  </h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (password.length >= 6) turnToPage(5);
                  }}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Secret Cipher (Password)"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    hint="Minimum 6 characters"
                  />

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      disabled={password.length < 6}
                    >
                      TURN LEAF →
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Step 5: Confirmation (Confirm Password) */
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Re-inscribe your cipher to seal the binding...<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      confirming your secret with the manuscript.
                    </span>
                  </h2>
                </div>

                {error && (
                  <p className="font-handwritten text-base text-[#8C1C14] text-center italic">
                    {error}
                  </p>
                )}

                <form
                  onSubmit={handleFinalSignup}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Confirm Cipher"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      loading={loading}
                      disabled={loading || !confirmPassword || password !== confirmPassword}
                    >
                      SEAL & BIND MY JOURNAL
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            )
          ) : (
            /* =========================================================================
                LOGIN STEPS (2 Horizontal Pages with Automatic Page Turn)
            ========================================================================= */
            step === 1 ? (
              /* Login Step 1: Email */
              <motion.div
                key="login1"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Whose story continues today?<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      Inscribe your email to locate your folio.
                    </span>
                  </h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim().includes("@")) turnToPage(2);
                  }}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scribe@domain.com"
                  />

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      disabled={!email.trim() || !email.includes("@")}
                    >
                      PROCEED TO CIPHER →
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Login Step 2: Password */
              <motion.div
                key="login2"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-manuscript text-2xl sm:text-3xl text-[#1A1209] font-normal">
                    Inscribe your secret cipher...<br />
                    <span className="italic font-cormorant text-xl sm:text-2xl text-[#5A3A1E]">
                      to unseal your enchanted journal.
                    </span>
                  </h2>
                </div>

                {error && (
                  <p className="font-handwritten text-base text-[#8C1C14] text-center italic">
                    {error}
                  </p>
                )}

                <form
                  onSubmit={handleFinalLogin}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <HandwrittenInput
                    ref={inputRef}
                    label="Secret Cipher (Password)"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />

                  <div className="flex justify-center pt-2">
                    <WaxSealButton
                      type="submit"
                      loading={loading}
                      disabled={loading || !password}
                    >
                      UNSEAL MY JOURNAL
                    </WaxSealButton>
                  </div>
                </form>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls Row: Previous Leaf Link + Physical Quill/Inkpot Accents */}
      <div className="flex items-center justify-between border-t border-[#7A5230]/20 pt-3 px-2 sm:px-4 text-xs font-serif text-[#6E4018]">
        {step > 1 && !registeredSuccess ? (
          <button
            type="button"
            onClick={turnBack}
            className="hover:text-[#1A1209] italic cursor-pointer flex items-center space-x-1 transition-colors"
          >
            <span>← Turn back to previous leaf</span>
          </button>
        ) : (
          <span className="italic text-[11px] text-[#7A5230]/60">~ Inscribe with care ~</span>
        )}

        <div className="flex items-center space-x-4 opacity-75 scale-75 origin-bottom-right">
          <Inkpot />
          <FeatherQuill state="resting" interactive={false} />
        </div>
      </div>
    </HorizontalParchment>
  );
}

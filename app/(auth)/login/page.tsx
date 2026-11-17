"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EnchantedDesk } from "@/components/enchanted/EnchantedDesk";
import { Parchment } from "@/components/enchanted/Parchment";
import { FeatherQuill } from "@/components/enchanted/FeatherQuill";
import { Inkpot } from "@/components/enchanted/Inkpot";
import { WaxSealButton } from "@/components/enchanted/WaxSealButton";
import { HandwrittenInput } from "@/components/enchanted/HandwrittenInput";
import { journalAudio } from "@/lib/audio/journalAudio";

function LoginForm() {
  const searchParams = useSearchParams();
  const explicitCallback = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMessage(false);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const targetUrl = explicitCallback || "/";

    try {
      journalAudio.playPaperTurn();
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
        callbackUrl: targetUrl,
      });

      if (res?.error) {
        setError("The ink doesn't recognize these credentials. Try again.");
        journalAudio.playQuillScratch();
      } else {
        journalAudio.playMagicalUnseal();
        window.location.href = targetUrl;
        return;
      }
    } catch {
      setError("The quill faltered in transmission. Please try once more.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Manuscript Masthead */}
      <div className="text-center space-y-3 pb-2 border-b border-[#8C6745]/25">
        <Link
          href="/"
          className="inline-block font-serif text-xs tracking-widest uppercase text-[#8C6745] hover:text-[#49321F] transition-colors"
        >
          ThePathak.tech • The Returning Scribe
        </Link>
        <h1 className="font-manuscript text-3xl sm:text-4xl text-ink leading-tight">
          Your story continues...
        </h1>
        <p className="font-cormorant text-lg sm:text-xl text-[#49321F]/90 italic">
          Some pages are meant to be revisited.
        </p>
      </div>

      {/* Handwritten Error Annotation */}
      {error && (
        <div className="p-3 text-center rounded-xs bg-[#8a1c14]/10 border border-[#8a1c14]/30 animate-fadeIn">
          <p className="font-handwritten text-lg sm:text-xl text-[#8a1c14] tracking-wide">
            {error}
          </p>
        </div>
      )}

      {/* Form Fields as Manuscript Lines */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <HandwrittenInput
          label="Email Address"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="scribe@domain.com"
          autoComplete="email"
        />

        <div className="space-y-1">
          <HandwrittenInput
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="current-password"
          />
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setForgotMessage(!forgotMessage)}
              className="text-xs font-serif text-[#8C6745] hover:text-[#24190F] italic transition-colors cursor-pointer"
            >
              Forgotten your cipher?
            </button>
          </div>
          {forgotMessage && (
            <p className="font-handwritten text-sm text-[#49321F] italic text-right pt-1">
              Contact the archivist at editorial@thepathak.tech to reset your key.
            </p>
          )}
        </div>

        {/* Unseal Journal Action (Wax Seal) */}
        <div className="text-center pt-6 flex justify-center">
          <WaxSealButton
            type="submit"
            loading={loading}
            disabled={loading || !email.trim() || !password}
          >
            UNSEAL MY JOURNAL
          </WaxSealButton>
        </div>
      </form>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-[#8C6745]/20 flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-[#5A3A1E] gap-4">
        <Link
          href="/signup"
          className="hover:text-[#1A1209] italic transition-all"
        >
          ~ Don&apos;t have an account? Create one. ~
        </Link>
        <Link
          href="/"
          className="text-[#7A5230] hover:text-[#1A1209] italic transition-colors"
        >
          ← Return to the Desk
        </Link>
      </div>

      {/* Physical Writing Elements at Bottom of Parchment */}
      <div className="flex items-center justify-between pt-4 px-2 opacity-80">
        <Inkpot className="scale-75 origin-bottom-left" />
        <div className="rotate-45 scale-75 origin-bottom-right">
          <FeatherQuill state="resting" interactive={false} />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <EnchantedDesk>
      <div className="w-full py-6 sm:py-10">
        <Parchment variant="aged">
          <Suspense
            fallback={
              <div className="py-20 text-center font-handwritten text-2xl text-[#49321F] animate-pulse">
                Preparing the parchment...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </Parchment>
      </div>
    </EnchantedDesk>
  );
}

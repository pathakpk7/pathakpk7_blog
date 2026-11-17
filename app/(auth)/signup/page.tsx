"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { EnchantedDesk } from "@/components/enchanted/EnchantedDesk";
import { Parchment } from "@/components/enchanted/Parchment";
import { FeatherQuill } from "@/components/enchanted/FeatherQuill";
import { Inkpot } from "@/components/enchanted/Inkpot";
import { WaxSealButton } from "@/components/enchanted/WaxSealButton";
import { HandwrittenInput } from "@/components/enchanted/HandwrittenInput";
import { validateUsername } from "@/lib/validation/username";
import { journalAudio } from "@/lib/audio/journalAudio";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    error?: string;
  }>({ checking: false });

  // Debounced live handle check
  useEffect(() => {
    if (!username.trim()) {
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
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("The ciphers do not match. Please verify both passwords.");
      journalAudio.playQuillScratch();
      return;
    }

    const val = validateUsername(username);
    if (!val.valid) {
      setError(val.error || "Please choose a valid author handle.");
      return;
    }

    setLoading(true);

    try {
      journalAudio.playPaperTurn();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: val.cleanUsername || username,
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

      // Success animation state
      setRegisteredName(name.trim());
      journalAudio.playMagicalUnseal();

      // Sign in automatically
      const authRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/",
      });

      setTimeout(() => {
        if (authRes?.error) {
          router.push("/login");
        } else {
          router.push("/");
          router.refresh();
        }
      }, 1500);
    } catch {
      setError("An unexpected enchantment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <EnchantedDesk>
      <div className="w-full py-6 sm:py-10">
        <Parchment variant="fresh">
          {registeredName ? (
            /* Registration Success Reveal */
            <div className="text-center space-y-6 py-12 sm:py-16 animate-fadeIn">
              <span className="text-xs font-serif tracking-widest uppercase text-[#8C6745]">
                A New Story Begins
              </span>
              <h2 className="font-manuscript text-3xl sm:text-5xl text-ink leading-tight">
                Your first page awaits,{" "}
                <span className="font-handwritten text-4xl sm:text-6xl text-[#17110D]">
                  {registeredName}
                </span>
                .
              </h2>
              <p className="font-cormorant text-xl text-[#49321F]/90 italic">
                Binding your name into the enchanted archive...
              </p>
            </div>
          ) : (
            <div className="w-full max-w-lg mx-auto space-y-6">
              {/* Fresh Page Masthead */}
              <div className="text-center space-y-3 pb-2 border-b border-[#8C6745]/25">
                <Link
                  href="/"
                  className="inline-block font-serif text-xs tracking-widest uppercase text-[#8C6745] hover:text-[#49321F] transition-colors"
                >
                  ThePathak.tech • Write Your First Page
                </Link>
                <h1 className="font-manuscript text-3xl sm:text-4xl text-ink leading-tight">
                  Every journal needs an author.
                </h1>
                <p className="font-cormorant text-lg sm:text-xl text-[#49321F]/90 italic">
                  Let&apos;s put a name to the thoughts waiting to be written.
                </p>
              </div>

              {/* Error Annotation */}
              {error && (
                <div className="p-3 text-center rounded-xs bg-[#8a1c14]/10 border border-[#8a1c14]/30 animate-fadeIn">
                  <p className="font-handwritten text-lg sm:text-xl text-[#8a1c14] tracking-wide">
                    {error}
                  </p>
                </div>
              )}

              {/* Manuscript Signup Fields */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <HandwrittenInput
                  label="Full Name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leonardo da Vinci"
                  autoComplete="name"
                />

                <div className="space-y-1">
                  <HandwrittenInput
                    label="Author Handle / Pseudonym"
                    type="text"
                    required
                    maxLength={30}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="handle"
                    autoComplete="username"
                    error={usernameStatus.error}
                    hint="thepathak.tech/@yourhandle"
                  />
                  {usernameStatus.available && (
                    <p className="font-handwritten text-sm text-[#2d6a4f] italic">
                      This name is free to claim.
                    </p>
                  )}
                </div>

                <HandwrittenInput
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@domain.com"
                  autoComplete="email"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HandwrittenInput
                    label="Password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <HandwrittenInput
                    label="Confirm Password"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                {/* Create Journal Action Button (Wax Seal) */}
                <div className="text-center pt-6 flex justify-center">
                  <WaxSealButton
                    type="submit"
                    loading={loading}
                    disabled={loading || Boolean(usernameStatus.error)}
                  >
                    CREATE MY JOURNAL
                  </WaxSealButton>
                </div>
              </form>

              {/* Navigation Footer */}
              <div className="pt-6 border-t border-[#8C6745]/20 flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-[#5A3A1E] gap-4">
                <Link
                  href="/login"
                  className="hover:text-[#1A1209] italic transition-all"
                >
                  ~ Already have an account? Sign In. ~
                </Link>
                <Link
                  href="/"
                  className="text-[#7A5230] hover:text-[#1A1209] italic transition-colors"
                >
                  ← Return to the Desk
                </Link>
              </div>

              {/* Bottom Decorative Physical Objects */}
              <div className="flex items-center justify-between pt-4 px-2 opacity-80">
                <Inkpot className="scale-75 origin-bottom-left" />
                <div className="rotate-45 scale-75 origin-bottom-right">
                  <FeatherQuill state="resting" interactive={false} />
                </div>
              </div>
            </div>
          )}
        </Parchment>
      </div>
    </EnchantedDesk>
  );
}

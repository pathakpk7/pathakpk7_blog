"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, AtSign, ArrowRight, AlertCircle, Check, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { validateUsername } from "@/lib/validation/username";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(val.cleanUsername || "")}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ checking: false, available: true });
        } else {
          setUsernameStatus({ checking: false, available: false, error: data.error || "Username is unavailable." });
        }
      } catch (err) {
        setUsernameStatus({ checking: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const val = validateUsername(username);
    if (!val.valid) {
      setError(val.error || "Please choose a valid username.");
      return;
    }

    setLoading(true);

    try {
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
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const authRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (authRes?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-2xl border border-border shadow-xl">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-border mb-2 group-hover:scale-105 transition-transform bg-zinc-950">
              <Image
                src="/emblem.png"
                alt="ThePathak.tech Logo"
                fill
                sizes="112px"
                className="object-contain p-1"
                priority
                unoptimized
              />
            </div>
            <span className="font-serif-editorial text-2xl font-bold tracking-tight text-foreground">
              ThePathak<span className="text-blue-600 dark:text-blue-500">.tech</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-foreground">Create a Reader Account</h2>
          <p className="text-xs text-muted-foreground">
            Choose your permanent unique handle to join discussions and track your reading.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Username Handle</label>
              <span className="text-[10px] font-mono text-muted-foreground">{username.length}/30</span>
            </div>
            <div className="relative">
              <AtSign className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="text"
                required
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="janedoe"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="absolute right-3 top-3.5">
                {usernameStatus.checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {!usernameStatus.checking && usernameStatus.available && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                {!usernameStatus.checking && usernameStatus.error && (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
            </div>
            {usernameStatus.error && (
              <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1">{usernameStatus.error}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Unique handle (a-z, 0-9, _, . only, max 30 chars). URL: thepathak.tech/{username || "handle"}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (usernameStatus.error ? true : false)}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}


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
      } catch {
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
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-16 px-4 bg-background">
      <div className="max-w-md w-full space-y-8 bg-card p-8 sm:p-10 rounded-sm border border-border shadow-xs">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="relative w-12 h-12 rounded-sm overflow-hidden border border-border mb-3 bg-foreground flex items-center justify-center">
              <Image
                src="/emblem.png"
                alt="ThePathak Logo"
                fill
                sizes="96px"
                className="object-contain p-1 invert dark:invert-0"
                priority
                unoptimized
              />
            </div>
            <span className="font-serif-editorial text-2xl font-semibold tracking-tight text-foreground">
              ThePathak<span className="text-blue-600 dark:text-blue-400">.tech</span>
            </span>
          </Link>
          <h2 className="text-lg font-medium text-foreground">Create a reader account</h2>
          <p className="text-xs text-muted-foreground">
            Choose your permanent unique handle to join discussions and track your reading.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-sm bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-sm bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Username Handle</label>
              <span className="text-[10px] text-muted-foreground">{username.length}/30</span>
            </div>
            <div className="relative">
              <AtSign className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                required
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="handle"
                className="w-full pl-9 pr-9 py-2 text-xs rounded-sm bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground font-mono"
              />
              <div className="absolute right-3 top-3">
                {usernameStatus.checking && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                {!usernameStatus.checking && usernameStatus.available && (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {!usernameStatus.checking && usernameStatus.error && (
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                )}
              </div>
            </div>
            {usernameStatus.error && (
              <p className="text-[11px] text-destructive mt-1">{usernameStatus.error}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              thepathak.tech/{username || "handle"}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-sm bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-sm bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (usernameStatus.error ? true : false)}
            className="w-full py-2.5 rounded-sm bg-foreground text-background font-medium text-xs transition-opacity hover:opacity-90 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? "Creating account..." : "Create Account"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

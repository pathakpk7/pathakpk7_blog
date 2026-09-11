"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitCallback = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Determine target redirect: if Admin logs in without explicit callback, open Writer Studio directly!
    const targetUrl = explicitCallback || (cleanEmail === "prasoon7pathak@gmail.com" ? "/studio" : "/");

    try {
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
        callbackUrl: targetUrl,
      });

      if (res?.error) {
        setError("Invalid email or password credentials.");
      } else {
        // Full navigation ensures the cookie is committed and picked up cleanly by middleware and server components
        window.location.href = targetUrl;
        return;
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl">
      <div className="text-center space-y-2">
        <Link href="/" className="font-serif-editorial text-3xl font-bold tracking-tight text-foreground">
          ThePathak<span className="text-blue-600 dark:text-blue-500">.tech</span>
        </Link>
        <h2 className="text-xl font-bold text-foreground">Sign In to Your Account</h2>
        <p className="text-xs text-muted-foreground">
          Access your library, saved articles, comments, and Writer Studio.
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{loading ? "Signing in to Writer Studio..." : "Sign In"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <Suspense fallback={<div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border animate-pulse text-center text-xs text-muted-foreground">Loading Sign In...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

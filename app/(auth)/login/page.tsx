"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
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
    const targetUrl = explicitCallback || "/";

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
        window.location.href = targetUrl;
        return;
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <h2 className="text-lg font-medium text-foreground">Sign in to your account</h2>
        <p className="text-xs text-muted-foreground">
          Access your library, reading history, comments, and writer tools.
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-sm bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-sm bg-foreground text-background font-medium text-xs transition-opacity hover:opacity-90 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{loading ? "Authenticating..." : "Sign In"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-foreground font-medium underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center py-16 px-4 bg-background">
      <Suspense fallback={<div className="max-w-md w-full p-8 rounded-sm bg-card border border-border text-center text-xs text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "";
  }
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return "just now";
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 45) return "a moment ago";
    if (diffSec < 90) return "1 min ago";
    if (diffMin < 60) return `${diffMin} mins ago`;
    if (diffHr === 1) return "1 hr ago";
    if (diffHr < 24) return `${diffHr} hrs ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
}

export function calculateReadingTime(content: string | null | undefined): number {
  if (!content) return 1;
  // Strip HTML tags if present for accurate word count
  const cleanText = content.replace(/<[^>]*>/g, " ").trim();
  const wordsPerMinute = 200;
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export const ANIME_AVATARS = [
  "/avatars/anime-aria.jpg",
  "/avatars/anime-kai.jpg",
  "/avatars/anime-sakura.jpg",
  "/avatars/anime-ren.jpg",
  "/avatars/anime-luna.jpg",
  "/avatars/anime-sora.jpg",
  "/avatars/anime-yuki.jpg",
  "/avatars/anime-haruto.jpg",
  "/avatars/anime-mia.jpg",
  "/avatars/anime-kenji.jpg",
  "/avatars/anime-rin.jpg",
  "/avatars/anime-shin.jpg",
  "/avatars/anime-akari.jpg",
  "/avatars/anime-daiki.jpg",
];

export function getSafeAvatarUrl(avatarUrl: string | null | undefined, seed?: string | null): string {
  if (avatarUrl && !avatarUrl.includes("adventurer") && !avatarUrl.includes("dicebear")) {
    return avatarUrl;
  }
  if (!seed) return ANIME_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % ANIME_AVATARS.length;
  return ANIME_AVATARS[index];
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    return prodUrl.startsWith("http") ? prodUrl : `https://${prodUrl}`;
  }
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL;
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }
  return "https://pathakpk7blog.vercel.app";
}

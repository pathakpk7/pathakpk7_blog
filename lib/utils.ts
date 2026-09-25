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
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://pathakpk7blog.vercel.app";
}



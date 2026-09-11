export const RESERVED_USERNAMES = new Set([
  "technology",
  "science",
  "coding",
  "ideas",
  "creative",
  "notes",
  "about",
  "search",
  "library",
  "login",
  "signup",
  "settings",
  "studio",
  "api",
  "article",
  "admin",
  "profile",
  "auth",
  "feed",
  "rss",
  "sitemap",
  "robots",
  "favicon",
  "icon",
  "apple-icon",
  "manifest",
  "terms",
  "privacy",
  "dashboard",
  "post",
  "posts",
  "user",
  "users",
  "tag",
  "tags",
  "category",
  "categories",
]);

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
  cleanUsername?: string;
}

export function validateUsername(rawUsername: string): UsernameValidationResult {
  if (!rawUsername || typeof rawUsername !== "string") {
    return { valid: false, error: "Username is required." };
  }

  // Handles are effectively case-insensitive -> normalize to lowercase and trimmed
  const clean = rawUsername.trim().toLowerCase();

  if (clean.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long." };
  }

  if (clean.length > 30) {
    return { valid: false, error: "Username cannot exceed 30 characters." };
  }

  // Spaces not allowed
  if (/\s/.test(clean)) {
    return { valid: false, error: "Spaces are not allowed in usernames." };
  }

  // Allowed characters: Letters a-z, numbers 0-9, _ underscore, . period
  // Emojis and other special characters not allowed
  if (!/^[a-z0-9_.]+$/.test(clean)) {
    return {
      valid: false,
      error: "Only letters (a-z), numbers (0-9), underscores (_), and periods (.) are allowed.",
    };
  }

  // Period rules: can't be at beginning or end
  if (clean.startsWith(".")) {
    return { valid: false, error: "Username cannot start with a period (.)." };
  }

  if (clean.endsWith(".")) {
    return { valid: false, error: "Username cannot end with a period (.)." };
  }

  // Period rules: consecutive periods aren't allowed
  if (clean.includes("..")) {
    return { valid: false, error: "Consecutive periods (..) are not allowed." };
  }

  // Reserved platform routes check
  if (RESERVED_USERNAMES.has(clean)) {
    return {
      valid: false,
      error: `"${clean}" is reserved by the platform and cannot be used as a handle.`,
    };
  }

  return { valid: true, cleanUsername: clean };
}

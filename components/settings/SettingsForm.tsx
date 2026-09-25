"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { updateProfile } from "@/app/actions/profile";
import { validateUsername } from "@/lib/validation/username";
import {
  User,
  Check,
  Sun,
  Moon,
  Laptop,
  Shield,
  AlertCircle,
  Loader2,
  ExternalLink,
  Globe,
  Heart,
  Menu,
  X,
  BookOpen,
  Bookmark as BookmarkIcon,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export const PRESET_AVATARS = [
  // Female Anime Characters (High Fidelity)
  { id: "avatar-anime-aria", url: "/avatars/anime-aria.jpg", title: "Aria (Violet Hair • City Twilight)", gender: "female" },
  { id: "avatar-anime-sakura", url: "/avatars/anime-sakura.jpg", title: "Sakura (Pink Hair • Cherry Blossoms)", gender: "female" },
  { id: "avatar-anime-luna", url: "/avatars/anime-luna.jpg", title: "Luna (Midnight Hair • Starry Cosmos)", gender: "female" },
  { id: "avatar-anime-yuki", url: "/avatars/anime-yuki.jpg", title: "Yuki (Silver Hair • Winter Serenade)", gender: "female" },
  { id: "avatar-anime-mia", url: "/avatars/anime-mia.jpg", title: "Mia (Chestnut Hair • Autumn Library)", gender: "female" },
  { id: "avatar-anime-rin", url: "/avatars/anime-rin.jpg", title: "Rin (Cyber Teal • Neon Dive)", gender: "female" },
  { id: "avatar-anime-akari", url: "/avatars/anime-akari.jpg", title: "Akari (Auburn Braids • Sunset Glow)", gender: "female" },

  // Male Anime Characters (High Fidelity)
  { id: "avatar-anime-kai", url: "/avatars/anime-kai.jpg", title: "Kai (Dark Hair • Shibuya Night)", gender: "male" },
  { id: "avatar-anime-ren", url: "/avatars/anime-ren.jpg", title: "Ren (Silver Hair • Rooftop Sunset)", gender: "male" },
  { id: "avatar-anime-sora", url: "/avatars/anime-sora.jpg", title: "Sora (Brown Wavy • Tech & Coffee)", gender: "male" },
  { id: "avatar-anime-haruto", url: "/avatars/anime-haruto.jpg", title: "Haruto (Glasses • Studio Architect)", gender: "male" },
  { id: "avatar-anime-kenji", url: "/avatars/anime-kenji.jpg", title: "Kenji (Cyber Undercut • Neon ARC)", gender: "male" },
  { id: "avatar-anime-shin", url: "/avatars/anime-shin.jpg", title: "Shin (Blond • Radiant Sky)", gender: "male" },
  { id: "avatar-anime-daiki", url: "/avatars/anime-daiki.jpg", title: "Daiki (Slate Hair • Twilight City)", gender: "male" },
];

interface SettingsFormProps {
  user: {
    id: string;
    email: string;
    role: string;
    profile?: {
      username?: string | null;
      displayName?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
  activity?: {
    likedPosts: any[];
    bookmarkedPosts: any[];
    comments: any[];
    publishedPosts: any[];
  };
}

export function SettingsForm({ user, activity }: SettingsFormProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "activity" | "account">("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [username, setUsername] = useState(user.profile?.username || "");
  const [displayName, setDisplayName] = useState(user.profile?.displayName || "");
  const [bio, setBio] = useState(user.profile?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    user.profile?.avatarUrl || PRESET_AVATARS[0].url
  );

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    error?: string;
  }>({ checking: false });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const tabs = [
    {
      id: "profile" as const,
      label: "Profile & Avatar",
      icon: User,
    },
    {
      id: "appearance" as const,
      label: "Appearance & Theme",
      icon: Sun,
    },
    {
      id: "activity" as const,
      label: "Activity & History",
      icon: Heart,
      iconColor: "text-rose-500",
    },
    {
      id: "account" as const,
      label: "Account Overview",
      icon: Shield,
    },
  ];

  // Debounced live username availability check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ checking: false, error: "Username is required." });
      return;
    }

    const val = validateUsername(username);
    if (!val.valid) {
      setUsernameStatus({ checking: false, available: false, error: val.error });
      return;
    }

    if (val.cleanUsername === user.profile?.username?.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true });
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
  }, [username, user.profile?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const val = validateUsername(username);
    if (!val.valid) {
      setMessage({ type: "error", text: val.error || "Invalid username." });
      setSaving(false);
      return;
    }

    try {
      await updateProfile({
        username: val.cleanUsername || username,
        displayName,
        bio,
        avatarUrl: selectedAvatar,
      });
      setMessage({ type: "success", text: "Profile settings updated successfully!" });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const cleanHandle = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
      {/* Mobile Hamburger Navigation Header */}
      <div className="md:hidden col-span-1">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center space-x-2.5">
            {activeTab === "profile" && <User className="w-4 h-4 text-blue-500" />}
            {activeTab === "appearance" && <Sun className="w-4 h-4 text-amber-500" />}
            {activeTab === "activity" && <Heart className="w-4 h-4 text-rose-500" />}
            {activeTab === "account" && <Shield className="w-4 h-4 text-emerald-500" />}
            <span className="text-sm font-semibold text-foreground">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-muted/70 text-foreground hover:bg-muted transition-colors flex items-center space-x-1.5 text-xs font-semibold border border-border"
            aria-label="Toggle settings menu"
          >
            {mobileMenuOpen ? (
              <>
                <X className="w-4 h-4 text-rose-500" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4 text-blue-500" />
                <span>Options</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <div className="mt-2.5 p-2 rounded-2xl bg-card border border-border shadow-lg space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${tab.iconColor || ""}`} />
                    <span>{tab.label}</span>
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}

            <div className="pt-2 border-t border-border/80">
              <Link
                href={`/${user.profile?.username || cleanHandle}`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <span className="flex items-center space-x-2.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Public Profile</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex md:flex-col gap-2 border-r border-border pr-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.iconColor || ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="pt-2 border-t border-border/80">
          <Link
            href={`/${user.profile?.username || cleanHandle}`}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5" />
              <span>Public Profile</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
          }`}>
            {message.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Gallery Selector */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Select Avatar
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose your personalized anime avatar portrait ({PRESET_AVATARS.length} styles available).
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2.5 sm:gap-3 pt-1">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`relative group aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all bg-zinc-900 ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/30"
                          : "border-border hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                      title={avatar.title}
                    >
                      <Image src={avatar.url} alt={avatar.title} fill className="object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Public Name"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
              />
            </div>

            {/* Username with Live Validation & Constraints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Unique Username Handle
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {username.length}/30 chars
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm text-muted-foreground font-mono">@</span>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder="handle_name"
                  className="w-full pl-8 pr-10 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
                <div className="absolute right-3 top-3">
                  {usernameStatus.checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {!usernameStatus.checking && usernameStatus.available && (
                    <Check className="w-4 h-4 text-emerald-500" />
                  )}
                  {!usernameStatus.checking && usernameStatus.error && (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              </div>

              {/* Live Status or Error */}
              {usernameStatus.error && (
                <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center space-x-1">
                  <span>{usernameStatus.error}</span>
                </p>
              )}

              {/* Profile URL Preview */}
              {cleanHandle && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
                  <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Public Profile URL:</span>
                  <Link
                    href={`/${cleanHandle}`}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono font-medium inline-flex items-center space-x-1"
                  >
                    <span>thepathak.tech/{cleanHandle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Rule Summary */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-card p-3 rounded-lg border border-border">
                <div>• Letters a-z, numbers 0-9, _, . only</div>
                <div>• 3 to 30 characters max</div>
                <div>• No spaces or emojis</div>
                <div>• Cannot start/end with dot or have consecutive dots</div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your interests in software, astrophysics, or literature..."
                className="w-full p-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={saving || usernameStatus.checking || (usernameStatus.error ? true : false)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </form>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif-editorial text-foreground">Theme Preference</h3>
              <p className="text-xs text-muted-foreground">Select your preferred color theme for reading and publishing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 rounded-2xl border text-left space-y-3 transition-all ${
                  theme === "light"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Sun className="w-5 h-5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm">Light Mode</p>
                  <p className="text-xs text-muted-foreground">Warm, off-white editorial paper finish.</p>
                </div>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-2xl border text-left space-y-3 transition-all ${
                  theme === "dark"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Moon className="w-5 h-5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Deep obsidian dark mode for nighttime reading.</p>
                </div>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`p-4 rounded-2xl border text-left space-y-3 transition-all ${
                  theme === "system"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Laptop className="w-5 h-5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm">System Default</p>
                  <p className="text-xs text-muted-foreground">Sync automatically with operating system preferences.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Activity Tab - Interactive Profile History */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif-editorial text-foreground">
                  My Activity & Library
                </h3>
                <p className="text-xs text-muted-foreground">
                  View and manage your real-time likes, bookmarks library, and comment discussions.
                </p>
              </div>
              <Link
                href="/library"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs shrink-0 self-start sm:self-auto"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Full Library</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="pt-2">
              <ProfileTabs
                displayName={user.profile?.displayName || user.profile?.username || "User"}
                username={user.profile?.username || cleanHandle || "user"}
                isAdmin={user.role === "ADMIN"}
                publishedPosts={activity?.publishedPosts || []}
                likedPosts={activity?.likedPosts || []}
                bookmarkedPosts={activity?.bookmarkedPosts || []}
                comments={activity?.comments || []}
              />
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif-editorial text-foreground">Account Summary</h3>
              <p className="text-xs text-muted-foreground">Your account authentication identity details and library access.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Email Address</span>
                <span className="text-sm font-semibold text-foreground font-mono">{user.email}</span>
              </div>

              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Handle</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 font-mono">@{user.profile?.username || "unassigned"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Account Role</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase ${
                  user.role === "ADMIN"
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "bg-muted text-foreground"
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Quick Access to My Library */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Personal Library</h4>
                    <p className="text-xs text-muted-foreground">
                      Access all your saved bookmarks, favorited articles, and reading history.
                    </p>
                  </div>
                </div>

                <Link
                  href="/library"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <span>Go to Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-border/70">
                <div className="p-3 rounded-xl bg-muted/40">
                  <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                    {activity?.bookmarkedPosts?.length || 0}
                  </span>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Bookmarked</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40">
                  <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                    {activity?.likedPosts?.length || 0}
                  </span>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Liked</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40">
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {activity?.comments?.length || 0}
                  </span>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


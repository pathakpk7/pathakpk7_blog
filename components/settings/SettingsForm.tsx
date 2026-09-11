"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { updateProfile } from "@/app/actions/profile";
import { validateUsername } from "@/lib/validation/username";
import { User, Check, Sun, Moon, Laptop, Shield, AlertCircle, Loader2, ExternalLink, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export const PRESET_AVATARS = [
  { id: "avatar-shapes-cosmos", url: "https://api.dicebear.com/9.x/shapes/svg?seed=Cosmos&backgroundColor=0284c7,2563eb,4f46e5", title: "Cosmic Shapes" },
  { id: "avatar-shapes-quantum", url: "https://api.dicebear.com/9.x/shapes/svg?seed=Quantum&backgroundColor=059669,10b981,14b8a6", title: "Quantum Emerald" },
  { id: "avatar-shapes-horizon", url: "https://api.dicebear.com/9.x/shapes/svg?seed=Horizon&backgroundColor=d97706,f59e0b,ea580c", title: "Solar Amber" },
  { id: "avatar-shapes-nebula", url: "https://api.dicebear.com/9.x/shapes/svg?seed=Nebula&backgroundColor=7c3aed,8b5cf6,6366f1", title: "Deep Nebula" },
  { id: "avatar-identicon-arch", url: "https://api.dicebear.com/9.x/identicon/svg?seed=Arch&backgroundColor=1e293b,334155", title: "Geometric Cipher" },
  { id: "avatar-bottts-matrix", url: "https://api.dicebear.com/9.x/bottts/svg?seed=Matrix&backgroundColor=0f172a,1e293b", title: "Cyber Automaton" },
  { id: "avatar-shapes-crimson", url: "https://api.dicebear.com/9.x/shapes/svg?seed=Cyber&backgroundColor=dc2626,ef4444", title: "Crimson Core" },
  { id: "avatar-shapes-zenith", url: "https://api.dicebear.com/9.x/shapes/svg?seed=Zenith&backgroundColor=0f766e,0d9488", title: "Zenith Teal" },
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
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "account">("profile");

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Tabs */}
      <div className="flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === "profile"
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Avatar</span>
        </button>

        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === "appearance"
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Appearance & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === "account"
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account Overview</span>
        </button>
      </div>

      {/* Main Content Form */}
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
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                Select Stylized Avatar (Vector / Non-Face)
              </label>
              <p className="text-xs text-muted-foreground">
                Choose an abstract geometric avatar from our vector presets.
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-2">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`relative h-16 w-16 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-zinc-900 ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/30"
                          : "border-border hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                      title={avatar.title}
                    >
                      <Image src={avatar.url} alt={avatar.title} fill className="object-contain p-1" unoptimized />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-blue-500"
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

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif-editorial text-foreground">Account Summary</h3>
              <p className="text-xs text-muted-foreground">Your account authentication identity details.</p>
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
          </div>
        )}
      </div>
    </div>
  );
}


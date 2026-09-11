"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { updateProfile } from "@/app/actions/profile";
import { User, Check, Sun, Moon, Laptop, Shield, Sparkles, AlertCircle } from "lucide-react";

const PRESET_AVATARS = [
  { id: "avatar-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", title: "Minimalist Author" },
  { id: "avatar-2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", title: "Developer Classic" },
  { id: "avatar-3", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", title: "Editorial Writer" },
  { id: "avatar-4", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", title: "Creative Scholar" },
  { id: "avatar-5", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80", title: "Systems Architect" },
  { id: "avatar-6", url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80", title: "Astrophysicist" },
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
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "account">("profile");

  const [username, setUsername] = useState(user.profile?.username || "");
  const [displayName, setDisplayName] = useState(user.profile?.displayName || "");
  const [bio, setBio] = useState(user.profile?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    user.profile?.avatarUrl || PRESET_AVATARS[0].url
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        username,
        displayName,
        bio,
        avatarUrl: selectedAvatar,
      });
      setMessage({ type: "success", text: "Profile settings updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

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
                Select Profile Avatar (Preset Gallery)
              </label>
              <p className="text-xs text-muted-foreground">
                Choose an official preset avatar from the platform gallery.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`relative h-20 w-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/30"
                          : "border-border hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                      title={avatar.title}
                    >
                      <Image src={avatar.url} alt={avatar.title} fill className="object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
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

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
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
              disabled={saving}
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

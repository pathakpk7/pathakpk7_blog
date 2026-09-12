"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";
import { updateCommentStatus } from "@/app/actions/moderation";
import {
  Check,
  X,
  ShieldAlert,
  Trash2,
  RotateCcw,
  MessageSquare,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommentItem {
  id: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  createdAt: Date | string;
  post: {
    title: string;
    slug: string;
  };
  user: {
    name?: string | null;
    image?: string | null;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
      username?: string | null;
    } | null;
  };
}

interface CommentModerationListProps {
  initialComments: CommentItem[];
}

export function CommentModerationList({ initialComments }: CommentModerationListProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SPAM">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ id: string; text: string; type: "success" | "info" } | null>(null);

  // Sync state if initialComments update
  if (initialComments !== comments && !isPending && comments.length !== initialComments.length) {
    setComments(initialComments);
  }

  // Handle status update or toggle/revert
  const handleStatusChange = async (commentId: string, targetStatus: "APPROVED" | "REJECTED" | "SPAM") => {
    const currentComment = comments.find((c) => c.id === commentId);
    if (!currentComment) return;

    // If already has target status, clicking again reverts it back to PENDING (two-way toggle)
    const newStatus: "APPROVED" | "REJECTED" | "SPAM" | "PENDING" =
      currentComment.status === targetStatus ? "PENDING" : targetStatus;

    // Optimistically update local state immediately
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
    );

    const messageText =
      newStatus === "PENDING"
        ? `Comment status reverted back to Pending review.`
        : newStatus === "APPROVED"
        ? `Comment approved and now visible live on article.`
        : newStatus === "REJECTED"
        ? `Comment rejected (hidden from public view).`
        : `Comment marked as spam.`;

    setActionMessage({ id: commentId, text: messageText, type: newStatus === "APPROVED" ? "success" : "info" });
    setTimeout(() => {
      setActionMessage((curr) => (curr?.id === commentId ? null : curr));
    }, 3500);

    startTransition(async () => {
      try {
        await updateCommentStatus(commentId, newStatus);
        router.refresh();
      } catch (err) {
        console.error("Failed to update comment status:", err);
        // Rollback state on failure
        setComments(initialComments);
        alert("Failed to update comment status. Please try again.");
      }
    });
  };

  // Explicit Revert to Pending
  const handleRevertToPending = async (commentId: string) => {
    // Optimistic update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: "PENDING" } : c))
    );

    setActionMessage({
      id: commentId,
      text: "Reverted decision. Comment returned to Pending review queue.",
      type: "info",
    });
    setTimeout(() => {
      setActionMessage((curr) => (curr?.id === commentId ? null : curr));
    }, 3500);

    startTransition(async () => {
      try {
        await updateCommentStatus(commentId, "PENDING");
        router.refresh();
      } catch (err) {
        console.error("Failed to revert comment:", err);
        setComments(initialComments);
      }
    });
  };

  // Handle permanent deletion
  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    setConfirmDeleteId(null);

    // Optimistic removal
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    startTransition(async () => {
      try {
        await updateCommentStatus(commentId, "DELETED");
        router.refresh();
      } catch (err) {
        console.error("Failed to delete comment:", err);
        setComments(initialComments);
        alert("Failed to delete comment.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  // Filter calculations
  const pendingCount = comments.filter((c) => c.status === "PENDING").length;
  const approvedCount = comments.filter((c) => c.status === "APPROVED").length;
  const rejectedCount = comments.filter((c) => c.status === "REJECTED").length;
  const spamCount = comments.filter((c) => c.status === "SPAM").length;

  const filteredComments = comments.filter((comment) => {
    // Status filter
    if (activeFilter !== "ALL" && comment.status !== activeFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const author = (comment.user.profile?.displayName || comment.user.name || "").toLowerCase();
      const username = (comment.user.profile?.username || "").toLowerCase();
      const content = comment.content.toLowerCase();
      const postTitle = comment.post.title.toLowerCase();
      return author.includes(q) || username.includes(q) || content.includes(q) || postTitle.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 ${
              activeFilter === "ALL"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {comments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 ${
              activeFilter === "PENDING"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50"
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/30 text-amber-300 font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("APPROVED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 ${
              activeFilter === "APPROVED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                : "text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50"
            }`}
          >
            <span>Approved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("REJECTED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 ${
              activeFilter === "REJECTED"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                : "text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/50"
            }`}
          >
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400">
              {rejectedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("SPAM")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 ${
              activeFilter === "SPAM"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xs"
                : "text-zinc-400 hover:text-orange-400 hover:bg-zinc-800/50"
            }`}
          >
            <span>Spam</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-400">
              {spamCount}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Comments Feed */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden divide-y divide-zinc-800">
        {filteredComments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto" />
            <p className="text-sm text-zinc-400 font-semibold">No comments match the selected filter.</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? `No discussions matching "${searchQuery}". Try clearing search or selecting a different status.`
                : `No comments currently in the "${activeFilter}" queue.`}
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const authorName = comment.user.profile?.displayName || comment.user.name || "Reader";
            const username = comment.user.profile?.username;
            const avatarUrl = getSafeAvatarUrl(comment.user.profile?.avatarUrl, username || authorName);
            const isApproved = comment.status === "APPROVED";
            const isRejected = comment.status === "REJECTED";
            const isSpam = comment.status === "SPAM";
            const isPendingStatus = comment.status === "PENDING";

            return (
              <div
                key={comment.id}
                className={`p-5 sm:p-6 space-y-4 transition-colors ${
                  isApproved
                    ? "hover:bg-zinc-800/40"
                    : isRejected
                    ? "bg-rose-950/10 hover:bg-rose-950/20"
                    : isSpam
                    ? "bg-orange-950/10 hover:bg-orange-950/20"
                    : "bg-amber-950/10 hover:bg-amber-950/20"
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                      <Image src={avatarUrl} alt={authorName} fill className="object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-semibold text-white">{authorName}</span>
                        {username && <span className="font-mono text-zinc-400 text-[11px]">@{username}</span>}
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400 text-[11px]">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="text-zinc-500">on</span>
                        <Link
                          href={`/article/${comment.post.slug}#comments`}
                          target="_blank"
                          className="font-serif-editorial font-bold text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span className="line-clamp-1">{comment.post.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${
                        isApproved
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : isPendingStatus
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : isRejected
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {isApproved
                        ? "Live / Approved"
                        : isPendingStatus
                        ? "Pending Review"
                        : isRejected
                        ? "Rejected"
                        : "Spam"}
                    </span>
                  </div>
                </div>

                {/* Comment text */}
                <div
                  className={`text-sm leading-relaxed whitespace-pre-line p-4 rounded-xl border ${
                    isRejected
                      ? "bg-zinc-950 text-zinc-400 border-rose-900/40"
                      : isSpam
                      ? "bg-zinc-950 text-zinc-500 border-orange-900/40"
                      : isPendingStatus
                      ? "bg-zinc-950 text-zinc-200 border-amber-900/40"
                      : "bg-zinc-950 text-zinc-100 border-zinc-800"
                  }`}
                >
                  &ldquo;{comment.content}&rdquo;
                </div>

                {/* Inline Action Message Feedback */}
                {actionMessage?.id === comment.id && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                      actionMessage.type === "success"
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                        : "bg-blue-950/60 text-blue-300 border border-blue-800"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{actionMessage.text}</span>
                  </div>
                )}

                {/* Moderation Controls: Toggleable & Revertable */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
                  <div className="text-[11px] text-zinc-500 hidden sm:block">
                    {isApproved
                      ? "Status is Live. Click Approve again to revert, or choose Reject / Spam."
                      : isRejected
                      ? "Status is Rejected. Click Approve to restore live visibility."
                      : isSpam
                      ? "Marked as Spam. Click Approve to unmark and make live."
                      : "Awaiting review. Click Approve to publish, or Reject / Spam."}
                  </div>

                  <div className="flex items-center space-x-2 ml-auto">
                    {/* Approve Button (Two-way toggle) */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(comment.id, "APPROVED")}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 shadow-xs ${
                        isApproved
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-500/40 hover:bg-emerald-500"
                          : "bg-emerald-950/40 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/60 hover:text-white"
                      }`}
                      title={isApproved ? "Currently Approved (Click to toggle back to Pending)" : "Approve comment to display live on article"}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isApproved ? "Approved ✓" : "Approve"}</span>
                    </button>

                    {/* Reject Button (Two-way toggle) */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(comment.id, "REJECTED")}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 shadow-xs ${
                        isRejected
                          ? "bg-rose-600 text-white ring-2 ring-rose-500/40 hover:bg-rose-500"
                          : "bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800"
                      }`}
                      title={isRejected ? "Currently Rejected (Click to toggle back to Pending)" : "Reject comment to hide from public"}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isRejected ? "Rejected ✕" : "Reject"}</span>
                    </button>

                    {/* Spam Button (Two-way toggle) */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(comment.id, "SPAM")}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 shadow-xs ${
                        isSpam
                          ? "bg-amber-600 text-white ring-2 ring-amber-500/40 hover:bg-amber-500"
                          : "bg-amber-950/30 text-amber-400 border border-amber-800/70 hover:bg-amber-900/50 hover:text-white"
                      }`}
                      title={isSpam ? "Currently Marked Spam (Click to toggle back to Pending)" : "Mark as spam"}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{isSpam ? "Spam ⚠" : "Spam"}</span>
                    </button>

                    {/* Explicit Revert to Pending Button (shown when not pending) */}
                    {!isPendingStatus && (
                      <button
                        type="button"
                        onClick={() => handleRevertToPending(comment.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
                        title="Revert decision back to Pending review"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Revert</span>
                      </button>
                    )}

                    {/* Delete Confirmation */}
                    {confirmDeleteId === comment.id ? (
                      <div className="inline-flex items-center space-x-1 bg-rose-950/80 p-1 rounded-xl border border-rose-800 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(comment.id)}
                        disabled={deletingId === comment.id}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
                        title="Delete comment permanently"
                        aria-label="Delete comment"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

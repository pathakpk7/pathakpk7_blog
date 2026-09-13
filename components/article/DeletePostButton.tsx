"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { deletePost } from "@/app/actions/post";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DeletePostButtonProps {
  postId: string;
  postTitle?: string;
  redirectTo?: string;
  variant?: "button" | "icon" | "floating" | "minimal";
  className?: string;
  onSuccess?: () => void;
  onDeleted?: () => void;
}

export function DeletePostButton({
  postId,
  postTitle,
  redirectTo,
  variant = "button",
  className,
  onSuccess,
  onDeleted,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deletePost(postId);
      if (res?.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
        if (onDeleted) onDeleted();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } else {
        setError("Failed to delete publication. Please try again.");
      }
    } catch (err: any) {
      console.error("Delete post error:", err);
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {variant === "icon" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-800/60 transition-colors",
            className
          )}
          title="Delete publication"
          aria-label="Delete publication"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {variant === "floating" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors",
            className
          )}
          title="Delete article (Admin)"
          aria-label="Delete article"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {variant === "minimal" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center space-x-1.5 text-xs text-rose-500 hover:text-rose-400 font-medium transition-colors",
            className
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      )}

      {variant === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors active:scale-95",
            className
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Article</span>
        </button>
      )}

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-card dark:bg-zinc-900 rounded-2xl border border-border shadow-2xl p-6 space-y-5 text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif-editorial text-foreground">
                Delete Publication?
              </h3>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground font-serif">
                  {postTitle ? `"${postTitle}"` : "this publication"}
                </span>
                ?
              </p>
              <p className="text-rose-500 dark:text-rose-400 font-medium">
                This action cannot be undone. All comments, likes, and analytics for this post will also be removed.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 active:scale-95"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

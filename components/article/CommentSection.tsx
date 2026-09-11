"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { addComment } from "@/app/actions/comment";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";
import { Send, MessageSquare, CornerDownRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    name?: string | null;
    image?: string | null;
    profile?: { displayName?: string | null; avatarUrl?: string | null; username?: string | null } | null;
  };
  replies?: CommentItem[];
}

interface CommentSectionProps {
  postId: string;
  comments: CommentItem[];
  isLoggedIn: boolean;
}

export function CommentSection({ postId, comments, isLoggedIn }: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const textToSubmit = parentId ? replyContent : content;
    if (!textToSubmit.trim()) return;

    setSubmitting(true);
    try {
      await addComment(postId, textToSubmit, parentId);
      if (parentId) {
        setReplyContent("");
        setReplyParentId(null);
      } else {
        setContent("");
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="comments" className="mt-16 pt-10 border-t border-border space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-serif-editorial text-2xl font-bold text-foreground">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Main Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts or observations on this article..."
            className="w-full p-4 rounded-xl bg-card border border-border focus:border-blue-500 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground resize-y min-h-[100px]"
            maxLength={2000}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl bg-muted/50 border border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">Sign in to join the discussion and share your thoughts.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors active:scale-95"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">
            No comments yet. Be the first to start the discussion!
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.user.profile?.displayName || comment.user.name || "Reader";
            const username = comment.user.profile?.username;
            const avatar = comment.user.profile?.avatarUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=${username || author}`;

            return (
              <div key={comment.id} className="space-y-3 bg-card p-4 rounded-xl border border-border/60">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-border">
                      <Image src={getSafeAvatarUrl(avatar, username || author)} alt={author} fill className="object-cover" />
                    </div>
                    <div>
                      {username ? (
                        <Link href={`/${username}`} className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {author} <span className="font-mono text-zinc-400 font-normal">@{username}</span>
                        </Link>
                      ) : (
                        <span className="font-semibold text-foreground">{author}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[11px]">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line pl-8.5">{comment.content}</p>

                {/* Reply button */}
                {isLoggedIn && (
                  <div className="pl-8.5">
                    <button
                      onClick={() => setReplyParentId(replyParentId === comment.id ? null : comment.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center space-x-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                )}

                {/* Reply Input Form */}
                {replyParentId === comment.id && (
                  <form onSubmit={(e) => handleSubmit(e, comment.id)} className="pl-8.5 pt-2 space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full p-3 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setReplyParentId(null)}
                        className="px-3 py-1 text-xs text-muted-foreground hover:bg-muted rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !replyContent.trim()}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold active:scale-95"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-8.5 pt-3 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-800 ml-3">
                    {comment.replies.map((reply) => {
                      const repAuthor = reply.user.profile?.displayName || reply.user.name || "Reader";
                      const repUsername = reply.user.profile?.username;
                      const repAvatar = reply.user.profile?.avatarUrl;

                      return (
                        <div key={reply.id} className="space-y-1 bg-muted/40 p-3 rounded-lg">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-2">
                              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-border">
                                <Image src={getSafeAvatarUrl(repAvatar, repUsername || repAuthor)} alt={repAuthor} fill className="object-cover" />
                              </div>
                              {repUsername ? (
                                <Link href={`/${repUsername}`} className="font-semibold text-foreground hover:underline">
                                  {repAuthor} <span className="font-mono text-zinc-400 font-normal">@{repUsername}</span>
                                </Link>
                              ) : (
                                <span className="font-semibold text-foreground">{repAuthor}</span>
                              )}
                            </div>
                            <span className="text-muted-foreground">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed pl-7">{reply.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}


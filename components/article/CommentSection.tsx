"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { addComment, editComment, deleteComment } from "@/app/actions/comment";
import { toggleCommentLike } from "@/app/actions/comment-like";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";
import { Send, MessageSquare, CornerDownRight, AtSign, Edit3, Trash2, Check, X, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommentItem {
  id: string;
  userId?: string;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  likesCount?: number;
  isLiked?: boolean;
  user: {
    id?: string;
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
  currentUserId?: string;
  isAdmin?: boolean;
}

interface MentionUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export function CommentSection({
  postId,
  comments: initialComments,
  isLoggedIn,
  currentUserId,
  isAdmin = false,
}: CommentSectionProps) {
  const router = useRouter();
  const [commentList, setCommentList] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync initialComments when server updates
  useEffect(() => {
    setCommentList(initialComments);
  }, [initialComments]);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>([]);
  const [activeInput, setActiveInput] = useState<"main" | "reply" | "edit" | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const mainInputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Search mentionable users
  useEffect(() => {
    if (mentionQuery === null) {
      setMentionSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/mentionable?q=${encodeURIComponent(mentionQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setMentionSuggestions(data.users || []);
        }
      } catch (e) {
        console.error("Mention search error:", e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [mentionQuery]);

  // Handle typing to detect @mention
  const handleInputChange = (
    text: string,
    target: "main" | "reply" | "edit",
    textarea: HTMLTextAreaElement
  ) => {
    if (target === "main") setContent(text);
    else if (target === "reply") setReplyContent(text);
    else setEditContent(text);

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      setActiveInput(target);
      setMentionQuery(lastWord.slice(1));
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user: MentionUser) => {
    const isMain = activeInput === "main";
    const isReply = activeInput === "reply";
    const text = isMain ? content : isReply ? replyContent : editContent;
    const textarea = isMain ? mainInputRef.current : isReply ? replyInputRef.current : editInputRef.current;

    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);

    const words = textBeforeCursor.split(/\s+/);
    words.pop(); // remove partial @query
    const newPrefix = words.length > 0 ? words.join(" ") + " " : "";
    const newText = `${newPrefix}@${user.username} ${textAfterCursor}`;

    if (isMain) setContent(newText);
    else if (isReply) setReplyContent(newText);
    else setEditContent(newText);

    setMentionQuery(null);
    setMentionSuggestions([]);

    setTimeout(() => {
      textarea.focus();
      const newPos = newPrefix.length + user.username.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const handleStartReply = (commentId: string, authorUsername?: string | null, authorName?: string | null) => {
    setEditingCommentId(null);
    setReplyParentId(commentId);
    const tag = authorUsername
      ? `@${authorUsername} `
      : authorName
      ? `@${authorName.toLowerCase().replace(/\s+/g, "_")} `
      : "";
    setReplyContent(tag);

    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 100);
  };

  const handleStartEdit = (comment: CommentItem) => {
    setReplyParentId(null);
    setEditingCommentId(comment.id);
    setEditContent(comment.content);

    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  // Submit Edit with Optimistic UI update
  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    const trimmed = editContent.trim();
    const prevList = [...commentList];

    // Optimistically update
    const updatedList = commentList.map((c) => {
      if (c.id === commentId) {
        return { ...c, content: trimmed, updatedAt: new Date() };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, content: trimmed, updatedAt: new Date() } : r
          ),
        };
      }
      return c;
    });

    setCommentList(updatedList);
    setEditingCommentId(null);

    try {
      await editComment(commentId, trimmed);
    } catch (err) {
      console.error("Failed to save edited comment:", err);
      setCommentList(prevList);
    }
  };

  // Delete comment / reply
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    const prevList = [...commentList];
    const filteredList = commentList
      .filter((c) => c.id !== commentId)
      .map((c) => ({
        ...c,
        replies: c.replies ? c.replies.filter((r) => r.id !== commentId) : [],
      }));

    setCommentList(filteredList);

    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setCommentList(prevList);
    }
  };

  // Like / Unlike comment or reply
  const handleLikeComment = async (commentId: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const prevList = [...commentList];
    const updatedList = commentList.map((c) => {
      if (c.id === commentId) {
        const nextLiked = !c.isLiked;
        const count = (c.likesCount || 0) + (nextLiked ? 1 : -1);
        return { ...c, isLiked: nextLiked, likesCount: Math.max(0, count) };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map((r) => {
            if (r.id === commentId) {
              const nextLiked = !r.isLiked;
              const count = (r.likesCount || 0) + (nextLiked ? 1 : -1);
              return { ...r, isLiked: nextLiked, likesCount: Math.max(0, count) };
            }
            return r;
          }),
        };
      }
      return c;
    });

    setCommentList(updatedList);

    try {
      const res = await toggleCommentLike(commentId);
      if (res) {
        setCommentList((current) =>
          current.map((c) => {
            if (c.id === commentId) {
              return { ...c, isLiked: res.isLiked, likesCount: res.likeCount };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, isLiked: res.isLiked, likesCount: res.likeCount } : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
      setCommentList(prevList);
    }
  };

  // Submit New Comment or Reply
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
      const res = await addComment(postId, textToSubmit, parentId);
      if (parentId) {
        setReplyContent("");
        setReplyParentId(null);
      } else {
        setContent("");
      }
      setMentionQuery(null);

      // Optimistically append newly added comment
      if (res?.comment) {
        if (parentId) {
          setCommentList((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), res.comment as any] }
                : c
            )
          );
        } else {
          setCommentList((prev) => [res.comment as any, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current user can edit a comment
  const canEdit = (comment: CommentItem) => {
    if (!isLoggedIn) return false;
    if (isAdmin) return true;
    const authorId = comment.userId || comment.user?.id;
    return currentUserId && authorId && currentUserId === authorId;
  };

  // Render text with clickable @mentions
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.slice(1);
        return (
          <Link
            key={index}
            href={`/${username}`}
            className="inline-flex items-center text-blue-700 dark:text-blue-300 font-semibold hover:underline bg-blue-100/80 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-xs mx-0.5 border border-blue-300/80 dark:border-blue-800/60 transition-colors"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const totalCommentsCount = commentList.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0
  );

  return (
    <section id="comments" className="mt-16 pt-10 border-t border-border space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-serif-editorial text-2xl font-bold text-foreground">
            Discussion ({totalCommentsCount})
          </h3>
        </div>
        <span className="text-xs text-muted-foreground flex items-center space-x-1">
          <AtSign className="w-3.5 h-3.5 text-blue-500" />
          <span>Type @ to tag readers</span>
        </span>
      </div>

      {/* Main Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-3 relative">
          <div className="relative">
            <textarea
              ref={mainInputRef}
              value={content}
              onChange={(e) => handleInputChange(e.target.value, "main", e.target)}
              placeholder="Share your thoughts or observations... (type @ to tag someone)"
              className="w-full p-4 rounded-xl bg-card border border-border focus:border-blue-500 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground resize-y min-h-[100px]"
              maxLength={2000}
            />

            {/* Mention Suggestions Dropdown for Main */}
            {activeInput === "main" && mentionSuggestions.length > 0 && (
              <div className="absolute left-3 bottom-full mb-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/30">
                  Tag a reader
                </p>
                {mentionSuggestions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => insertMention(u)}
                    className="flex items-center space-x-2.5 w-full px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                      <Image
                        src={getSafeAvatarUrl(u.avatar, u.username)}
                        alt={u.displayName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{u.displayName}</p>
                      <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors disabled:opacity-50 active:scale-95 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl bg-muted/50 border border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">Sign in to join the discussion, reply, and tag authors.</p>
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
        {commentList.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">
            No comments yet. Be the first to start the discussion!
          </p>
        ) : (
          commentList.map((comment) => {
            const author = comment.user.profile?.displayName || comment.user.name || "Reader";
            const username = comment.user.profile?.username;
            const avatar = comment.user.profile?.avatarUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=${username || author}`;
            const isEditing = editingCommentId === comment.id;
            const userCanEdit = canEdit(comment);
            const isEdited = comment.updatedAt && new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

            return (
              <div key={comment.id} className="space-y-3 bg-card p-4 rounded-xl border border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <Image src={getSafeAvatarUrl(avatar, username || author)} alt={author} fill className="object-cover" />
                    </div>
                    <div>
                      {username ? (
                        <Link href={`/${username}`} className="font-bold text-zinc-950 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {author} <span className="font-mono text-zinc-600 dark:text-zinc-400 font-medium">@{username}</span>
                        </Link>
                      ) : (
                        <span className="font-bold text-zinc-950 dark:text-zinc-50">{author}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400 text-[11px]">
                    <span>{formatDate(comment.createdAt)}</span>
                    {isEdited && <span className="italic text-zinc-500 dark:text-zinc-400 text-[10px]">(edited)</span>}
                  </div>
                </div>

                {/* Comment Body or Edit Form */}
                {isEditing ? (
                  <div className="pl-8.5 pt-1 space-y-2 relative">
                    <textarea
                      ref={editInputRef}
                      value={editContent}
                      onChange={(e) => handleInputChange(e.target.value, "edit", e.target)}
                      className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-y min-h-[80px]"
                    />

                    {/* Mention Dropdown for Edit */}
                    {activeInput === "edit" && mentionSuggestions.length > 0 && (
                      <div className="absolute left-2 bottom-full mb-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                        {mentionSuggestions.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => insertMention(u)}
                            className="flex items-center space-x-2.5 w-full px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                          >
                            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                              <Image src={getSafeAvatarUrl(u.avatar, u.username)} alt={u.displayName} fill className="object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">@{u.username}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center space-x-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={!editContent.trim()}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold active:scale-95 transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line pl-8.5">
                    {renderFormattedContent(comment.content)}
                  </div>
                )}

                {/* Like, Reply and Edit Action buttons */}
                {!isEditing && (
                  <div className="pl-8.5 flex items-center space-x-4 pt-1">
                    {/* Like button */}
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`inline-flex items-center space-x-1 text-xs font-medium transition-colors ${
                        comment.isLiked
                          ? "text-rose-600 dark:text-rose-400 font-semibold"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                      }`}
                      title={comment.isLiked ? "Unlike comment" : "Like comment"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-current text-rose-500" : ""}`} />
                      {(comment.likesCount || 0) > 0 && <span>{comment.likesCount}</span>}
                    </button>

                    {/* Reply button */}
                    {isLoggedIn ? (
                      <button
                        onClick={() => {
                          if (replyParentId === comment.id) {
                            setReplyParentId(null);
                          } else {
                            handleStartReply(comment.id, username, author);
                          }
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center space-x-1"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Reply {username ? `@${username}` : ""}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push("/login")}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium inline-flex items-center space-x-1"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    )}

                    {/* Edit button */}
                    {userCanEdit && (
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium inline-flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Reply Input Form */}
                {replyParentId === comment.id && (
                  <form onSubmit={(e) => handleSubmit(e, comment.id)} className="pl-8.5 pt-2 space-y-2 relative">
                    <div className="relative">
                      <textarea
                        ref={replyInputRef}
                        value={replyContent}
                        onChange={(e) => handleInputChange(e.target.value, "reply", e.target)}
                        placeholder="Write a reply... (type @ to tag someone)"
                        className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none min-h-[75px]"
                      />

                      {/* Mention Suggestions Dropdown for Reply */}
                      {activeInput === "reply" && mentionSuggestions.length > 0 && (
                        <div className="absolute left-2 bottom-full mb-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                          <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50">
                            Tag a reader
                          </p>
                          {mentionSuggestions.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => insertMention(u)}
                              className="flex items-center space-x-2.5 w-full px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                            >
                              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                <Image
                                  src={getSafeAvatarUrl(u.avatar, u.username)}
                                  alt={u.displayName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{u.displayName}</p>
                                <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400">@{u.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyParentId(null);
                          setMentionQuery(null);
                        }}
                        className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !replyContent.trim()}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold active:scale-95 transition-colors"
                      >
                        Send Reply
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
                      const isRepEditing = editingCommentId === reply.id;
                      const repCanEdit = canEdit(reply);
                      const isRepEdited = reply.updatedAt && new Date(reply.updatedAt).getTime() - new Date(reply.createdAt).getTime() > 1000;

                      return (
                        <div key={reply.id} className="space-y-1.5 bg-zinc-50/80 dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/60">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-2">
                              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                                <Image src={getSafeAvatarUrl(repAvatar, repUsername || repAuthor)} alt={repAuthor} fill className="object-cover" />
                              </div>
                              {repUsername ? (
                                <Link href={`/${repUsername}`} className="font-bold text-zinc-950 dark:text-zinc-50 hover:underline">
                                  {repAuthor} <span className="font-mono text-zinc-600 dark:text-zinc-400 font-medium">@{repUsername}</span>
                                </Link>
                              ) : (
                                <span className="font-bold text-zinc-950 dark:text-zinc-50">{repAuthor}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-400">
                              <span>{formatDate(reply.createdAt)}</span>
                              {isRepEdited && <span className="italic text-zinc-500 dark:text-zinc-400 text-[9px]">(edited)</span>}
                            </div>
                          </div>

                          {/* Reply Body or Edit Form */}
                          {isRepEditing ? (
                            <div className="pl-7 pt-1 space-y-2 relative">
                              <textarea
                                ref={editInputRef}
                                value={editContent}
                                onChange={(e) => handleInputChange(e.target.value, "edit", e.target)}
                                className="w-full p-2.5 rounded-lg bg-card border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-y min-h-[60px]"
                              />

                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center space-x-1 font-medium"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>

                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(reply.id)}
                                    disabled={!editContent.trim()}
                                    className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold active:scale-95 transition-colors"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed pl-7 whitespace-pre-line">
                                {renderFormattedContent(reply.content)}
                              </div>

                              {/* Actions for reply: Like and Edit */}
                              <div className="pl-7 pt-1 flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => handleLikeComment(reply.id)}
                                  className={`inline-flex items-center space-x-1 text-[11px] font-medium transition-colors ${
                                    reply.isLiked
                                      ? "text-rose-600 dark:text-rose-400 font-semibold"
                                      : "text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                                  }`}
                                  title={reply.isLiked ? "Unlike reply" : "Like reply"}
                                >
                                  <Heart className={`w-3 h-3 ${reply.isLiked ? "fill-current text-rose-500" : ""}`} />
                                  {(reply.likesCount || 0) > 0 && <span>{reply.likesCount}</span>}
                                </button>

                                {repCanEdit && (
                                  <button
                                    onClick={() => handleStartEdit(reply)}
                                    className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center space-x-1 transition-colors"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>Edit</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
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

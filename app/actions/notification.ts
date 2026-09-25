"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export interface Interactor {
  id?: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  type: "like" | "comment" | "bookmark";
  commentSnippet?: string;
  commentId?: string;
  createdAt: Date;
}

export interface AggregatedPostNotification {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  totalInteractions: number;
  latestTimestamp: Date;
  earliestTimestamp: Date;
  interactors: Interactor[];
  likedUsers: Interactor[];
  commenters: Interactor[];
  bookmarkers: Interactor[];
  sampleComments: { id: string; content: string; author: string; username: string; avatarUrl?: string | null; createdAt: Date }[];
}

export interface UserPersonalNotification {
  id: string;
  type: "COMMENT_REPLY" | "COMMENT_LIKE" | "MENTION" | "POST_LIKE" | "POST_BOOKMARK" | "POST_COMMENT";
  actor: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
  post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
  read: boolean;
  createdAt: Date;
}

/**
 * Dispatch notification with 30-second spam/rapid-click debouncing.
 * If the same actor interacts on the same target within 30 seconds, the existing notification is refreshed instead of creating duplicates.
 */
export async function dispatchNotification({
  userId,
  actorId,
  type,
  postId,
  commentId,
}: {
  userId: string;
  actorId: string;
  type: "COMMENT_REPLY" | "COMMENT_LIKE" | "MENTION" | "POST_LIKE" | "POST_BOOKMARK" | "POST_COMMENT";
  postId?: string | null;
  commentId?: string | null;
}) {
  if (!userId || !actorId || userId === actorId) return;

  try {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const existing = await db.notification.findFirst({
      where: {
        userId,
        actorId,
        type,
        postId: postId || null,
        commentId: commentId || null,
        createdAt: { gte: thirtySecondsAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      // Touch existing notification timestamp & ensure unread
      await db.notification.update({
        where: { id: existing.id },
        data: { createdAt: new Date(), read: false },
      });
    } else {
      await db.notification.create({
        data: {
          userId,
          actorId,
          type,
          postId: postId || null,
          commentId: commentId || null,
        },
      });
    }
  } catch (err) {
    console.warn("Failed to dispatch notification:", err);
  }
}

export async function getUserNotifications(): Promise<{
  personalNotifications: UserPersonalNotification[];
  adminAggregatedNotifications: AggregatedPostNotification[];
  totalUnreadCount: number;
  isAdmin: boolean;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      personalNotifications: [],
      adminAggregatedNotifications: [],
      totalUnreadCount: 0,
      isAdmin: false,
    };
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase();
  const isAdmin = (session.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  // 1. Fetch personal notifications from DB
  const rawPersonal = await db.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: { select: { displayName: true, username: true, avatarUrl: true } },
        },
      },
      post: {
        select: { id: true, title: true, slug: true },
      },
      comment: {
        select: { id: true, content: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const personalNotifications: UserPersonalNotification[] = rawPersonal.map((n) => {
    const actorName = n.actor.profile?.displayName || n.actor.name || "Reader";
    const actorUsername = n.actor.profile?.username || (n.actor.name ? n.actor.name.toLowerCase().replace(/\s+/g, "_") : "reader");
    const actorAvatar = n.actor.profile?.avatarUrl || n.actor.image;

    return {
      id: n.id,
      type: n.type as any,
      actor: {
        id: n.actor.id,
        name: actorName,
        username: actorUsername,
        avatarUrl: actorAvatar,
      },
      post: n.post,
      comment: n.comment ? { id: n.comment.id, content: n.comment.content.slice(0, 140) } : null,
      read: n.read,
      createdAt: n.createdAt,
    };
  });

  const unreadPersonalCount = personalNotifications.filter((n) => !n.read).length;

  // 2. If Admin, aggregate interactions per post cleanly
  let adminAggregatedNotifications: AggregatedPostNotification[] = [];

  if (isAdmin) {
    try {
      const [likes, bookmarks, comments] = await Promise.all([
        db.like.findMany({
          select: {
            postId: true,
            createdAt: true,
            post: { select: { id: true, title: true, slug: true } },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                profile: { select: { displayName: true, avatarUrl: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 60,
        }),
        db.bookmark.findMany({
          select: {
            postId: true,
            createdAt: true,
            post: { select: { id: true, title: true, slug: true } },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                profile: { select: { displayName: true, avatarUrl: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 60,
        }),
        db.comment.findMany({
          where: {
            status: { notIn: ["DELETED", "SPAM"] },
          },
          select: {
            id: true,
            postId: true,
            content: true,
            createdAt: true,
            post: { select: { id: true, title: true, slug: true } },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                profile: { select: { displayName: true, avatarUrl: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 60,
        }),
      ]);

      type RawEvent = {
        type: "like" | "comment" | "bookmark";
        postId: string;
        postTitle: string;
        postSlug: string;
        user: { id: string; name: string; username: string; avatarUrl?: string | null };
        commentSnippet?: string;
        commentId?: string;
        createdAt: Date;
      };

      const rawEvents: RawEvent[] = [];

      for (const l of likes) {
        if (!l.post) continue;
        const author = l.user.profile?.displayName || l.user.name || "Reader";
        const username = l.user.profile?.username || author.toLowerCase().replace(/\s+/g, "_");
        rawEvents.push({
          type: "like",
          postId: l.postId,
          postTitle: l.post.title,
          postSlug: l.post.slug,
          user: { id: l.user.id, name: author, username, avatarUrl: l.user.profile?.avatarUrl || l.user.image },
          createdAt: l.createdAt,
        });
      }

      for (const b of bookmarks) {
        if (!b.post) continue;
        const author = b.user.profile?.displayName || b.user.name || "Reader";
        const username = b.user.profile?.username || author.toLowerCase().replace(/\s+/g, "_");
        rawEvents.push({
          type: "bookmark",
          postId: b.postId,
          postTitle: b.post.title,
          postSlug: b.post.slug,
          user: { id: b.user.id, name: author, username, avatarUrl: b.user.profile?.avatarUrl || b.user.image },
          createdAt: b.createdAt,
        });
      }

      for (const c of comments) {
        if (!c.post) continue;
        const author = c.user.profile?.displayName || c.user.name || "Reader";
        const username = c.user.profile?.username || author.toLowerCase().replace(/\s+/g, "_");
        rawEvents.push({
          type: "comment",
          postId: c.postId,
          postTitle: c.post.title,
          postSlug: c.post.slug,
          user: { id: c.user.id, name: author, username, avatarUrl: c.user.profile?.avatarUrl || c.user.image },
          commentSnippet: c.content.slice(0, 140),
          commentId: c.id,
          createdAt: c.createdAt,
        });
      }

      rawEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Group per unique post
      const postMap = new Map<string, AggregatedPostNotification>();

      for (const event of rawEvents) {
        if (!postMap.has(event.postId)) {
          postMap.set(event.postId, {
            id: `post-${event.postId}`,
            postId: event.postId,
            postTitle: event.postTitle,
            postSlug: event.postSlug,
            likesCount: 0,
            commentsCount: 0,
            bookmarksCount: 0,
            totalInteractions: 0,
            latestTimestamp: event.createdAt,
            earliestTimestamp: event.createdAt,
            interactors: [],
            likedUsers: [],
            commenters: [],
            bookmarkers: [],
            sampleComments: [],
          });
        }

        const batch = postMap.get(event.postId)!;
        batch.totalInteractions += 1;

        if (event.createdAt.getTime() > batch.latestTimestamp.getTime()) {
          batch.latestTimestamp = event.createdAt;
        }

        const interactorObj: Interactor = {
          id: event.user.id,
          name: event.user.name,
          username: event.user.username,
          avatarUrl: event.user.avatarUrl,
          type: event.type,
          commentSnippet: event.commentSnippet,
          commentId: event.commentId,
          createdAt: event.createdAt,
        };

        if (event.type === "like") {
          batch.likesCount += 1;
          if (!batch.likedUsers.some((u) => u.username === event.user.username)) {
            batch.likedUsers.push(interactorObj);
          }
        } else if (event.type === "comment") {
          batch.commentsCount += 1;
          batch.commenters.push(interactorObj);
          if (event.commentSnippet && event.commentId && batch.sampleComments.length < 5) {
            batch.sampleComments.push({
              id: event.commentId,
              content: event.commentSnippet,
              author: event.user.name,
              username: event.user.username,
              avatarUrl: event.user.avatarUrl,
              createdAt: event.createdAt,
            });
          }
        } else if (event.type === "bookmark") {
          batch.bookmarksCount += 1;
          if (!batch.bookmarkers.some((u) => u.username === event.user.username)) {
            batch.bookmarkers.push(interactorObj);
          }
        }

        if (!batch.interactors.some((u) => u.username === event.user.username && u.type === event.type)) {
          batch.interactors.push(interactorObj);
        }
      }

      adminAggregatedNotifications = Array.from(postMap.values()).sort(
        (a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime()
      );
    } catch (e) {
      console.warn("Failed to aggregate admin notifications:", e);
    }
  }

  const totalUnreadCount = unreadPersonalCount + (isAdmin ? adminAggregatedNotifications.length : 0);

  return {
    personalNotifications,
    adminAggregatedNotifications,
    totalUnreadCount,
    isAdmin,
  };
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await db.notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { read: true },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.notification.deleteMany({
      where: { id: notificationId, userId: session.user.id },
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteSelectedNotifications(notificationIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!notificationIds || notificationIds.length === 0) return { success: true };

  try {
    await db.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete selected notifications" };
  }
}

export async function deleteAllNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.notification.deleteMany({
      where: { userId: session.user.id },
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete all notifications" };
  }
}

// Backward compatibility helper
export async function getAggregatedNotifications() {
  const res = await getUserNotifications();
  return {
    notifications: res.adminAggregatedNotifications,
    totalUnreadCount: res.adminAggregatedNotifications.length,
    totalInteractionsCount: res.adminAggregatedNotifications.reduce((acc, n) => acc + n.totalInteractions, 0),
  };
}

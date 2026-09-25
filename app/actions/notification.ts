"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export interface Interactor {
  name: string;
  username: string;
  avatarUrl?: string | null;
  type: "like" | "comment" | "bookmark";
  commentSnippet?: string;
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
  sampleComments: { id: string; content: string; author: string; createdAt: Date }[];
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
    take: 30,
  });

  const personalNotifications: UserPersonalNotification[] = rawPersonal.map((n) => {
    const actorName = n.actor.profile?.displayName || n.actor.name || "Reader";
    const actorUsername = n.actor.profile?.username || actorName.toLowerCase().replace(/\s+/g, "_");
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
      comment: n.comment ? { id: n.comment.id, content: n.comment.content.slice(0, 120) } : null,
      read: n.read,
      createdAt: n.createdAt,
    };
  });

  const unreadPersonalCount = personalNotifications.filter((n) => !n.read).length;

  // 2. If Admin, also aggregate interactions across all publications
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
                name: true,
                image: true,
                profile: { select: { displayName: true, avatarUrl: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 40,
        }),
        db.bookmark.findMany({
          select: {
            postId: true,
            createdAt: true,
            post: { select: { id: true, title: true, slug: true } },
            user: {
              select: {
                name: true,
                image: true,
                profile: { select: { displayName: true, avatarUrl: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 40,
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
                name: true,
                image: true,
                profile: { select: { displayName: true, avatarUrl: true, username: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 40,
        }),
      ]);

      interface RawEvent {
        type: "like" | "comment" | "bookmark";
        postId: string;
        postTitle: string;
        postSlug: string;
        user: { name: string; username: string; avatarUrl?: string | null };
        commentSnippet?: string;
        commentId?: string;
        createdAt: Date;
      }

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
          user: { name: author, username, avatarUrl: l.user.profile?.avatarUrl || l.user.image },
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
          user: { name: author, username, avatarUrl: b.user.profile?.avatarUrl || b.user.image },
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
          user: { name: author, username, avatarUrl: c.user.profile?.avatarUrl || c.user.image },
          commentSnippet: c.content.slice(0, 120),
          commentId: c.id,
          createdAt: c.createdAt,
        });
      }

      rawEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const BATCH_GAP_MS = 48 * 60 * 60 * 1000;
      const aggregatedMap = new Map<string, AggregatedPostNotification>();

      for (const event of rawEvents) {
        let matchingKey: string | null = null;
        for (const [key, batch] of aggregatedMap.entries()) {
          if (batch.postId === event.postId) {
            const timeDiff = Math.abs(batch.earliestTimestamp.getTime() - event.createdAt.getTime());
            if (timeDiff <= BATCH_GAP_MS) {
              matchingKey = key;
              break;
            }
          }
        }

        if (!matchingKey) {
          const key = `${event.postId}-${event.createdAt.getTime()}`;
          aggregatedMap.set(key, {
            id: key,
            postId: event.postId,
            postTitle: event.postTitle,
            postSlug: event.postSlug,
            likesCount: event.type === "like" ? 1 : 0,
            commentsCount: event.type === "comment" ? 1 : 0,
            bookmarksCount: event.type === "bookmark" ? 1 : 0,
            totalInteractions: 1,
            latestTimestamp: event.createdAt,
            earliestTimestamp: event.createdAt,
            interactors: [
              {
                name: event.user.name,
                username: event.user.username,
                avatarUrl: event.user.avatarUrl,
                type: event.type,
                commentSnippet: event.commentSnippet,
                createdAt: event.createdAt,
              },
            ],
            sampleComments:
              event.type === "comment" && event.commentSnippet && event.commentId
                ? [
                    {
                      id: event.commentId,
                      content: event.commentSnippet,
                      author: event.user.name,
                      createdAt: event.createdAt,
                    },
                  ]
                : [],
          });
        } else {
          const batch = aggregatedMap.get(matchingKey)!;
          if (event.type === "like") batch.likesCount += 1;
          if (event.type === "comment") batch.commentsCount += 1;
          if (event.type === "bookmark") batch.bookmarksCount += 1;
          batch.totalInteractions += 1;

          if (event.createdAt.getTime() > batch.latestTimestamp.getTime()) {
            batch.latestTimestamp = event.createdAt;
          }
          if (event.createdAt.getTime() < batch.earliestTimestamp.getTime()) {
            batch.earliestTimestamp = event.createdAt;
          }

          const exists = batch.interactors.some(
            (i) => i.username === event.user.username && i.type === event.type
          );
          if (!exists && batch.interactors.length < 10) {
            batch.interactors.push({
              name: event.user.name,
              username: event.user.username,
              avatarUrl: event.user.avatarUrl,
              type: event.type,
              commentSnippet: event.commentSnippet,
              createdAt: event.createdAt,
            });
          }

          if (
            event.type === "comment" &&
            event.commentSnippet &&
            event.commentId &&
            batch.sampleComments.length < 4
          ) {
            batch.sampleComments.push({
              id: event.commentId,
              content: event.commentSnippet,
              author: event.user.name,
              createdAt: event.createdAt,
            });
          }
        }
      }

      adminAggregatedNotifications = Array.from(aggregatedMap.values()).sort(
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

// Backward compatibility helper
export async function getAggregatedNotifications() {
  const res = await getUserNotifications();
  return {
    notifications: res.adminAggregatedNotifications,
    totalUnreadCount: res.adminAggregatedNotifications.length,
    totalInteractionsCount: res.adminAggregatedNotifications.reduce((acc, n) => acc + n.totalInteractions, 0),
  };
}

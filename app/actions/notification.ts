"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";

export interface Interactor {
  name: string;
  username: string;
  avatarUrl?: string | null;
  type: "like" | "comment" | "bookmark";
  commentSnippet?: string;
  createdAt: Date;
}

export interface AggregatedPostNotification {
  id: string; // unique batch key e.g. postId + latestDate
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

export async function getAggregatedNotifications(): Promise<{
  notifications: AggregatedPostNotification[];
  totalUnreadCount: number;
  totalInteractionsCount: number;
}> {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user || !isAdmin) {
    return { notifications: [], totalUnreadCount: 0, totalInteractionsCount: 0 };
  }

  // Fetch recent likes, bookmarks, and comments across all published/existing posts
  const [likes, bookmarks, comments] = await Promise.all([
    db.like.findMany({
      include: {
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
      take: 150,
    }),
    db.bookmark.findMany({
      include: {
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
      take: 150,
    }),
    db.comment.findMany({
      where: {
        status: { notIn: ["DELETED", "SPAM"] },
      },
      include: {
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
      take: 150,
    }),
  ]);

  // Combine raw events
  interface RawEvent {
    type: "like" | "comment" | "bookmark";
    postId: string;
    postTitle: string;
    postSlug: string;
    user: {
      name: string;
      username: string;
      avatarUrl?: string | null;
    };
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
      user: {
        name: author,
        username,
        avatarUrl: l.user.profile?.avatarUrl || l.user.image,
      },
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
      user: {
        name: author,
        username,
        avatarUrl: b.user.profile?.avatarUrl || b.user.image,
      },
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
      user: {
        name: author,
        username,
        avatarUrl: c.user.profile?.avatarUrl || c.user.image,
      },
      commentSnippet: c.content.slice(0, 120),
      commentId: c.id,
      createdAt: c.createdAt,
    });
  }

  // Sort all events by date descending
  rawEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Group events by Post and Activity Session
  // If an interaction on the same post is separated by > 48 hours, it creates a new notification batch
  const BATCH_GAP_MS = 48 * 60 * 60 * 1000;
  const aggregatedMap = new Map<string, AggregatedPostNotification>();

  for (const event of rawEvents) {
    // Find if there's an existing batch for this post within BATCH_GAP_MS
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

      // Add interactor if not already present with same type
      const exists = batch.interactors.some(
        (i) => i.username === event.user.username && i.type === event.type
      );
      if (!exists && batch.interactors.length < 15) {
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
        batch.sampleComments.length < 5
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

  const notifications = Array.from(aggregatedMap.values()).sort(
    (a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime()
  );

  const totalInteractionsCount = rawEvents.length;

  return {
    notifications,
    totalUnreadCount: notifications.length,
    totalInteractionsCount,
  };
}

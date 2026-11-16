"use client";

import Link from "next/link";
import { Edit3 } from "lucide-react";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "./DeletePostButton";

interface ArticleAdminControlsProps {
  postId: string;
  postTitle: string;
  section: string;
}

export function ArticleAdminControls({
  postId,
  postTitle,
  section,
}: ArticleAdminControlsProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin =
    (session?.user as any)?.role === "ADMIN" ||
    userEmail === "prasoon7pathak@gmail.com";

  if (!isAdmin) return null;

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`/studio/posts/${postId}/edit`}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Edit Dispatch</span>
      </Link>
      <DeletePostButton
        postId={postId}
        postTitle={postTitle}
        redirectTo={`/${section}`}
        variant="button"
      />
    </div>
  );
}

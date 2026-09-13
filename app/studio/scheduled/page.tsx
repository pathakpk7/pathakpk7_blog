import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Clock, Edit3, PlusCircle, Calendar } from "lucide-react";
import { DeletePostButton } from "@/components/article/DeletePostButton";

export default async function StudioScheduledPage() {
  const scheduledPosts = await db.post.findMany({
    where: {
      status: "SCHEDULED",
    },
    orderBy: { scheduledAt: "asc" },
    include: { author: { include: { profile: true } } },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif-editorial text-white">Scheduled Publications</h1>
          <p className="text-xs text-zinc-400">
            {scheduledPosts.length === 0
              ? "No articles currently queued for scheduled publication."
              : `${scheduledPosts.length} article(s) queued for scheduled release.`}
          </p>
        </div>
        <Link
          href="/studio/posts/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        {scheduledPosts.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No Scheduled Posts</h3>
              <p className="text-xs text-zinc-400">
                When you set a publication status to SCHEDULED with a future date, it will appear here.
              </p>
            </div>
            <Link
              href="/studio/posts/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Draft</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-4 py-4">Section</th>
                  <th className="px-4 py-4">Scheduled Date</th>
                  <th className="px-4 py-4">Last Modified</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {scheduledPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white max-w-xs sm:max-w-md truncate">
                      <span className="font-serif-editorial text-sm font-semibold">{post.title}</span>
                    </td>
                    <td className="px-4 py-4 uppercase font-mono text-[10px] text-zinc-400">{post.section}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{post.scheduledAt ? formatDate(post.scheduledAt) : "Pending Date"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">{formatDate(post.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/studio/posts/${post.id}/edit`}
                          className="inline-flex items-center space-x-1 p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white"
                          title="Edit scheduled article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                          variant="icon"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

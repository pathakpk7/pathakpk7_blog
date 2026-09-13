import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Edit3, ExternalLink } from "lucide-react";
import { DeletePostButton } from "@/components/article/DeletePostButton";

interface StudioPostsPageProps {
  searchParams?: Promise<{ type?: string; status?: string }>;
}

export default async function StudioPostsPage({ searchParams }: StudioPostsPageProps) {
  const resolvedSearchParams = await searchParams;
  const typeFilter = resolvedSearchParams?.type?.toUpperCase();
  const statusFilter = resolvedSearchParams?.status?.toUpperCase();

  const whereClause: any = {};
  if (typeFilter && typeFilter !== "ALL") {
    whereClause.contentType = typeFilter;
  }
  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  const [posts, allPosts] = await Promise.all([
    db.post.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      include: { author: { include: { profile: true } } },
    }),
    db.post.findMany({
      select: { contentType: true, status: true },
    }),
  ]);

  const uniqueTypes = ["ALL", ...Array.from(new Set(allPosts.map((p) => p.contentType)))];
  const uniqueStatuses = ["ALL", "PUBLISHED", "DRAFT", "SCHEDULED", "REVIEW"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif-editorial text-white">All Publications</h1>
          <p className="text-xs text-zinc-400">Total {posts.length} publications {typeFilter && typeFilter !== "ALL" ? `filtered by ${typeFilter}` : ""} across draft, review, scheduled, and published states.</p>
        </div>
        <Link
          href="/studio/posts/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mr-1">Content Type:</span>
          {uniqueTypes.map((t) => {
            const isActive = (!typeFilter && t === "ALL") || typeFilter === t;
            return (
              <Link
                key={t}
                href={t === "ALL" ? "/studio/posts" : `/studio/posts?type=${t.toLowerCase()}${statusFilter ? `&status=${statusFilter.toLowerCase()}` : ""}`}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {t}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-4 py-4">Section</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                    No publications match the current filter.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white max-w-xs sm:max-w-md truncate">
                      <span className="font-serif-editorial text-sm font-semibold">{post.title}</span>
                    </td>
                    <td className="px-4 py-4 uppercase font-mono text-[10px] text-zinc-400">{post.section}</td>
                    <td className="px-4 py-4 text-zinc-400 font-mono text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${post.contentType === "QUOTE" ? "bg-amber-950/60 text-amber-400 border border-amber-800/60" : "bg-zinc-800 text-zinc-300"}`}>
                        {post.contentType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        post.status === "PUBLISHED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                        post.status === "DRAFT" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                        "bg-blue-950 text-blue-400 border border-blue-800"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">{formatDate(post.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {post.status === "PUBLISHED" && (
                          <Link
                            href={`/article/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="View public article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/studio/posts/${post.id}/edit`}
                          className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white"
                          title="Edit article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                          variant="icon"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

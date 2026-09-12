"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Tag as TagIcon,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Hash,
  Layers,
  FileText,
  Sparkles,
} from "lucide-react";
import { createTag, updateTag, deleteTag } from "@/app/actions/tag";
import { formatDate } from "@/lib/utils";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  _count: {
    posts: number;
  };
}

interface TagsManagerProps {
  initialTags: TagItem[];
}

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "used" | "unused">("all");

  // Create Tag Form State
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Edit Tag State
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Tag State
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-fill slug when typing new tag name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewTagName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setNewTagSlug(autoSlug);
    setCreateError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsCreating(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const res = await createTag({
        name: newTagName.trim(),
        slug: newTagSlug.trim() || undefined,
      });

      if (res.success && res.tag) {
        const created: TagItem = {
          ...res.tag,
          _count: { posts: 0 },
        };
        setTags((prev) => [created, ...prev]);
        setNewTagName("");
        setNewTagSlug("");
        setCreateSuccess(`Tag "${created.name}" created successfully!`);
        setTimeout(() => setCreateSuccess(""), 3500);
      } else {
        setCreateError(res.error || "Failed to create tag.");
      }
    } catch (err: any) {
      setCreateError(err.message || "An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (tag: TagItem) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setEditName("");
    setEditSlug("");
    setEditError("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    setEditError("");

    try {
      const res = await updateTag({
        id,
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
      });

      if (res.success && res.tag) {
        setTags((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, name: res.tag!.name, slug: res.tag!.slug }
              : t
          )
        );
        setEditingTagId(null);
      } else {
        setEditError(res.error || "Failed to update tag.");
      }
    } catch (err: any) {
      setEditError(err.message || "Error updating tag.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (tag: TagItem) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"? It will be safely unlinked from ${tag._count.posts} article(s).`)) {
      return;
    }

    setDeletingTagId(tag.id);
    setIsDeleting(true);

    try {
      const res = await deleteTag(tag.id);
      if (res.success) {
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
      } else {
        alert(res.error || "Failed to delete tag.");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting tag.");
    } finally {
      setIsDeleting(false);
      setDeletingTagId(null);
    }
  };

  // Filtered tags
  const filteredTags = tags.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (filterType === "used") return t._count.posts > 0;
    if (filterType === "unused") return t._count.posts === 0;
    return true;
  });

  const totalUsedTags = tags.filter((t) => t._count.posts > 0).length;
  const totalUnusedTags = tags.filter((t) => t._count.posts === 0).length;
  const totalTaggedPosts = tags.reduce((acc, t) => acc + t._count.posts, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold font-serif-editorial text-white">Tags & Taxonomy</h1>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Studio
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Organize content across tech, science, coding, and creative themes with searchable tags.
          </p>
        </div>

        <Link
          href="/studio/posts/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write Article</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Total Tags</span>
            <TagIcon className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{tags.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">In Use</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{totalUsedTags}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Unused Tags</span>
            <Hash className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{totalUnusedTags}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Total Tag Links</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{totalTaggedPosts}</p>
        </div>
      </div>

      {/* Create New Tag Box */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Create New Tag</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-mono uppercase font-semibold text-zinc-400">
                Tag Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={handleNameChange}
                placeholder="e.g. Next.js, Quantum Computing, Ghazal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-mono uppercase font-semibold text-zinc-400">
                Slug (URL Identifier)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-600 font-mono text-sm">#</span>
                <input
                  type="text"
                  value={newTagSlug}
                  onChange={(e) => setNewTagSlug(e.target.value)}
                  placeholder="nextjs"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isCreating || !newTagName.trim()}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition-colors active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isCreating ? "Adding..." : "Add Tag"}</span>
              </button>
            </div>
          </div>

          {createError && (
            <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-950/40 p-3 rounded-xl border border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {createSuccess && (
            <div className="flex items-center space-x-2 text-emerald-400 text-xs bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/50">
              <Check className="w-4 h-4 shrink-0" />
              <span>{createSuccess}</span>
            </div>
          )}
        </form>
      </div>

      {/* Tags Directory Table & Search Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags by name or slug..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({tags.length})
            </button>
            <button
              onClick={() => setFilterType("used")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "used" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              In Use ({totalUsedTags})
            </button>
            <button
              onClick={() => setFilterType("unused")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "unused" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Unused ({totalUnusedTags})
            </button>
          </div>
        </div>

        {/* Tags Table */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Tag Name</th>
                  <th className="px-4 py-4">Slug Identifier</th>
                  <th className="px-4 py-4">Articles Count</th>
                  <th className="px-4 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                      No tags found matching &ldquo;{searchQuery}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => {
                    const isEditing = editingTagId === tag.id;

                    return (
                      <tr key={tag.id} className="hover:bg-zinc-800/40 transition-colors">
                        {/* Tag Name */}
                        <td className="px-6 py-4 font-medium text-white">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-blue-500 text-xs text-white focus:outline-none w-full max-w-xs"
                                placeholder="Tag Name"
                                autoFocus
                              />
                              {editError && <p className="text-[10px] text-rose-400">{editError}</p>}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                <TagIcon className="w-3 h-3 mr-1.5 opacity-70" />
                                {tag.name}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-blue-500 text-xs text-white font-mono focus:outline-none w-full max-w-xs"
                              placeholder="slug"
                            />
                          ) : (
                            <span className="font-mono text-zinc-400 text-[11px] bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                              #{tag.slug}
                            </span>
                          )}
                        </td>

                        {/* Articles Count */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                              tag._count.posts > 0
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                                : "bg-zinc-800 text-zinc-500 border border-zinc-700/40"
                            }`}
                          >
                            {tag._count.posts} {tag._count.posts === 1 ? "article" : "articles"}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4 text-zinc-400">{formatDate(tag.createdAt)}</td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(tag.id)}
                                  disabled={isUpdating || !editName.trim()}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                  title="Save changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(tag)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                  title="Edit tag name & slug"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(tag)}
                                  disabled={isDeleting && deletingTagId === tag.id}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                                  title="Delete tag"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { savePost } from "@/app/actions/post";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Save,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface PostEditorProps {
  initialPost?: {
    id?: string;
    title: string;
    slug: string;
    subtitle?: string | null;
    excerpt?: string | null;
    content: string;
    section: string;
    contentType: string;
    status: "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
    coverImageUrl?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    featured?: boolean;
    scheduledAt?: Date | string | null;
  };
}

export function PostEditor({ initialPost }: PostEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [section, setSection] = useState(initialPost?.section || "technology");
  const [contentType, setContentType] = useState(initialPost?.contentType || "ARTICLE");
  const [status, setStatus] = useState<any>(initialPost?.status || "DRAFT");
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl || "");
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription || "");
  const [featured, setFeatured] = useState(initialPost?.featured || false);
  const [content, setContent] = useState(initialPost?.content || "");

  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");

  // Auto slugify title if new post
  useEffect(() => {
    if (!initialPost?.slug && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      );
    }
  }, [title, initialPost?.slug]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      Placeholder.configure({ placeholder: "Write your article, poem, or technical walkthrough here..." }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      setSaveState("unsaved");
    },
  });

  const handleSave = async (targetStatus?: any) => {
    setSaving(true);
    setSaveState("saving");

    try {
      const finalStatus = targetStatus || status;
      const res = await savePost({
        id: initialPost?.id,
        title,
        slug,
        subtitle,
        excerpt,
        content,
        section,
        contentType,
        status: finalStatus,
        coverImageUrl,
        seoTitle,
        seoDescription,
        featured,
      });

      if (res.success) {
        setSaveState("saved");
        setStatus(finalStatus);
        router.push("/studio/posts");
        router.refresh();
      }
    } catch (err) {
      console.error("Save post error:", err);
      setSaveState("unsaved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-30 pt-2">
        <div className="flex items-center space-x-3">
          <Link href="/studio/posts" className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif-editorial text-white">
              {initialPost?.id ? "Edit Article" : "Create New Publication"}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
              <span>Status: {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Unsaved changes"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreview ? "Edit Mode" : "Live Preview"}</span>
          </button>
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving || !title}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving || !title}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveState("unsaved");
          }}
          placeholder="Article Title..."
          className="w-full bg-transparent text-3xl sm:text-5xl font-serif-editorial font-bold text-white placeholder:text-zinc-600 focus:outline-none"
        />

        {/* Subtitle */}
        <input
          type="text"
          value={subtitle}
          onChange={(e) => {
            setSubtitle(e.target.value);
            setSaveState("unsaved");
          }}
          placeholder="Subtitle or main deck idea..."
          className="w-full bg-transparent text-lg text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
        />

        {/* Meta Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold uppercase font-mono text-[10px]">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
            >
              <option value="technology">Technology & AI</option>
              <option value="science">Science & Space</option>
              <option value="coding">Coding & Walkthroughs</option>
              <option value="ideas">Ideas & Essays</option>
              <option value="creative">Creative & Poems</option>
              <option value="notes">Notes & Musings</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold uppercase font-mono text-[10px]">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
            >
              <option value="ARTICLE">ARTICLE</option>
              <option value="ESSAY">ESSAY</option>
              <option value="TUTORIAL">TUTORIAL</option>
              <option value="NOTE">NOTE</option>
              <option value="POEM">POEM</option>
              <option value="SHAYARI">SHAYARI</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold uppercase font-mono text-[10px]">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-semibold font-mono uppercase">Cover Image URL</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-semibold font-mono uppercase">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary for homepage cards and social shares..."
            className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none h-20"
          />
        </div>

        {/* Tiptap Toolbar & Editor Body */}
        {!isPreview ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            {/* Toolbar */}
            {editor && (
              <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-950">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor.isActive("bold") ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor.isActive("italic") ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`p-2 rounded ${editor.isActive("codeBlock") ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
                >
                  <Quote className="w-4 h-4" />
                </button>
              </div>
            )}
            <EditorContent editor={editor} className="p-6 min-h-[350px] text-zinc-100 text-base leading-relaxed focus:outline-none" />
          </div>
        ) : (
          /* Live Preview Mode */
          <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
            <h1 className="font-serif-editorial text-4xl font-bold">{title || "Untitled Article"}</h1>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
            <div className="prose prose-zinc dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </div>
  );
}

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
  FileCode,
  Undo,
  Redo,
  Minus,
  Edit3,
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

  const [editorMode, setEditorMode] = useState<"visual" | "html" | "preview">("visual");
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

  // Keep editor content synchronized when switching modes
  const handleModeChange = (newMode: "visual" | "html" | "preview") => {
    if (newMode === "visual" && editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
    setEditorMode(newMode);
  };

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
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-20">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 border-b border-zinc-800 pb-4 sticky top-0 bg-zinc-950/95 backdrop-blur-md z-30 pt-2">
        <div className="flex items-center space-x-3">
          <Link href="/studio/posts" className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold font-serif-editorial text-white truncate">
              {initialPost?.id ? "Edit Article" : "Create New Publication"}
            </h1>
            <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-zinc-400 font-mono">
              <span>Status: {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Unsaved changes"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 sm:p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeChange("visual")}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                editorMode === "visual"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Visual WYSIWYG Editor Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("html")}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                editorMode === "html"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Paste or edit raw HTML source code"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("preview")}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                editorMode === "preview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Full typography live preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSave("DRAFT")}
              disabled={saving || !title}
              className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold disabled:opacity-50 transition-colors"
              title="Save as draft (will not appear on public site)"
            >
              Draft
            </button>
            <button
              onClick={() => handleSave("PUBLISHED")}
              disabled={saving || !title}
              className="px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-colors active:scale-95"
              title="Publish article live immediately"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
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

        {/* Content Section: Visual Editor / HTML Code Mode / Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="font-semibold uppercase tracking-wider font-mono text-[11px] text-zinc-300">
                Article Content
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-[11px]">
                {editorMode === "visual" && "Visual Rich-Text Editor"}
                {editorMode === "html" && "HTML Source Code Mode (Paste or edit raw HTML)"}
                {editorMode === "preview" && "Live Article Preview"}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handleModeChange(editorMode === "html" ? "visual" : "html")}
                className="text-xs font-mono text-blue-400 hover:text-blue-300 underline inline-flex items-center space-x-1"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{editorMode === "html" ? "Switch to Visual Editor" : "Paste Raw HTML Code"}</span>
              </button>
            </div>
          </div>

          {/* VISUAL EDITOR MODE */}
          {editorMode === "visual" && (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              {/* Comprehensive Toolbar with Native Hover Tooltips */}
              {editor && (
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-950">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("bold") ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Bold (Ctrl+B) — Makes selected text bold"
                    aria-label="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("italic") ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Italic (Ctrl+I) — Slants selected text"
                    aria-label="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Heading 1 — Main section headline (<h1>)"
                    aria-label="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Heading 2 — Sub-section headline (<h2>)"
                    aria-label="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Heading 3 — Minor sub-headline (<h3>)"
                    aria-label="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("blockquote") ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Blockquote — Editorial quote block with border (<blockquote>)"
                    aria-label="Blockquote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("bulletList") ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Bullet List — Unordered bullet list (<ul>)"
                    aria-label="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("orderedList") ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Numbered List — Ordered numerical list (<ol>)"
                    aria-label="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("codeBlock") ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
                    title="Code Block — Multi-line syntax formatted code block (<pre><code>)"
                    aria-label="Code Block"
                  >
                    <Code className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-2 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    title="Divider — Horizontal separating line (<hr>)"
                    aria-label="Divider"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 transition-colors"
                    title="Undo (Ctrl+Z)"
                    aria-label="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 transition-colors"
                    title="Redo (Ctrl+Y)"
                    aria-label="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </button>

                  <div className="ml-auto flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleModeChange("html")}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                      title="Switch to Raw HTML Code editor to paste HTML directly"
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                      <span>&lt;HTML /&gt;</span>
                    </button>
                  </div>
                </div>
              )}
              <EditorContent editor={editor} className="p-6 min-h-[380px] text-zinc-100 text-base leading-relaxed focus:outline-none" />
            </div>
          )}

          {/* RAW HTML CODE EDITOR MODE */}
          {editorMode === "html" && (
            <div className="rounded-2xl bg-zinc-950 border border-blue-500/40 overflow-hidden shadow-lg">
              <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/90 text-xs">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-zinc-200 font-mono">Raw HTML Code Editor</span>
                  <span className="text-zinc-500">• Paste your HTML code directly here</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange("visual")}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                  >
                    Sync to Visual Editor
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setSaveState("unsaved");
                }}
                placeholder="<p>Paste or write your full HTML code here...</p>&#10;<h2>Section Title</h2>&#10;<p>Content paragraph with <a href='https://...'>links</a> and <strong>bold text</strong>.</p>"
                className="w-full min-h-[420px] p-6 bg-zinc-950 text-emerald-300 font-mono text-sm leading-relaxed focus:outline-none resize-y selection:bg-blue-900"
                spellCheck={false}
              />
              <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Supports standard HTML tags: &lt;p&gt;, &lt;h1&gt;-&lt;h4&gt;, &lt;img&gt;, &lt;blockquote&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;table&gt;, &lt;pre&gt;&lt;code&gt;, etc.</span>
                <span>{content.length} characters</span>
              </div>
            </div>
          )}

          {/* LIVE PREVIEW MODE */}
          {editorMode === "preview" && (
            <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
              <div className="border-b border-border pb-4">
                <span className="text-xs uppercase font-mono tracking-widest text-blue-600 dark:text-blue-400 font-semibold">
                  Preview Mode
                </span>
                <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold mt-2 text-foreground">
                  {title || "Untitled Article"}
                </h1>
                {subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}
              </div>

              <div
                className="prose prose-zinc dark:prose-invert prose-editorial max-w-none"
                dangerouslySetInnerHTML={{ __html: content || "<p className='text-muted-foreground italic'>No content written yet.</p>" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

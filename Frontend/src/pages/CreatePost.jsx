import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { createPost, generateBlogContent } from "../services/post";

const DEFAULT_TAGS = [
  "python",
  "java",
  "javascript",
  "typescript",
  "csharp",
  "golang",
  "ruby",
  "php",
  "react",
  "vue",
  "angular",
  "tailwindcss",
  "bootstrap",
  "html",
  "css",
  "django",
  "flask",
  "spring",
  "express",
  "nestjs",
  "fastapi",
  "dotnet",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "devops",
  "ci/cd",
  "terraform",
  "machine learning",
  "deep learning",
  "nlp",
  "data science",
  "pandas",
  "numpy",
  "tensorflow",
  "pytorch",
  "database",
  "mysql",
  "postgresql",
  "mongodb",
  "redis",
  "sqlite",
  "android",
  "ios",
  "flutter",
  "react native",
  "web development",
  "mobile development",
  "full stack",
  "backend",
  "frontend",
  "agile",
  "scrum",
  "kanban",
  "project management",
  "software engineering",
  "design patterns",
  "clean code",
  "refactoring",
  "testing",
  "unit testing",
  "integration testing",
  "performance optimization",
  "scalability",
  "security",
  "authentication",
  "authorization",
  "git",
  "github",
  "vscode",
  "testing",
  "rest api",
  "graphql",
  "microservices",
  "security",
  "blockchain",
  "cryptocurrency",
  "web3",
  "smart contracts",
  "solidity",
  "ui/ux",
  "user experience",
  "user interface",
  "accessibility",
  "design thinking",
  "career development",
  "job search",
  "resume writing",
  "interview preparation",
  "networking",
  "open source",
  "community",
  "mentorship",
  "contribution",
  "collaboration",
  "life lessons",
  "productivity",
  "motivation",
  "inspiration",
  "personal growth",
  "career",
  "interview",
  "other",
];

// Deduplicate to avoid duplicate key warnings
const UNIQUE_TAGS = Array.from(new Set(DEFAULT_TAGS));

function QuillEditor({ value, onChange }) {
  const elRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || quillRef.current) return;
    quillRef.current = new Quill(elRef.current, {
      theme: "snow",
      placeholder: "Write your post content…",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "code-block"],
          ["clean"],
        ],
      },
    });
    // Larger default text + comfy spacing
    quillRef.current.root.style.minHeight = "300px";
    quillRef.current.root.style.padding = "16px 18px";
    quillRef.current.root.style.fontSize = "18px";
    quillRef.current.root.style.lineHeight = "1.75";
    if (value) quillRef.current.clipboard.dangerouslyPasteHTML(value);
    quillRef.current.on("text-change", () => {
      onChange?.(quillRef.current.root.innerHTML);
    });
  }, [value, onChange]);

  // keep external value in sync (when cleared)
  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const html = q.root.innerHTML;
    if (value != null && value !== html) {
      q.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return <div ref={elRef} />;
}

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagPick, setTagPick] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- AI Content Generator State ---
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiWordCount, setAiWordCount] = useState(300);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");

  const fileInputRef = useRef(null);

  const availableTags = useMemo(
    () => UNIQUE_TAGS.filter((t) => !selectedTags.includes(t)),
    [selectedTags],
  );

  const addTag = (t) => {
    if (!t) return;
    if (!selectedTags.includes(t)) setSelectedTags((prev) => [...prev, t]);
    setTagPick("");
  };
  const removeTag = (t) =>
    setSelectedTags((prev) => prev.filter((x) => x !== t));

  const onCoverChange = (e) => {
    const f = e.target.files?.[0];
    setCoverFile(f || null);
    setCoverPreview(f ? URL.createObjectURL(f) : "");
  };

  // nicer UX: clear current cover selection
  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!content || content === "<p><br></p>")
      return toast.error("Content is required");
    if (selectedTags.length === 0)
      return toast.error("Select at least one tag");

    setSubmitting(true);
    try {
      await createPost({
        title,
        content,
        tags: selectedTags,
        // isPublished: true, // uncomment only if your API requires it
        coverFile,
      });
      toast.success("Published successfully");
      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      const msg =
        body?.detail ||
        body?.non_field_errors?.[0] ||
        JSON.stringify(body) ||
        err?.message ||
        "Failed to publish";
      toast.error(`${msg}${status ? ` (HTTP ${status})` : ""}`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- AI Content Generator Logic ---
  const handleAIGenerate = async () => {
    setAiError("");
    if (!aiPrompt.trim()) return setAiError("Please enter a topic or prompt.");
    if (aiWordCount < 50 || aiWordCount > 1000)
      return setAiError("Word count must be between 50 and 1000.");
    setAiLoading(true);
    try {
      const result = await generateBlogContent({
        wordcount: aiWordCount,
        prompt_suggestion: aiPrompt,
      });
      setAiResult(result);
    } catch (e) {
      setAiError("Failed to generate content.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIApply = () => {
    setContent(aiResult);
    toast.success("AI content applied to editor");
  };

  return (
    <section className="relative w-full py-10 bg-white dark:bg-slate-900">
      <div className="relative max-w-4xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Create a Post
          </h1>
        </header>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Cover */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Cover (optional)
          </label>
          <div className="rounded-xl border-2 border-dotted border-teal-500 p-4 bg-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <input
                id="post-cover"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onCoverChange}
                className="hidden"
              />
              <label
                htmlFor="post-cover"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-sm hover:shadow transition"
              >
                <span className="inline-block">📁</span>
                <span>Choose image</span>
              </label>
              <div className="flex-1 min-w-[200px]">
                <div className="truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                  {coverFile?.name || "No file chosen"}
                </div>
              </div>
              {coverPreview && (
                <button
                  type="button"
                  onClick={clearCover}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            {coverPreview && (
              <div className="mt-3">
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="h-20 rounded-lg border border-slate-200/70"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tag selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-violet-700  hover:text-violet-900 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <select
              value={tagPick}
              onChange={(e) => addTag(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] px-3 py-2"
            >
              <option value="">Select a tag</option>
              {availableTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- AI Content Generator --- */}
        <div className="mb-8 rounded-xl border border-indigo-300 bg-indigo-50 p-5 shadow-sm">
          <h2 className="text-xl font-bold text-indigo-700 mb-1">
            Use Modern AI Post Content Generator to Browse Your Ideas
          </h2>
          <p className="text-slate-600 mb-4">
            Instantly create high-quality blog content with AI. Just enter your
            topic or prompt and desired word count. <br />
            <span className="italic text-indigo-500">
              Let AI help you turn your inspiration into a beautiful post!
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Enter your topic or prompt..."
              className="w-full sm:w-2/3 rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="number"
              value={aiWordCount}
              min={50}
              max={1000}
              onChange={(e) => setAiWordCount(Number(e.target.value))}
              className="w-full sm:w-1/3 rounded-md border border-gray-300 px-3 py-2"
              placeholder="Word count (50-1000)"
            />
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="inline-flex items-center rounded-lg px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white disabled:opacity-60"
            >
              {aiLoading ? "Generating…" : "Generate"}
            </button>
          </div>
          {aiError && (
            <div className="text-sm text-red-500 mb-2">{aiError}</div>
          )}
          {aiResult && (
            <div className="mt-2 border rounded p-3 bg-white">
              <div
                className="mb-2 text-slate-700 prose prose-indigo max-w-none"
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: aiResult }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAIApply}
                  className="btn btn-sm btn-primary"
                >
                  Apply to Editor
                </button>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="btn btn-sm"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- Content Editor --- */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Content
          </label>
          <div className="rounded-xl border border-slate-300/70 dark:border-white/10 bg-white">
            <QuillEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* --- Rest of the form (submit) --- */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Publishing…" : "Publish Post"}
          </button>
        </form>
      </div>
    </section>
  );
}

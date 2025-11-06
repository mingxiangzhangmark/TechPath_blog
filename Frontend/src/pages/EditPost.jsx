import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { getPostBySlug, updatePost } from "../services/post";

const ALL_TAGS = [
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
  "other",
];
const UNIQUE = Array.from(new Set(ALL_TAGS));

function QuillEditor({ value, onChange }) {
  const elRef = useRef(null);
  const quillRef = useRef(null);
  useEffect(() => {
    if (!elRef.current || quillRef.current) return;
    quillRef.current = new Quill(elRef.current, {
      theme: "snow",
      placeholder: "Edit your content…",
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
    quillRef.current.root.style.minHeight = "300px";
    quillRef.current.root.style.padding = "16px 18px";
    quillRef.current.root.style.fontSize = "18px";
    quillRef.current.root.style.lineHeight = "1.75";
    if (value) quillRef.current.clipboard.dangerouslyPasteHTML(value);
    quillRef.current.on("text-change", () =>
      onChange?.(quillRef.current.root.innerHTML),
    );
  }, []);
  useEffect(() => {
    const q = quillRef.current;
    if (q && value != null && value !== q.root.innerHTML)
      q.clipboard.dangerouslyPasteHTML(value);
  }, [value]);
  return <div ref={elRef} />;
}

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagPick, setTagPick] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug);
        setTitle(data.title || "");
        setContent(data.content || "");
        setSelectedTags(data.tags || []);
        setCoverPreview(data.cover || "");
      } catch (e) {
        toast.error("Failed to load post");
        navigate("/dashboard/posts", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, navigate]);

  const availableTags = useMemo(
    () => UNIQUE.filter((t) => !selectedTags.includes(t)),
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
    setCoverPreview(f ? URL.createObjectURL(f) : coverPreview);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!content || content === "<p><br></p>")
      return toast.error("Content is required");

    setSaving(true);
    try {
      await updatePost(slug, {
        title,
        content,
        tags: selectedTags,
        coverFile,
        is_published: true,
      });
      toast.success("Post updated");
      navigate("/dashboard/posts");
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err?.message || "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Post</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cover
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              id="edit-cover"
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              className="hidden"
            />
            <label
              htmlFor="edit-cover"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-sm hover:shadow"
            >
              📁 Choose image
            </label>
            <div className="flex-1 min-w-[200px]">
              <div className="truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                {coverFile?.name ||
                  (coverPreview ? "Current cover" : "No file chosen")}
              </div>
            </div>
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
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
                  className="cursor-pointer hover:text-violet-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <select
            value={tagPick}
            onChange={(e) => addTag(e.target.value)}
            className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">Select a tag</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Content
          </label>
          <div className="rounded-xl border border-slate-300 bg-white">
            <QuillEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer inline-flex items-center justify-center rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

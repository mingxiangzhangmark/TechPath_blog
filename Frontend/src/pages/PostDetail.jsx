import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "quill/dist/quill.snow.css";
import { getPostBySlug, likePost, unlikePost } from "../services/post";
import coverFallback from "/Blog_cover1.png";
import "../styles/post-content.css";
import CommentSection from "../components/CommentSection";
import { sanitizeHTML } from "../utils/xssProtection"; // Import sanitizeHTML function

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState("");

  // Add state for image source with fallback
  const [coverImage, setCoverImage] = useState(null);

  const authed = Boolean(localStorage.getItem("access"));

  const fetchPost = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPostBySlug(slug);
      setPost(data);
      // Initialize cover image source
      setCoverImage(data.cover || coverFallback);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404)
        setError("This post does not exist or may have been removed.");
      else if (e?.code === "ERR_NETWORK" || !navigator.onLine)
        setError("Network error. Please check your connection and try again.");
      else setError("Something went wrong while loading this post.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image error
  const handleImageError = () => {
    if (coverImage !== coverFallback) {
      setCoverImage(coverFallback);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleLike = async () => {
    if (!post || likeLoading) return;
    setLikeLoading(true);
    setLikeError("");
    try {
      if (!post.liked_by_user) {
        const res = await likePost(post.id);
        setPost((p) => ({
          ...p,
          likes_count: (p.likes_count ?? 0) + 1,
          liked_by_user: true,
          like_id: res.id,
        }));
      } else {
        if (!post.like_id) throw new Error("Missing like_id");
        await unlikePost(post.like_id);
        setPost((p) => ({
          ...p,
          likes_count: Math.max(0, (p.likes_count ?? 1) - 1),
          liked_by_user: false,
          like_id: null,
        }));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setLikeError("Failed to update like");
    } finally {
      setLikeLoading(false);
    }
  };

  // Estimate read time from plain text (200 wpm)
  const { createdStr, readMins } = useMemo(() => {
    const created = post?.created_at ? new Date(post.created_at) : null;
    const createdStr = created ? created.toLocaleDateString() : "";
    const html = post?.content || "";
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = text ? text.split(" ").length : 0;
    const readMins = Math.max(1, Math.ceil(words / 200));
    return { createdStr, readMins };
  }, [post?.created_at, post?.content]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading && (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div
              role="status"
              className="h-10 w-10 border-4 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-white rounded-full animate-spin"
              aria-label="Loading"
            />
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/40 p-8 text-center"
          >
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              We couldn't load this post
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{error}</p>
            <p className="mt-1 text-sm text-slate-500">Slug: {slug}</p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={fetchPost}
                className="cursor-pointer inline-flex items-center rounded-lg px-4 py-2 bg-slate-900 text-white hover:bg-slate-700"
              >
                Try again
              </button>
              <Link
                to="/"
                className="cursor-pointer inline-flex items-center rounded-lg px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Back to Home
              </Link>
              <Link
                to="/posts/new"
                className="cursor-pointer inline-flex items-center rounded-lg px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white"
              >
                Write a new post
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && post && (
          <div className="p-3 flex flex-col max-w-6xl mx-auto">
            <h1 className="text-3xl lg:text-4xl mt-4 p-3 text-center font-serif max-w-2xl mx-auto">
              {post.title}
            </h1>

            {/* Tags list */}
            {post.tags?.length > 0 && (
              <div className="self-center mt-3 flex flex-wrap justify-center gap-2">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/posts/search?tags=${encodeURIComponent(t)}`}
                    className="cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {/* Cover image with error handling */}
            <img
              src={coverImage}
              alt={post?.title || "Post cover"}
              className="mt-10 p-3 max-h-[600px] w-full object-cover rounded-2xl border border-slate-200 dark:border-white/10"
              onError={handleImageError}
            />

            {/* Meta: date + estimated reading time */}
            <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700 mx-auto w-full max-w-2xl text-xs text-slate-600 dark:text-slate-300">
              <span>{createdStr}</span>
              <span className="italic">{readMins} mins read</span>
              {/* Like button & count */}
              <span className="flex items-center gap-2 ml-2">
                <button
                  disabled={!authed || likeLoading}
                  onClick={handleLike}
                  className={`px-2 py-1 pr-2.5 rounded-full border transition
                    ${post.liked_by_user ? "bg-pink-500 text-white border-pink-500" : "bg-white text-pink-500 border-pink-300"}
                    ${!authed ? "opacity-60 cursor-not-allowed" : "hover:bg-pink-50"}
                  `}
                  title={
                    authed
                      ? post.liked_by_user
                        ? "Unlike"
                        : "Like"
                      : "Login to like"
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="inline-block align-middle mr-2"
                    fill={post.liked_by_user ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-6.716-4.867-9.428-7.579A5.333 5.333 0 0 1 9.514 6.98L12 9.466l2.486-2.486a5.333 5.333 0 0 1 6.942 7.441C18.716 16.133 12 21 12 21z" />
                  </svg>
                  <div className="inline-block align-middle text-sm">
                    {post.likes_count ?? 0}
                  </div>
                </button>
              </span>
            </div>
            {likeError && (
              <div className="text-xs text-red-500 mt-1">{likeError}</div>
            )}

            {/* Content */}
            <article
              className="p-3 max-w-2xl mx-auto w-full post-content leading-7"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
            />

            {/* Comments */}
            <div className="max-w-2xl mx-auto w-full mt-6">
              <CommentSection postId={post.id} />
            </div>

            {/* Simple back link */}
            <div className="mt-10 flex justify-center">
              <Link
                to="/"
                className="cursor-pointer inline-flex items-center rounded-lg px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

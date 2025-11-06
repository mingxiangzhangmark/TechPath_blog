import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import coverFallback from "/Blog_cover1.png";
import { listPosts, deletePost } from "../services/post";
import { toast } from "react-toastify";
import clsx from "clsx";

export default function AdminPosts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 12;

  // modal state for delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState({ slug: "", title: "" });

  // Handle image loading error
  const handleImageError = (slug) => {
    setImageErrors((prev) => ({
      ...prev,
      [slug]: true,
    }));
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
      setImageErrors({}); // Reset image errors when reloading

      // Use the search API to get all posts
      const params = {
        page,
        search: searchQuery,
      };

      const data = await listPosts(params);
      
      // Handle both array and paginated response formats
      setPosts(Array.isArray(data.results) ? data.results : data);
      setCount(data.count || (Array.isArray(data) ? data.length : 0));
    } catch (e) {
      setError("Failed to load posts. Please try again.");
      console.error("Error loading posts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Handle post deletion
  const handleDelete = async () => {
    if (!toDelete.slug || deleting) return;
    
    try {
      setDeleting(true);
      await deletePost(toDelete.slug);
      setPosts((prev) => prev.filter((x) => x.slug !== toDelete.slug));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post. Please try again.");
      console.error("Error deleting post:", error);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <section>
      {/* <header className="mb-6">
        <h2 className="text-2xl font-semibold">All Posts</h2>
        <p className="text-slate-500 mt-1">
          Manage all blog posts on the platform
        </p>
      </header> */}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            placeholder="Search posts..."
            className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
        </div>
        <button
          onClick={loadPosts}
          disabled={loading}
          className={clsx(
            "h-11 px-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-violet-400/40",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          <FiRefreshCw className={clsx(loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-pink-300 bg-pink-50 text-pink-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No posts found</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={
                      imageErrors[post.slug]
                        ? coverFallback
                        : post.cover || coverFallback
                    }
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(post.slug)}
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <time dateTime={post.created_at}>
                        {post.created_at
                          ? new Date(post.created_at).toLocaleDateString()
                          : ""}
                      </time>
                      
                    </div>
                    <span className="inline-flex items-center gap-1" title="Likes">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        className="text-pink-500 fill-current"
                      >
                        <path d="M12 21s-6.716-4.867-9.428-7.579A5.333 5.333 0 0 1 9.514 6.98L12 9.466l2.486-2.486a5.333 5.333 0 0 1 6.942 7.441C18.716 16.133 12 21 12 21z" />
                      </svg>
                      {post.likes_count ?? 0}
                    </span>
                  </div>

                  {post.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="cursor-pointer inline-flex items-center rounded-lg px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => {
                        setToDelete({ slug: post.slug, title: post.title });
                        setConfirmOpen(true);
                      }}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-500 text-sm"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  &larr;
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="delete-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmOpen(false)}
            aria-label="Close modal"
          />
          {/* Panel */}
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200/70 overflow-hidden animate-[fadeIn_.18s_ease]">
            <div className="px-6 pt-6 pb-4">
              <h3
                id="delete-title"
                className="text-lg font-semibold text-slate-800 flex items-center gap-2"
              >
                Delete Post
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete
                <span className="font-medium text-slate-900">
                  {" "}
                  "{toDelete.title || toDelete.slug}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => !deleting && setConfirmOpen(false)}
                className={`px-4 h-10 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition ${
                  deleting ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  deleting ? "opacity-80 cursor-not-allowed" : ""
                }`}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
          </div>
        </div>
      )}
    </section>
  );
}

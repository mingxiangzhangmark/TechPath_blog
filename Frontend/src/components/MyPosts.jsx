import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import coverFallback from "/Blog_cover1.png";
import { fetchProfile } from "../services/profile";
import { listPosts, deletePost } from "../services/post";
import { toast } from "react-toastify"; 

export default function MyPosts() {
  //   const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  // Track image errors for each post
  const [imageErrors, setImageErrors] = useState({});

  // modal state for pretty delete confirm (match Sign Out modal style)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState({ slug: "", title: "" });

  //   const userId = profile?.id
  const username = profile?.username;

  // Handle image loading error
  const handleImageError = (slug) => {
    setImageErrors(prev => ({
      ...prev,
      [slug]: true
    }));
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setImageErrors({}); // Reset image errors when reloading
      const profRes = await fetchProfile();
      const me = profRes.data || profRes;
      setProfile(me);
      const list = await listPosts({ author: me.id });
      const items = Array.isArray(list) ? list : list.results || [];
      setPosts(items);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setError("Failed to load your posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const empty = !loading && !error && posts.length === 0;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">My Posts</h1>
        <p className="text-slate-500 mt-1">
          {username ? `Posts created by ${username}` : "Your authored posts"}
        </p>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/posts/new"
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-sm hover:opacity-95"
        >
          + New Post
        </Link>
        <button
          onClick={load}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">{error}</p>
          <div className="mt-4">
            <button
              onClick={load}
              className="cursor-pointer inline-flex items-center rounded-lg px-4 py-2 bg-slate-900 text-white hover:bg-slate-700"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {empty && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">You haven’t published any posts yet.</p>
          <Link
            to="/posts/new"
            className="mt-4 inline-flex items-center rounded-lg px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white cursor-pointer"
          >
            Create your first post
          </Link>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  // Use the fallback image if there's no cover or if there was an error
                  src={imageErrors[p.slug] ? coverFallback : (p.cover || coverFallback)}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(p.slug)}
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-slate-900 line-clamp-2">
                  {p.title}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <time dateTime={p.created_at}>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : ""}
                  </time>
                  <span>•</span>
                  <span>{p.tags?.join(", ")}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/posts/${p.slug}`}
                    className="cursor-pointer inline-flex items-center rounded-lg px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                  >
                    View
                  </Link>
                  <Link
                    to={`/dashboard/posts/${p.slug}/edit`}
                    className="cursor-pointer inline-flex items-center rounded-lg px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setToDelete({ slug: p.slug, title: p.title });
                      setConfirmOpen(true);
                    }}
                    className="cursor-pointer inline-flex items-center rounded-lg px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pretty delete confirm modal (consistent with Sign Out modal) */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="delete-title"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay */}
          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmOpen(false)}
            aria-label="Close modal"
          />
          {/* panel */}
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
                  “{toDelete.title || toDelete.slug}”
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => !deleting && setConfirmOpen(false)}
                className={`px-4 h-10 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition ${deleting ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!toDelete.slug || deleting) return;
                  try {
                    setDeleting(true);
                    await deletePost(toDelete.slug);
                    setPosts((prev) =>
                      prev.filter((x) => x.slug !== toDelete.slug),
                    );
                    setConfirmOpen(false);
                    toast.success("Post deleted successfully"); 
                    // eslint-disable-next-line no-unused-vars
                  } catch (e) {
                    // fallback error
                    alert("Delete failed. Please try again.");
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className={`h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-300 ${deleting ? "opacity-80 cursor-not-allowed" : ""}`}
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHighlightedPosts } from "../services/post";

const FALLBACK_COVER = "/Blog_cover1.png";
const POST_ROUTE_BASE = "/posts";

function PostCard({ post }) {
  const created = new Date(post.created_at);
  const fmt = created.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  
  // Initialize with post.cover, fallback will be handled on error
  const [imageSrc, setImageSrc] = useState(post.cover || FALLBACK_COVER);
  
  // Handle image loading error
  const handleImageError = () => {
    if (imageSrc !== FALLBACK_COVER) {
      setImageSrc(FALLBACK_COVER);
    }
  };

  return (
    <Link
      to={`${POST_ROUTE_BASE}/${post.slug}/`}
      className="block group h-full"
    >
      <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm group-hover:shadow-md transition-shadow">
        <img
          src={imageSrc}
          alt={post.title}
          className="h-40 w-full object-cover"
          onError={handleImageError}
        />
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>
          <div className="text-sm text-slate-500 flex items-center justify-between">
            <span>{fmt}</span>
            <span className="inline-flex items-center gap-1" title="Likes">
              <svg
                width="16"
                height="16"
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
        </div>
      </article>
    </Link>
  );
}

export default function Posts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);

  // Always start from top when entering Blog page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getHighlightedPosts();
        const latestSorted = (data?.latest ?? [])
          .slice()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 6);
        const mostLikedSorted = (data?.most_liked ?? [])
          .slice()
          .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
          .slice(0, 6);
        if (alive) {
          setLatest(latestSorted);
          setPopular(mostLikedSorted);
          setError("");
        }
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        if (alive) setError("Failed to load posts");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="bg-white">
      {/* 1) Intro with GIF background */}
      <section className="relative overflow-hidden" aria-label="Blog intro">
        <div
          className="relative"
          style={{
            backgroundImage: "url(/BlogPageBackground.gif)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-slate-900/60">
            <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Explore TechPath Blog
              </h1>
              <p className="mt-4 text-white/90 max-w-3xl">
                Deep dives, engineering tips, and practical guides across
                software, cloud, data, and AI. Stay curious and keep building.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12">
        {/* 2) Most recent posts */}
        <section className="mt-2">
          <header className="mb-4 sm:mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Most recent posts
            </h2>
            <p className="text-slate-600 text-sm">
              Newest first, up to 6 posts
            </p>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : latest.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No posts yet.</p>
          )}
        </section>

        {/* 3) Most popular posts */}
        <section className="mt-10 sm:mt-12">
          <header className="mb-4 sm:mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Most popular posts
            </h2>
            <p className="text-slate-600 text-sm">Most likes, up to 6 posts</p>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : popular.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No posts yet.</p>
          )}
        </section>
      </div>
      {/* Search Portal at the bottom of the page */}
      <div className="max-w-7xl mx-auto px-6 pb-12 flex justify-center">
        <Link
          to="/posts/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition-all"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search & Filter Posts
        </Link>
      </div>
    </main>
  );
}

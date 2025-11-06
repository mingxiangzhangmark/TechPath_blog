import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { listPosts } from "../services/post";

const FALLBACK_COVER = "/Blog_cover1.png";
const POST_ROUTE_BASE = "/posts";
const PAGE_SIZE = 12;

const TAGS = [
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

function PostCard({ post }) {
  const created = new Date(post.created_at);
  const fmt = created.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  
  // Use state to manage image source with fallback
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

function Pagination({ page, totalPages, setPage }) {
  const pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
  }
  return (
    <div className="flex justify-center mt-8">
      <ul className="join">
        <li>
          <button
            className="join-item btn btn-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            «
          </button>
        </li>
        {pages.map((p, idx) =>
          p === "..." ? (
            <li key={idx}>
              <span className="join-item btn btn-sm btn-disabled">...</span>
            </li>
          ) : (
            <li key={p}>
              <button
                className={`join-item btn btn-sm ${p === page ? "btn-active btn-primary" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            className="join-item btn btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            »
          </button>
        </li>
      </ul>
    </div>
  );
}

export default function SearchPosts() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [ordering, setOrdering] = useState("-updated_at");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  // search switch
  const [initialized, setInitialized] = useState(false);

  // Always start from top when entering Blog page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Get search and tags parameters and synchronise state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const tagParam = params.get("tags") || "";
    setSearch(searchParam);
    setTag(tagParam);
    setPage(1);
    setInitialized(true);
  }, [location.search]);

  // search.
  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        search,
        tags: tag,
        ordering,
      };
      const data = await listPosts(params);
      setPosts(Array.isArray(data.results) ? data.results : []);
      setCount(data.count || 0);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Only listen to search, tag, ordering, page to keep it up-to-date.
  useEffect(() => {
    if (!initialized) return;
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, search, tag, ordering, page]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Search Posts
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Keyword Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by keyword..."
              className="w-full sm:w-64 rounded-md border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            {/* tag Search */}
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40 rounded-md border border-gray-300 bg-gray-50 py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="">All tags</option>
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {/* arrange in order */}
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40 rounded-md border border-gray-300 bg-gray-50 py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="-updated_at">The newest</option>
              <option value="updated_at">The oldest</option>
            </select>
          </div>
        </header>

        {/* List of results */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : posts.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </>
          ) : (
            <>
              <p className="text-slate-500">No posts found.</p>
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { HiSearch } from "react-icons/hi";
import { FiPieChart, FiLogOut } from "react-icons/fi";
import { getMe, isAuthed, logout } from "../services/auth";
import { fetchProfile } from "../services/profile"; 
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

export default function Header() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [, setAvatarError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarBust, setAvatarBust] = useState(0);
  const [headerSearch, setHeaderSearch] = useState("");
  const menuRef = useRef(null);

  // NEW: track which section is active on "/"
  const [activeSection, setActiveSection] = useState("home"); // 'home' | 'about

  const me = getMe();
  const authed = isAuthed();

  // API base for media (consistent with Profile.jsx)
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
  const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
  const buildMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const loadProfile = useCallback(async () => {
    if (!authed) return;
    try {
      const { data } = await fetchProfile();
      setProfile(data);
      setAvatarBust((b) => b + 1);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setAvatarError(true);
    }
  }, [authed]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // NEW: on "/" observe #about visibility to toggle activeSection
  useEffect(() => {
    if (path !== "/") return;
    const el = document.getElementById("about");
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setActiveSection(entry.isIntersecting ? "about" : "home");
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    // initialize state based on current hash
    if (location.hash === "#about") setActiveSection("about");
    return () => io.disconnect();
  }, [path, location.hash]);

  // Listen for Profile page update events (can be dispatched after a successful Profile.jsx update)
  useEffect(() => {
    const handler = () => loadProfile();
    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, [loadProfile]);

  const rawAvatar = profile?.profile?.avatar || null;
  const avatarUrl = rawAvatar
    ? `${buildMediaUrl(rawAvatar)}?v=${avatarBust}`
    : null;

  const initial = (
    me?.username?.trim()?.[0] ||
    me?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      await logout({ access, refresh });
      toast.success("Signed out successfully");
      navigate("/", { replace: true });
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      toast.error("Sign out failed");
    } finally {
      setSigningOut(false);
      setConfirmOpen(false);
    }
  };

  // smooth scroll helper (考虑 header 高度 ~64px)
  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (path === "/") {
      smoothScrollTo("about");
      // reflect in URL for back/forward + initial render logic
      window.history.replaceState(null, "", "#about");
      setActiveSection("about");
    } else {
      navigate("/#about");
    }
    setMobileMenuOpen(false);
  };

  // NEW: smooth scroll to top and clear hash when clicking Home on "/"
  const handleHomeClick = (e) => {
    if (path === "/") {
      e.preventDefault();
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
      setMobileMenuOpen(false);
    }
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(
        `/posts/search?search=${encodeURIComponent(headerSearch.trim())}`,
      );
    } else {
      navigate("/posts/search");
    }
    setHeaderSearch("");
  };

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-2 py-1 rounded-lg text-white font-semibold">
                TechPath
              </span>
              <span className="ml-1 text-xl font-semibold text-gray-900">
                Blog
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <form className="relative" onSubmit={handleHeaderSearch}>
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 ">
                <button type="submit" className="p-1 rounded  cursor-pointer">
                  <HiSearch className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:ml-6 md:flex md:space-x-8">
            <Link
              to="/"
              onClick={handleHomeClick}
              className={`inline-flex items-center px-1 pt-1 text-base font-medium ${
                path === "/" && activeSection === "home"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              to={path === "/" ? "#about" : "/#about"}
              onClick={handleAboutClick}
              className={`inline-flex items-center px-1 pt-1 text-base font-medium ${
                path === "/" && activeSection === "about"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              About
            </Link>
            <Link
              to="/posts"
              className={`inline-flex items-center px-1 pt-1 text-base font-medium ${
                path === "/posts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Posts
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Sign In / User */}
            {!authed && (
              <Link to="/login">
                <div className="group p-[1px] rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-violet-500">
                  <button
                    className="
                      px-5 py-2 rounded-[11px] text-sm font-medium
                      text-slate-700 bg-white
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-violet-400/50 cursor-pointer
                     group-hover:text-white
                     group-hover:bg-gradient-to-tr group-hover:from-cyan-400 group-hover:via-sky-500 group-hover:to-violet-500
                    "
                  >
                    Sign In
                  </button>
                </div>
              </Link>
            )}

            {authed && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="group h-11 w-11 rounded-full p-[2px] bg-gradient-to-b from-sky-400 via-indigo-500 to-violet-600 hover:from-sky-400 hover:to-pink-500 transition focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <div className="h-full w-full rounded-full bg-white/95 backdrop-blur overflow-hidden flex items-center justify-center text-sm font-semibold text-slate-600 group-hover:text-slate-700">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${initial}'s avatar`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Only set error state and replace with initial when image fails to load
                          setAvatarError(true);
                          // Replace the image with a div showing the initial
                          const parent = e.target.parentNode;
                          const initialElement = document.createElement('div');
                          initialElement.className = 'h-full w-full flex items-center justify-center';
                          initialElement.textContent = initial;
                          parent.replaceChild(initialElement, e.target);
                        }}
                        draggable={false}
                      />
                    ) : (
                      // If no avatarUrl is provided, show the initial directly
                      initial
                    )}
                  </div>
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 rounded-2xl bg-white shadow-xl border border-slate-200/70 overflow-hidden z-40 animate-[fadeIn_.12s_ease]"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Signed in as
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800 truncate">
                        {me?.username || me?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/dashboard");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                      role="menuitem"
                    >
                      <FiPieChart className="text-[18px]" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmOpen(true);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                      role="menuitem"
                    >
                      <FiLogOut className="text-[18px]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={handleHomeClick}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              path === "/" && activeSection === "home"
                ? "border-blue-500 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
            to={path === "/" ? "#about" : "/#about"}
            onClick={handleAboutClick}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              path === "/" && activeSection === "about"
                ? "border-blue-500 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            About
          </Link>
          <Link
            to="/posts"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              path === "/posts"
                ? "border-blue-500 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Posts
          </Link>
        </div>
      </div>

      {/* Sign Out Confirm Modal (portal to body => full-screen overlay) */}
      {confirmOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            aria-labelledby="header-signout-title"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !signingOut && setConfirmOpen(false)}
              aria-label="Close modal"
            />
            <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200/70 overflow-hidden animate-[fadeIn_.18s_ease]">
              <div className="px-6 pt-6 pb-4">
                <h3
                  id="header-signout-title"
                  className="text-lg font-semibold text-slate-800 flex items-center gap-2"
                >
                  Confirm Sign Out
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to sign out?
                </p>
              </div>
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => !signingOut && setConfirmOpen(false)}
                  className="px-4 h-10 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition disabled:opacity-60"
                  disabled={signingOut}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-80"
                >
                  {signingOut ? "Signing out..." : "Yes, Sign Out"}
                </button>
              </div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}

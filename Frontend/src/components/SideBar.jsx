import React, { useState } from "react";
import {
  FiPieChart,
  FiUser,
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiShield, 
} from "react-icons/fi";
import clsx from "clsx";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { logout, getMe } from "../services/auth";

const PANEL_TITLE = "Workspace";

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: FiPieChart,
    path: "/dashboard",
  },
  {
    key: "profile",
    label: "Profile",
    icon: FiUser,
    path: "/profile",
    badge: "Admin",
  },
  {
    key: "admin",
    label: "Admin",
    icon: FiShield,
    path: "/admin",
    requiresAdmin: true,
  },
  { key: "posts", label: "Posts", icon: FiFileText, path: "/dashboard/posts" },
  // { key: 'users', label: 'Users', icon: FiUsers, path: '/users' },
  {
    key: "comments",
    label: "Comments",
    icon: FiMessageSquare,
    path: "/comments",
  },
];

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [, setActive] = useState("dashboard");
  const [signingOut, setSigningOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();

  const me = getMe();
  const isAdmin = !!me?.is_admin_user;

  // Set active according to the current path
  const currentPath = location.pathname;

  // Fix: Dashboard is only highlighted for exact /dashboard; Posts is highlighted for /dashboard/posts and its subroutes.
  const isPathActive = (itemPath) => {
    if (itemPath === "/dashboard") return currentPath === "/dashboard";
    if (itemPath === "/dashboard/posts")
      return currentPath.startsWith("/dashboard/posts");
    return currentPath === itemPath;
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      await logout({ access, refresh });

      toast.success("Signed out successfully");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Sign out failed, please try again.",
      );
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("me");
      navigate("/login", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  const confirmSignOut = async () => {
    await handleSignOut();
    setConfirmOpen(false);
  };

  return (
    <>
      <aside
        className={clsx(
          "flex flex-col bg-white/95 backdrop-blur border-r border-slate-200",
          "transition-[width] duration-300 ease-in-out overflow-hidden",
          "h-screen sticky top-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 border-b border-slate-200 px-3 shrink-0">
          <span
            className={clsx(
              "font-semibold text-lg tracking-wide bg-clip-text text-transparent",
              "hidden sm:inline-block",
              "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500",
              collapsed && "opacity-0 w-0 overflow-hidden",
            )}
          >
            {PANEL_TITLE}
          </span>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto p-2 rounded-md border border-slate-200 hover:bg-slate-100 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {navItems.map((item) => {
            if (item.requiresAdmin && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = isPathActive(item.path);
            const showBadge = item.badge && (item.badge !== "Admin" || isAdmin);
            return (
              <button
                key={item.key}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  setActive(item.key);
                  navigate(item.path);
                }}
                className={clsx(
                  "group relative w-full flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                  isActive
                    ? [
                        "text-white shadow-sm",
                        "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600",
                        "hover:opacity-95",
                      ]
                    : [
                        "text-slate-600",
                        "hover:bg-indigo-50 hover:text-indigo-700",
                      ],
                  collapsed ? "justify-center h-14" : "gap-3 px-4 py-3",
                )}
              >
                <Icon
                  className={clsx(
                    "text-[20px] transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-indigo-600",
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {showBadge && (
                      <span
                        className={clsx(
                          "text-[10px] font-semibold tracking-wide rounded-md px-2 py-0.5",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-indigo-100 text-indigo-700",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto pt-2">
          <div className="px-3">
            <div className="h-px bg-slate-200 mb-2" />
          </div>
          <div className="px-2 pb-3">
            <button
              title="Sign Out"
              onClick={() => !signingOut && setConfirmOpen(true)} 
              className={clsx(
                "w-full flex items-center rounded-xl text-sm font-medium transition-colors",
                "text-slate-500 hover:text-red-600 hover:bg-red-50",
                "focus:outline-none focus:ring-2 focus:ring-red-400/50",
                collapsed ? "justify-center h-12" : "gap-3 px-4 py-3",
                signingOut && "opacity-60 cursor-not-allowed",
              )}
              disabled={signingOut}
            >
              <FiLogOut className="text-[20px]" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="signout-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !signingOut && setConfirmOpen(false)}
            aria-label="Close modal"
          />
          {/* Modal panel */}
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200/70 overflow-hidden animate-[fadeIn_.18s_ease]">
            <div className="px-6 pt-6 pb-4">
              <h3
                id="signout-title"
                className="text-lg font-semibold text-slate-800 flex items-center gap-2"
              >
                Confirm Sign Out
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to sign out? You will need to sign in
                again to access your workspace.
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => !signingOut && setConfirmOpen(false)}
                className={clsx(
                  "px-4 h-10 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition",
                  signingOut && "opacity-60 cursor-not-allowed",
                )}
                disabled={signingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                disabled={signingOut}
                className={clsx(
                  "h-10 px-5 rounded-lg text-sm font-semibold text-white",
                  "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow",
                  "focus:outline-none focus:ring-2 focus:ring-pink-300",
                  signingOut && "opacity-80 cursor-not-allowed",
                )}
              >
                {signingOut ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs"></span>
                    Signing out...
                  </span>
                ) : (
                  "Yes, Sign Out"
                )}
              </button>
            </div>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
          </div>
        </div>
      )}
    </>
  );
}

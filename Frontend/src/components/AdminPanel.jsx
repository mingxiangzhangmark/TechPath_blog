import React, { useEffect, useState, useCallback } from "react";
import {
  fetchAdminUsers,
  updateUserAdmin,
  deleteUser,
} from "../services/admin";
import {
  FiShield,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiTrash2,
  FiUserPlus,
  FiUserX,
  FiUsers,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import AdminPosts from "./AdminPosts";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
const buildMediaUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return `${API_ORIGIN}${p.startsWith("/") ? "" : "/"}${p}`;
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users"); // "users" or "posts"
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState(null);
  const [acting, setActing] = useState({ toggle: null, remove: null });
  const [confirm, setConfirm] = useState(null); // { type: 'toggle'|'delete', user, target? }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAdminUsers(); // was: const { data } = await fetchAdminUsers()
      // Service returns the array directly (res.data). Guard just in case.
      const arr = Array.isArray(list) ? list : list?.data ?? [];
      setUsers(arr);
    } catch (e) {
      setError(
        e?.response?.status === 403 ? "Forbidden (not admin)" : "Load failed"
      );
      setUsers([]); // ensure never undefined
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      load();
    }
  }, [load, activeTab]);

  const filtered = (users || []).filter((u) => {
    // guard against undefined
    const text = [u.username, u.email, u.first_name, u.last_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes(q.toLowerCase());
  });

  function handleToggle(u) {
    if (acting.toggle) return;
    setConfirm({ type: "toggle", user: u, target: !u.is_admin_user });
  }

  function handleDelete(u) {
    if (u.is_admin_user || acting.remove) return;
    setConfirm({ type: "delete", user: u });
  }

  async function executeConfirm() {
    if (!confirm) return;
    const { type, user, target } = confirm;
    if (type === "toggle") {
      setActing((a) => ({ ...a, toggle: user.id }));
      try {
        const resp = await updateUserAdmin(user.id, target); // resp = { message, user }
        const newFlag = resp?.user?.is_admin_user ?? target; // fallback if backend omits user
        setUsers((list) =>
          list.map((x) =>
            x.id === user.id ? { ...x, is_admin_user: newFlag } : x
          )
        );
        toast.success(target ? "Admin granted" : "Admin revoked");
      } catch (e) {
        toast.error("Action failed");
        console.error("Toggle admin error:", e);
      } finally {
        setActing((a) => ({ ...a, toggle: null }));
        setConfirm(null);
      }
    } else if (type === "delete") {
      setActing((a) => ({ ...a, remove: user.id }));
      try {
        await deleteUser(user.id);
        setUsers((list) => list.filter((x) => x.id !== user.id));
        toast.success("User deleted");
      } catch {
        toast.error("Delete failed");
      } finally {
        setActing((a) => ({ ...a, remove: null }));
        setConfirm(null);
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 pt-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-white shadow">
            <FiShield />
          </span>
          Admin Panel
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex -mb-px w-full">
          <button
            onClick={() => setActiveTab("users")}
            className={clsx(
              "flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition",
              activeTab === "users"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <FiUsers className="mr-2 h-4 w-4" />
            Manage User Status
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={clsx(
              "flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition",
              activeTab === "posts"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <FiFileText className="mr-2 h-4 w-4" />
            Manage All Posts
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "users" ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users..."
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            </div>
            <button
              onClick={load}
              disabled={loading}
              className={clsx(
                "h-11 px-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-violet-400/40",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <FiRefreshCw className={clsx(loading && "animate-spin")} />
              Refresh
            </button>
            <div className="flex-1" />
          </div>

          {error && (
            <div className="rounded-xl border border-pink-300 bg-pink-50 text-pink-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="loading loading-spinner loading-sm" /> Loading...
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-sm text-slate-500">No users.</div>
            )}

            {filtered.map((u) => {
              const isOpen = expanded === u.id;
              const avatar = buildMediaUrl(u.profile?.avatar);
              const initial = (
                u.username?.[0] ||
                u.email?.[0] ||
                "U"
              ).toUpperCase();
              return (
                <div
                  key={u.id}
                  className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm overflow-hidden transition"
                >
                  {/* User content */}
                  <button
                    onClick={() => setExpanded((o) => (o === u.id ? null : u.id))}
                    className={clsx(
                      "w-full flex items-center gap-4 px-5 py-4 text-left",
                      "hover:bg-gradient-to-r from-indigo-50/70 via-violet-50/70 to-pink-50/70 transition"
                    )}
                  >
                    <div className="h-12 w-12 rounded-xl p-[2px] bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-sm">
                      <div className="h-full w-full rounded-[10px] bg-white/95 overflow-hidden grid place-items-center text-base font-semibold text-slate-700">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={u.username}
                            className="h-full w-full object-cover"
                            draggable={false}
                            onError={(e) => {
                              const parent = e.target.parentNode;
                              const initialElement = document.createElement(
                                "div"
                              );
                              initialElement.className =
                                "h-full w-full flex items-center justify-center";
                              initialElement.textContent = initial;
                              parent.replaceChild(initialElement, e.target);
                            }}
                          />
                        ) : (
                          initial
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {u.username}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full",
                          u.is_admin_user
                            ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white"
                            : "bg-slate-200 text-slate-600"
                        )}
                      >
                        {u.is_admin_user ? "ADMIN" : "USER"}
                      </span>
                      {isOpen ? (
                        <FiChevronUp className="text-slate-500" />
                      ) : (
                        <FiChevronDown className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded user details */}
                  <div
                    className={clsx(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      {/* User details */}
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm grid gap-5 sm:grid-cols-3">
                        {/* User details content */}
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <FiUser />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                              Name
                            </p>
                            <p className="text-slate-700">
                              {u.first_name || u.last_name
                                ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                            <FiMail />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                              Email
                            </p>
                            <p className="text-slate-700 break-all">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <FiPhone />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                              Phone
                            </p>
                            <p className="text-slate-700">
                              {u.phone_number || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <FiMapPin />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                              Address
                            </p>
                            <p className="text-slate-700">{u.address || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <FiShield />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                              Role
                            </p>
                            <p className="text-slate-700">
                              {u.is_admin_user ? "Admin" : "User"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* User actions */}
                      <div className="px-6 pt-3 pb-5 border-t border-slate-100 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={acting.toggle === u.id}
                          className={clsx(
                            "h-10 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition",
                            u.is_admin_user
                              ? "border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700"
                              : "text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow",
                            acting.toggle === u.id &&
                              "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {acting.toggle === u.id && (
                            <span className="loading loading-spinner loading-xs" />
                          )}
                          {u.is_admin_user ? <FiUserX /> : <FiUserPlus />}
                          {u.is_admin_user ? "Revoke Admin" : "Make Admin"}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.is_admin_user || acting.remove === u.id}
                          className={clsx(
                            "h-10 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300/40 transition",
                            (u.is_admin_user || acting.remove === u.id) &&
                              "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {acting.remove === u.id && (
                            <span className="loading loading-spinner loading-xs" />
                          )}
                          <FiTrash2 />
                          Delete User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <AdminPosts />
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() =>
                !acting.toggle && !acting.remove && setConfirm(null)
              }
            />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500" />
              <div className="px-6 pt-6 pb-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl p-[2px] bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500">
                    <div className="h-full w-full rounded-[10px] bg-white grid place-items-center text-lg text-slate-700 font-semibold">
                      {confirm.user.username[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                      {confirm.type === "toggle"
                        ? confirm.target
                          ? "Grant Admin"
                          : "Revoke Admin"
                        : "Delete User"}
                    </h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      {confirm.type === "toggle"
                        ? `Are you sure you want to ${
                            confirm.target ? "grant" : "revoke"
                          } admin for ${confirm.user.username}?`
                        : `This will permanently delete ${confirm.user.username}. This action cannot be undone.`}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-600">
                  <p>
                    <span className="font-medium">Username:</span>{" "}
                    {confirm.user.username}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {confirm.user.email}
                  </p>
                  {confirm.type === "toggle" && (
                    <p>
                      <span className="font-medium">Change:</span>{" "}
                      {confirm.user.is_admin_user
                        ? "Admin -> User"
                        : "User -> Admin"}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  disabled={acting.toggle || acting.remove}
                  onClick={() =>
                    !acting.toggle && !acting.remove && setConfirm(null)
                  }
                  className="h-10 px-5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-violet-400/30 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeConfirm}
                  disabled={acting.toggle || acting.remove}
                  className={clsx(
                    "h-10 px-6 rounded-lg text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition",
                    confirm.type === "delete"
                      ? "bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600"
                      : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600",
                    (acting.toggle || acting.remove) &&
                      "opacity-60 cursor-not-allowed"
                  )}
                >
                  {acting.toggle || acting.remove ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="loading loading-spinner loading-xs" />
                      Processing...
                    </span>
                  ) : confirm.type === "delete" ? (
                    "Confirm Delete"
                  ) : confirm.target ? (
                    "Confirm Grant"
                  ) : (
                    "Confirm Revoke"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

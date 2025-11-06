import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listComments,
  createComment,
  deleteComment,
  editComment,
} from "../services/comment";
import { isAuthed } from "../services/auth";
import { fetchProfile } from "../services/profile";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { createPortal } from "react-dom";
import { validateInput, sanitizeHTML } from "../utils/xssProtection"; // Add XSS protection utilities

export default function CommentSection({ postId }) {
  const authed = isAuthed();
  const [me, setMe] = useState(null);
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 200;

  // build media URL same as Header
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
  const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
  const buildMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
  };
  const [avatarBust, setAvatarBust] = useState(0);

  const load = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError("");
      const list = await listComments(postId);
      setComments(list);
    } catch (e) {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  useEffect(() => {
    if (!authed) return;
    fetchProfile()
      .then((res) => {
        setMe(res.data || res);
        setAvatarBust((b) => b + 1);
      })
      .catch(() => {});
  }, [authed]);

  // refresh avatar after profile updated elsewhere (like Header/Profile)
  useEffect(() => {
    const handler = () => {
      fetchProfile()
        .then((res) => {
          setMe(res.data || res);
          setAvatarBust((b) => b + 1);
        })
        .catch(() => {});
    };
    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, []);

  const count = comments.length;
  const remain = limit - (content?.length || 0);

  // derive avatar like Header
  const rawAvatar = me?.profile?.avatar || me?.avatar || null;
  const myAvatarUrl = rawAvatar
    ? `${buildMediaUrl(rawAvatar)}?v=${avatarBust}`
    : null;
  const myInitial = (
    me?.username?.trim()?.[0] ||
    me?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authed) return;
    const text = content.trim();
    if (!text) return toast.error("Comment cannot be empty");
    if (text.length > limit) return toast.error("Comment too long");

    // Xss protection check
    const validation = validateInput(text);
    if (!validation.isValid) {
      return toast.error(validation.message);
    }

    try {
      setSubmitting(true);
      await createComment({ post: postId, content: text });
      setContent("");
      toast.success("Comment posted");
      await load();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (err?.response?.data && JSON.stringify(err.response.data)) ||
        err?.message ||
        "Failed to post comment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    setConfirmDeleteId(commentId);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteComment(confirmDeleteId);
      setComments((comments) =>
        comments.filter((c) => c.id !== confirmDeleteId),
      );
      toast.success("Comment deleted");
    } catch (e) {
      toast.error("Failed to delete comment");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSave = async () => {
    // Xss protection check
    const validation = validateInput(editContent);
    if (!validation.isValid) {
      return toast.error(validation.message);
    }

    try {
      await editComment(editingId, editContent);
      setComments((comments) =>
        comments.map((c) =>
          c.id === editingId ? { ...c, content: editContent } : c,
        ),
      );
      setEditingId(null);
      setEditContent("");
      toast.success("Comment updated");
    } catch (err) {
      toast.error("Failed to update comment");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        Comments
        <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full text-xs bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
          {count}
        </span>
      </h2>

      {/* Editor */}
      <div className="mt-4">
        {authed ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 dark:border-white/10 p-4"
          >
            {/* Row 1: avatar + signed-in text */}
            <div className="mb-3 flex items-center gap-3">
              {myAvatarUrl ? (
                <img
                  src={myAvatarUrl}
                  alt="User avatar"
                  className="h-10 w-10 rounded-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                  {myInitial}
                </div>
              )}
              <div className="text-xs text-slate-500">
                Signed in as:{" "}
                <span className="font-medium">@{me?.username || "user"}</span>
              </div>
            </div>

            {/* Row 2: textarea (full width, not shifted by avatar) */}
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={limit}
              placeholder="Add a comment..."
              className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
            />

            {/* Row 3: footer */}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {remain} characters remaining
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer inline-flex items-center rounded-lg px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 text-sm text-slate-600 dark:text-slate-300">
            Please sign in to comment.{" "}
            <Link to="/login" className="text-violet-600 hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        )}
        {!loading && error && (
          <div className="text-sm text-rose-600">{error}</div>
        )}
        {!loading && !error && (
          <ul className="space-y-6">
            {comments.map((c) => {
              const username =
                c.username || c.author_username || c.user?.username || "user";
              const avatarRaw =
                c.user_avatar || c.author_avatar || c.user?.avatar || "";
              const avatar = avatarRaw ? avatarRaw : "";
              const when = c.updated_at || c.created_at;
              const dateStr = when ? new Date(when).toLocaleDateString() : "";
              const isMine = authed && me && String(c.author) === String(me.id);

              console.log("comment:", c, "me:", me);

              return (
                <li key={c.id}>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                        {username[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-slate-900 flex items-center">
                        <span className="font-medium">@{username}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {dateStr}
                        </span>
                        {/* Edit and delete buttons, visible only to me */}
                        {isMine && (
                          <span className="flex items-center gap-2 ml-3">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                              onClick={() => handleEditStart(c)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                              onClick={() => handleDelete(c.id)}
                            >
                              <FaTrash />
                            </button>
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-slate-700 whitespace-pre-wrap">
                        {editingId === c.id ? (
                          <div>
                            <textarea
                              className="w-full border rounded p-1"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="flex gap-2 mt-1">
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={handleEditSave}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-xs"
                                onClick={handleEditCancel}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Use dangerouslySetInnerHTML to safely display HTML-escaped content
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: sanitizeHTML(c.content) 
                            }} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            aria-labelledby="comment-delete-title"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !deleting && setConfirmDeleteId(null)}
              aria-label="Close modal"
            />
            <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200/70 overflow-hidden animate-[fadeIn_.18s_ease]">
              <div className="px-6 pt-6 pb-4">
                <h3
                  id="comment-delete-title"
                  className="text-lg font-semibold text-slate-800 flex items-center gap-2"
                >
                  Delete Comment
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete this comment? This action
                  cannot be undone.
                </p>
              </div>
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => !deleting && setConfirmDeleteId(null)}
                  className="px-4 h-10 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition disabled:opacity-60"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-80"
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

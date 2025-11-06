import React, { useEffect, useState, useCallback } from "react";
import { fetchProfile, updateProfile } from "../services/profile";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaTwitter,
  FaGlobe,
} from "react-icons/fa";
import {
  FiMapPin,
  FiPhone,
  FiUser,
  FiShield,
  FiX,
  FiUpload,
} from "react-icons/fi";

// API root address (remove /api)
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

function buildMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("blob:")) return path; // Local Preview
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarBust, setAvatarBust] = useState(0);

  // Editable fields (without username / email / is_admin_user / id)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    bio: "",
    linkedin: "",
    github: "",
    facebook: "",
    x_twitter: "",
    website: "",
  });

  const [errors, setErrors] = useState({});
  const MAX_BIO = 400;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchProfile();
      setData(data);
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        address: data.address || "",
        phone_number: data.phone_number || "",
        bio: data.profile?.bio || "",
        linkedin: data.profile?.linkedin || "",
        github: data.profile?.github || "",
        facebook: data.profile?.facebook || "",
        x_twitter: data.profile?.x_twitter || "",
        website: data.profile?.website || "",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const urlKeys = ["linkedin", "github", "facebook", "x_twitter", "website"];

  const normalizeUrl = (v) => {
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  const validate = () => {
    const next = {};
    urlKeys.forEach((k) => {
      const val = form[k];
      if (val && !/^https?:\/\/.+/i.test(val)) next[k] = "Need http(s)://";
    });
    if (form.bio.length > MAX_BIO) next.bio = `Max ${MAX_BIO} chars`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const c = { ...prev };
        delete c[name];
        return c;
      });
    }
  };

  const handleUrlBlur = (e) => {
    const { name, value } = e.target;
    if (urlKeys.includes(name) && value && !/^https?:\/\//i.test(value)) {
      setForm((f) => ({ ...f, [name]: normalizeUrl(value) }));
    }
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) {
      toast.error("Please fix errors");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form, avatarFile);
      await load();
      setAvatarFile(null);
      setAvatarBust((b) => b + 1);
      toast.success("Profile updated");
      setOpen(false);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (!data) return;
    setForm({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      address: data.address || "",
      phone_number: data.phone_number || "",
      bio: data.profile?.bio || "",
      linkedin: data.profile?.linkedin || "",
      github: data.profile?.github || "",
      facebook: data.profile?.facebook || "",
      x_twitter: data.profile?.x_twitter || "",
      website: data.profile?.website || "",
    });
    setAvatarFile(null);
  };

  const initial = data?.username?.[0]?.toUpperCase() || "U";
  const rawAvatar = avatarFile
    ? URL.createObjectURL(avatarFile)
    : data?.profile?.avatar || null;

  const avatarUrl = rawAvatar
    ? `${buildMediaUrl(rawAvatar)}${rawAvatar.startsWith("blob:") ? "" : `?v=${avatarBust}`}`
    : null;

  //   const iconButton =
  //     'h-10 px-5 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition'

  const SOCIAL_CONFIG = [
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: FaLinkedin,
      color: "text-sky-600",
    },
    { key: "github", label: "GitHub", icon: FaGithub, color: "text-slate-800" },
    {
      key: "facebook",
      label: "Facebook",
      icon: FaFacebook,
      color: "text-blue-600",
    },
    {
      key: "x_twitter",
      label: "X / Twitter",
      icon: FaTwitter,
      color: "text-sky-500",
    },
    {
      key: "website",
      label: "Website",
      icon: FaGlobe,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* mastercard */}
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-300/25 via-violet-300/25 to-pink-300/25 blur-xl -z-10" />
        <div className="rounded-3xl p-[2px] bg-gradient-to-r from-indigo-400/40 via-violet-400/40 to-pink-400/40">
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 px-8 pt-8 pb-10">
            {/* top row */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="relative inline-block">
                  <div className="h-32 w-32 rounded-3xl p-[3px] bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-sm">
                    <div className="h-full w-full rounded-3xl overflow-hidden bg-white/95 grid place-items-center text-4xl font-semibold text-slate-700">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${initial}'s avatar`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Only replace with initial when image fails to load
                            const parent = e.target.parentNode;
                            const initialElement = document.createElement('div');
                            initialElement.className = 'h-full w-full flex items-center justify-center';
                            initialElement.textContent = initial;
                            parent.replaceChild(initialElement, e.target);
                          }}
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  {data?.is_admin_user && (
                    <span className="absolute bottom-1 right-1 flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow pointer-events-none">
                      <FiShield className="text-xs" />
                      ADMIN
                    </span>
                  )}
                </div>
              </div>

              {/* text message */}
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {data?.first_name || data?.last_name
                      ? `${data.first_name || ""} ${data.last_name || ""}`.trim()
                      : data?.username}
                  </h1>
                  <p className="text-sm text-slate-500">{data?.email}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FiMapPin />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                        Address
                      </p>
                      <p className="text-sm text-slate-700 break-words">
                        {data?.address || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <FiPhone />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                        Phone
                      </p>
                      <p className="text-sm text-slate-700 break-words">
                        {data?.phone_number || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium mb-2">
                    Bio
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-line min-h-[48px]">
                    {data?.profile?.bio?.trim()
                      ? data.profile.bio
                      : "No bio yet."}
                  </p>

                  {/* Social links */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SOCIAL_CONFIG.filter((s) => data?.profile?.[s.key])
                      .length === 0 && (
                      <span className="text-[11px] text-slate-400">
                        No social links added.
                      </span>
                    )}

                    {SOCIAL_CONFIG.map(({ key, label, icon: Icon, color }) => {
                      const val = data?.profile?.[key];
                      if (!val) return null;
                      const href = val.startsWith("http")
                        ? val
                        : `https://${val}`;
                      return (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-gradient-to-r from-indigo-500/5 to-pink-500/5 hover:from-indigo-500/15 hover:to-pink-500/15 px-3 py-1 text-[11px] font-medium text-slate-600 transition"
                        >
                          <Icon className={clsx("text-sm", color)} />
                          <span>{label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* push button */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => {
                      resetForm();
                      setOpen(true);
                    }}
                    className="h-11 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    Change Profile
                  </button>
                  <button
                    onClick={load}
                    disabled={loading}
                    className="h-11 px-6 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:opacity-40"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Overview Card */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: "Username",
            value: data?.username || "—",
            icon: FiUser,
            bg: "from-indigo-500/10 to-indigo-500/0",
          },
          {
            label: "Role",
            value: data?.is_admin_user ? "Admin" : "User",
            icon: FiShield,
            bg: "from-violet-500/10 to-violet-500/0",
          },
          {
            label: "Email",
            value: data?.email || "—",
            icon: FaGlobe,
            bg: "from-pink-500/10 to-pink-500/0",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5"
            >
              <div
                className={clsx(
                  "absolute inset-0 bg-gradient-to-br opacity-70 pointer-events-none",
                  item.bg,
                )}
              />
              <div className="relative flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                  <Icon />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="loading loading-spinner loading-sm" />
          Loading...
        </div>
      )}

      {/* compiler Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onClick={() => !saving && setOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="
                relative w-full max-w-3xl
                max-h-[88vh]            /* Limit overall height */
                flex flex-col
                rounded-2xl bg-white shadow-xl border border-slate-200/70 overflow-hidden"
            >
              {/* top colored strip */}
              <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500" />

              {/* Header is set to sticky to minimize top and bottom margins */}
              <div
                className="
                sticky top-0 z-10
                bg-white/90 backdrop-blur
                px-6 pt-5 pb-4
                flex items-start gap-4 border-b border-slate-100"
              >
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) setAvatarFile(file);
                  }}
                  className="relative group cursor-pointer shrink-0"
                >
                  <div className="h-20 w-20 rounded-2xl p-[2px] bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 overflow-hidden">
                    <div className="h-full w-full rounded-2xl bg-white/90 grid place-items-center text-xl font-semibold text-slate-700">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${initial}'s avatar`}
                          className="h-full w-full object-cover rounded-2xl"
                          onError={(e) => {
                            // Only replace with initial when image fails to load
                            const parent = e.target.parentNode;
                            const initialElement = document.createElement('div');
                            initialElement.className = 'h-full w-full flex items-center justify-center';
                            initialElement.textContent = initial;
                            parent.replaceChild(initialElement, e.target);
                          }}
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  <label className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] cursor-pointer bg-gradient-to-r from-violet-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow hover:brightness-110 flex items-center gap-1">
                    <FiUpload className="text-[11px]" />
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatar}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                    Edit Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Update personal & social info. Username / email read-only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !saving && setOpen(false)}
                  className="ml-auto h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                >
                  <FiX />
                </button>
              </div>

              {/* Body is scrollable, reducing internal vertical spacing & control heights. */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
                {/* Personal fields (Harmonized to the same style as Social) */}
                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    { key: "first_name", label: "First Name", icon: FiUser },
                    { key: "last_name", label: "Last Name", icon: FiUser },
                    { key: "address", label: "Address", icon: FiMapPin },
                    {
                      key: "phone_number",
                      label: "Phone Number",
                      icon: FiPhone,
                    },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                        <Icon className="text-slate-500" /> {label}
                      </label>
                      <div className="relative">
                        <input
                          name={key}
                          value={form[key]}
                          onChange={handleChange}
                          className="h-10 w-full rounded-lg border px-3 pl-9 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/40 border-slate-200"
                        />
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-600">
                      Bio
                    </label>
                    <span
                      className={clsx(
                        "text-[10px]",
                        form.bio.length > MAX_BIO
                          ? "text-pink-600 font-medium"
                          : "text-slate-400",
                      )}
                    >
                      {form.bio.length}/{MAX_BIO}
                    </span>
                  </div>
                  <textarea
                    name="bio"
                    rows={4}
                    value={form.bio}
                    onChange={handleChange}
                    className={clsx(
                      "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/40 resize-none",
                      errors.bio && "border-pink-400 focus:ring-pink-400/40",
                    )}
                    placeholder="Tell something about yourself..."
                  />
                  {errors.bio && (
                    <p className="text-[11px] text-pink-600">{errors.bio}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    Social Links
                  </p>
                  <div className="grid gap-5 md:grid-cols-2">
                    {[
                      ["linkedin", "LinkedIn URL", FaLinkedin],
                      ["github", "GitHub URL", FaGithub],
                      ["facebook", "Facebook URL", FaFacebook],
                      ["x_twitter", "X / Twitter URL", FaTwitter],
                      ["website", "Website", FaGlobe],
                    ].map(([key, label, Icon]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                          <Icon className="text-slate-500" /> {label}
                        </label>
                        <div className="relative">
                          <input
                            name={key}
                            value={form[key]}
                            onChange={handleChange}
                            onBlur={handleUrlBlur}
                            placeholder="https://..."
                            className={clsx(
                              "h-10 w-full rounded-lg border px-3 pl-9 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/40 border-slate-200",
                              errors[key] &&
                                "border-pink-400 focus:ring-pink-400/40",
                            )}
                          />
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm" />
                        </div>
                        {errors[key] && (
                          <p className="text-[11px] text-pink-600">
                            {errors[key]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer set sticky, more compact visual */}
              <div className="sticky bottom-0 px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-200 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  className={clsx(
                    "h-10 px-5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition",
                    saving && "opacity-50 cursor-not-allowed",
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className={clsx(
                    "h-10 px-7 rounded-lg text-sm font-semibold text-white shadow-sm transition",
                    "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300",
                    saving && "opacity-60 cursor-not-allowed",
                  )}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="loading loading-spinner loading-xs" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
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

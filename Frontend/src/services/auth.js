// src/services/auth.js
// Only "authentication-related" API calls (login, logout, etc.). The page only calls the functions here。

import api from "../api";

// General Login
export async function login({ email, password }) {
  const { data } = await api.post("/login/", {
    username: email,
    password,
  });

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem(
    "me",
    JSON.stringify({
      username: data.username,
      email: data.email,
      is_admin_user: data.is_admin_user,
    }),
  );

  api.defaults.headers.common.Authorization = `Bearer ${data.access}`;

  return data;
}

// Google Sign In (it is recommended to call this method after a successful Google Sign In)
export function saveGoogleToken(data) {
  // data.token, data.refresh, data.user
  localStorage.setItem("access", data.token); // compatibility ProtectedRoute
  localStorage.setItem("refresh", data.refresh || "");
  localStorage.setItem("me", JSON.stringify(data.user || {}));
  api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
}

export async function logout({ access, refresh }) {
  try {
    await api.post("/logout/", { access, refresh });
  } finally {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("me");
    delete api.defaults.headers.common.Authorization;
  }
}

export function getMe() {
  const me = localStorage.getItem("me");
  return me ? JSON.parse(me) : null;
}

export function isAuthed() {
  // Compatible with regular and Google logins
  return !!localStorage.getItem("access");
}

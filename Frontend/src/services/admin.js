import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

export async function fetchAdminUsers() {
  const access = localStorage.getItem("access");
  const res = await axios.get(`${API_BASE}/admin-panel/`, {
    headers: { Authorization: access ? `Bearer ${access}` : undefined },
  });
  return res.data;
}

export async function updateUserAdmin(userId, isAdmin) {
  const access = localStorage.getItem("access");
  const res = await axios.put(
    `${API_BASE}/admin-panel/`,
    { user_id: userId, is_admin_user: isAdmin },
    { headers: { Authorization: access ? `Bearer ${access}` : undefined } },
  );
  return res.data; // ensure we return the data object (has message,user)
}

export async function deleteUser(userId) {
  const access = localStorage.getItem("access");
  const res = await axios.delete(`${API_BASE}/admin-panel/${userId}/`, {
    headers: { Authorization: access ? `Bearer ${access}` : undefined },
  });
  return res.data;
}

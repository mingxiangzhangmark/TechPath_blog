import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api",
  withCredentials: true, // If you want to use the cookie later, you can open the
});

// Fetch the access token from localStorage and automatically add it to each request header
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// (Optional) Auto-attempt refresh: when the backend returns a 401, refresh is used to replace the access with a new one.
let isRefreshing = false;
let pending = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // No return, or not a 401, just throw it.
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid concurrent duplicate refreshes: hang subsequent requests and wait for a successful refresh before releasing them
    if (!isRefreshing) {
      isRefreshing = true;
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Call the backend refresh interface
        const { data } = await axios.post(`${api.defaults.baseURL}/refresh/`, {
          refresh,
        });

        // Save the new access and update the default request header
        localStorage.setItem("access", data.access);
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`;

        // Replay pending requests sequentially
        pending.forEach((cb) => cb(data.access));
        pending = [];
        isRefreshing = false;

        // Retry the original request this time
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        isRefreshing = false;
        pending = [];
        // Refresh failed: clear local token
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(error);
      }
    }

    // Refreshing: returns a promise to wait for the refresh to complete before continuing the request.
    return new Promise((resolve) => {
      pending.push((newAccess) => {
        original.headers.Authorization = `Bearer ${newAccess}`;
        resolve(api(original));
      });
    });
  },
);

export default api;

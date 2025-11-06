import axios from "axios";

const googleApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default googleApi;

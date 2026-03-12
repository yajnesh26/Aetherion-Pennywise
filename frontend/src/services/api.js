import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Attach JWT token to every request ─────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// ─── Goals ───────────────────────────────────────────────
export const getGoals = () => API.get("/goals");
export const createGoal = (data) => API.post("/goals", data);
export const deleteGoal = (id) => API.delete(`/goals/${id}`);
export const buyGoal = (id) => API.post(`/goals/${id}/buy`);

// ─── Payments / Transactions ─────────────────────────────
export const makePayment = (data) => API.post("/pay", data);
export const getTransactions = () => API.get("/transactions");

// ─── AI Chat (Gemini) ────────────────────────────────────
export const askAI = (data) => API.post("/ai/ask", data);

// ─── Product Scraper ─────────────────────────────────────
export const fetchProduct = (data) => API.post("/product/fetch", data);

export default API;

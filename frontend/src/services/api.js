import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if available
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

// ─── Transactions / Round-Up ─────────────────────────────
export const getTransactions = () => API.get("/transactions");
export const addRoundUp = (data) => API.post("/transactions/roundup", data);

// ─── Dashboard ───────────────────────────────────────────
export const getDashboard = () => API.get("/dashboard");

// ─── AI Chat ─────────────────────────────────────────────
export const sendChatMessage = (data) => API.post("/chat", data);

export default API;

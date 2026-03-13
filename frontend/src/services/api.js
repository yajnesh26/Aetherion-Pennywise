import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendChatMessage = async (message, history = [], userId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
      message,
      history,
      userId // Passing userId to backend for context-aware AI
    });
    return response.data.response;
  } catch (error) {
    throw error;
  }
};

export const getSpendingAnalysis = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ai/spending-analysis/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching spending analysis:", error);
    throw error;
  }
};

export const getCoachingInsights = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ai/coaching/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coaching insights:", error);
    throw error;
  }
};

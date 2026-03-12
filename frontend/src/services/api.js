import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
      message,
      history,
    });
    return response.data.response;
  } catch (error) {
    console.error("Error communicating with backend AI:", error);
    throw error;
  }
};

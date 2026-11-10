import { apiRequest } from "./api";

export const askChatbot = (message: string) => apiRequest("/chatbot", "POST", { message });

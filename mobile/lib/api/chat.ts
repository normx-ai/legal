import { api } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  sources: {
    paragraphe: string;
    chapitre: string;
    titre: string;
    forme_juridique: string;
  }[];
}

export async function sendChatMessage(
  messages: ChatMessage[],
  options?: { forme_juridique?: string; chapitre?: string }
): Promise<ChatResponse> {
  const { data } = await api.post("/chat", {
    messages,
    forme_juridique: options?.forme_juridique,
    chapitre: options?.chapitre,
  });
  return data;
}

import { api } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  paragraphe: string;
  chapitre: string;
  titre: string;
  forme_juridique: string;
}

export interface ChatResponse {
  response: string;
  sources: ChatSource[];
  conversationId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
}

export async function sendChatMessage(
  messages: ChatMessage[],
  options?: { forme_juridique?: string; chapitre?: string; conversationId?: string }
): Promise<ChatResponse> {
  const { data } = await api.post("/chat", {
    messages,
    forme_juridique: options?.forme_juridique,
    chapitre: options?.chapitre,
    conversationId: options?.conversationId,
  });
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get("/conversations");
  return data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await api.get(`/conversations/${id}`);
  return data;
}

export async function createConversation(title?: string): Promise<Conversation> {
  const { data } = await api.post("/conversations", { title });
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/conversations/${id}`);
}

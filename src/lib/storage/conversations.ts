import type { Conversation, ConversationStorage, Message } from "@/types/chat";
import { generateId } from "@/lib/utils/helpers";
import { generateTitle } from "@/lib/utils/markdown";

const STORAGE_KEY = "ai-chatbot-conversations";

/**
 * Get all conversations from localStorage
 */
export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed: ConversationStorage = JSON.parse(data);
    return parsed.conversations || [];
  } catch (error) {
    console.error("Failed to load conversations:", error);
    return [];
  }
}

/**
 * Get a single conversation by ID
 */
export function getConversation(id: string): Conversation | null {
  const conversations = getConversations();
  return conversations.find((c) => c.id === id) || null;
}

/**
 * Save conversations to localStorage
 */
function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;

  try {
    const data: ConversationStorage = { conversations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save conversations:", error);
  }
}

/**
 * Create a new conversation
 */
export function createConversation(firstMessage?: string): Conversation {
  const conversation: Conversation = {
    id: generateId(),
    title: firstMessage ? generateTitle(firstMessage) : "New Conversation",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const conversations = getConversations();
  conversations.unshift(conversation);
  saveConversations(conversations);

  return conversation;
}

/**
 * Update a conversation
 */
export function updateConversation(
  id: string,
  updates: Partial<Omit<Conversation, "id" | "createdAt">>
): Conversation | null {
  const conversations = getConversations();
  const index = conversations.findIndex((c) => c.id === id);

  if (index === -1) return null;

  conversations[index] = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveConversations(conversations);
  return conversations[index];
}

/**
 * Add a message to a conversation
 */
export function addMessage(
  conversationId: string,
  message: Omit<Message, "id" | "createdAt">
): Conversation | null {
  const conversations = getConversations();
  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversation) return null;

  const newMessage: Message = {
    ...message,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date().toISOString();

  saveConversations(conversations);
  return conversation;
}

/**
 * Update a message in a conversation
 */
export function updateMessage(
  conversationId: string,
  messageId: string,
  updates: Partial<Omit<Message, "id" | "createdAt">>
): Conversation | null {
  const conversations = getConversations();
  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversation) return null;

  const messageIndex = conversation.messages.findIndex(
    (m) => m.id === messageId
  );
  if (messageIndex === -1) return null;

  conversation.messages[messageIndex] = {
    ...conversation.messages[messageIndex],
    ...updates,
  };

  conversation.updatedAt = new Date().toISOString();
  saveConversations(conversations);
  return conversation;
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  const conversations = getConversations();
  const filteredConversations = conversations.filter((c) => c.id !== id);

  if (filteredConversations.length === conversations.length) {
    return false; // Conversation not found
  }

  saveConversations(filteredConversations);
  return true;
}

/**
 * Rename a conversation
 */
export function renameConversation(
  id: string,
  title: string
): Conversation | null {
  return updateConversation(id, { title });
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Core chat type definitions
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationStorage {
  conversations: Conversation[];
}

export interface ChatRequest {
  messages: Message[];
  conversationId?: string;
}

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  content: string;
  reasoning?: string;
  done: boolean;
}

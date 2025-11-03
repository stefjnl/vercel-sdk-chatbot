/**
 * Core chat type definitions
 */

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  toolInvocations?: ToolInvocationResult[];
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

export type ToolInvocationState =
  | "partial-call"
  | "call"
  | "result"
  | "unknown";

export interface ToolInvocationResult {
  id: string;
  toolName: string;
  state: ToolInvocationState;
  args?: Record<string, unknown> | null;
  result?: unknown;
  isError?: boolean;
}

/**
 * LLM Model configuration
 */
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  maxTokens: number;
  default: boolean;
}

/**
 * LLM Models collection (from JSON file)
 */
export interface ModelsCollection {
  models: ModelConfig[];
}

/**
 * User's model preference (persisted)
 */
export interface ModelPreference {
  selectedModelId: string;
  lastUpdated: string;
}

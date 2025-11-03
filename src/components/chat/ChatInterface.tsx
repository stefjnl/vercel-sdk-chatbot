"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import type {
  Message,
  ToolInvocationResult,
  ToolInvocationState,
} from "@/types/chat";
import { getModelPreference, saveModelPreference } from "@/lib/storage/models";
import { generateId } from "@/lib/utils/helpers";

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

/**
 * Convert our persisted messages into UI messages for the AI SDK chat transport.
 */
function mapToUIChatMessages(messages: Message[]) {
  return messages.map((message) => {
    const parts: Array<Record<string, unknown>> = [];

    if (message.reasoning) {
      parts.push({ type: "reasoning", text: message.reasoning });
    }

    if (message.content) {
      parts.push({ type: "text", text: message.content });
    }

    return {
      id: message.id,
      role: message.role,
      parts: parts.length > 0 ? parts : [{ type: "text", text: "" }],
      createdAt: new Date(message.createdAt),
    };
  });
}

/**
 * Maps AI SDK messages back to our Message type
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeToolInvocations(
  invocations: unknown
): ToolInvocationResult[] | undefined {
  if (!Array.isArray(invocations) || invocations.length === 0) {
    return undefined;
  }

  const normalized = invocations
    .map((invocation): ToolInvocationResult | null => {
      if (!isRecord(invocation)) {
        return null;
      }

      const rawState = invocation.state;
      const state: ToolInvocationState =
        rawState === "partial-call" ||
        rawState === "call" ||
        rawState === "result"
          ? rawState
          : "unknown";

      const maybeArgs = invocation.args;
      const args = isRecord(maybeArgs)
        ? (maybeArgs as Record<string, unknown>)
        : null;
      const result = invocation.result;
      const inferredError =
        Boolean(invocation.isError) ||
        (isRecord(result) && typeof result.error === "string");

      const idCandidate =
        (typeof invocation.toolCallId === "string" && invocation.toolCallId) ||
        (typeof invocation.id === "string" && invocation.id) ||
        generateId();

      const toolName =
        (typeof invocation.toolName === "string" && invocation.toolName) ||
        (typeof invocation.name === "string" && invocation.name) ||
        "tool";

      return {
        id: idCandidate,
        toolName,
        state,
        args,
        result,
        isError: inferredError,
      } satisfies ToolInvocationResult;
    })
    .filter((value): value is ToolInvocationResult => value !== null);

  return normalized.length > 0 ? normalized : undefined;
}

function extractTextContent(message: Record<string, unknown>): {
  text: string;
  reasoning?: string;
} {
  const parts = Array.isArray(message.parts)
    ? message.parts
    : Array.isArray(message.content)
    ? message.content
    : undefined;
  if (parts) {
    const textParts: string[] = [];
    const reasoningParts: string[] = [];

    parts.forEach((part) => {
      if (!isRecord(part)) {
        return;
      }

      if (part.type === "text" && typeof part.text === "string") {
        textParts.push(part.text);
      }

      if (part.type === "reasoning" && typeof part.text === "string") {
        reasoningParts.push(part.text);
      }
    });

    return {
      text: textParts.join("\n\n"),
      reasoning:
        reasoningParts.length > 0 ? reasoningParts.join("\n") : undefined,
    };
  }

  if (typeof message.content === "string") {
    return { text: message.content };
  }

  return { text: "" };
}

function mapFromAISDKMessages(
  messages: Array<Record<string, unknown>>
): Message[] {
  return messages
    .filter(
      (m): m is typeof m & { role: "user" | "assistant" | "system" } =>
        m.role === "user" || m.role === "assistant" || m.role === "system"
    )
    .map((m) => {
      const toolInvocations = normalizeToolInvocations(m.toolInvocations);
      const { text, reasoning } = extractTextContent(m);
      const fallbackId = typeof m.id === "string" ? m.id : generateId();

      return {
        id: fallbackId,
        role: m.role,
        content: text,
        reasoning:
          reasoning ??
          (typeof m.reasoning === "string" ? m.reasoning : undefined),
        ...(toolInvocations ? { toolInvocations } : {}),
        createdAt:
          m.createdAt instanceof Date
            ? m.createdAt.toISOString()
            : typeof m.createdAt === "string"
            ? m.createdAt
            : new Date().toISOString(),
      };
    });
}

function computeMessagesHash(messages: Message[]): string {
  try {
    return JSON.stringify(
      messages.map(({ createdAt: _createdAt, ...rest }) => rest)
    );
  } catch (error) {
    console.warn("Failed to hash messages for persistence", error);
    return "";
  }
}

/**
 * Main chat interface with Vercel AI SDK integration and model selection
 */
export function ChatInterface({
  conversationId: _conversationId,
  initialMessages = [],
  onMessagesChange,
}: ChatInterfaceProps) {
  // Model state management
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Load saved model preference on mount (client-side only)
  useEffect(() => {
    const savedModel = getModelPreference();
    setSelectedModelId(savedModel);
    setModelLoaded(true);
  }, []);

  // Handle model selection change
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    saveModelPreference(modelId);
  };
  const initialUiMessages = useMemo(
    () => mapToUIChatMessages(initialMessages),
    [initialMessages]
  );

  const initialMessagesHash = useMemo(
    () => computeMessagesHash(initialMessages),
    [initialMessages]
  );

  const lastPersistedMessagesHashRef = useRef<string>(initialMessagesHash);

  useEffect(() => {
    lastPersistedMessagesHashRef.current = initialMessagesHash;
  }, [initialMessagesHash]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () =>
          selectedModelId
            ? { "x-model-id": selectedModelId }
            : ({} as Record<string, string>),
      }),
    [selectedModelId]
  );

  const chat = useChat({
    ...(_conversationId ? { id: _conversationId } : {}),
    messages: initialUiMessages as unknown as any[],
    transport,
  });

  const { messages: uiMessages, sendMessage, stop, status } = chat;

  const mappedMessages = useMemo(
    () =>
      mapFromAISDKMessages(
        uiMessages as unknown as Array<Record<string, unknown>>
      ),
    [uiMessages]
  );

  const mappedMessagesHash = useMemo(
    () => computeMessagesHash(mappedMessages),
    [mappedMessages]
  );

  useEffect(() => {
    if (!onMessagesChange) return;
    if (status === "streaming") return;

    if (mappedMessagesHash === lastPersistedMessagesHashRef.current) {
      return;
    }

    onMessagesChange(mappedMessages);
    lastPersistedMessagesHashRef.current = mappedMessagesHash;
  }, [mappedMessages, mappedMessagesHash, onMessagesChange, status]);

  const isLoading = status === "streaming";

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) {
        return;
      }

      const outgoingMessage = {
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      };

      setInputValue("");
      void sendMessage(
        outgoingMessage as unknown as Parameters<typeof sendMessage>[0]
      );
    },
    [inputValue, sendMessage]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={mappedMessages} isStreaming={isLoading} />
      </div>

      {/* Input with Model Selector */}
      {modelLoaded && (
        <MessageInput
          input={inputValue}
          isLoading={isLoading}
          selectedModelId={selectedModelId}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onModelChange={handleModelChange}
          onStop={stop}
        />
      )}
    </div>
  );
}

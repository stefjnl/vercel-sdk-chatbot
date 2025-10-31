'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Message } from '@/types/chat';
import {
  getModelPreference,
  saveModelPreference,
} from '@/lib/storage/models';

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

/**
 * Maps our Message type to AI SDK compatible format
 */
function mapToAISDKMessages(messages: Message[]) {
  return messages.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));
}

/**
 * Maps AI SDK messages back to our Message type
 */
function mapFromAISDKMessages(messages: Array<{
  id: string;
  role: string;
  content: string;
  reasoning?: string;
  createdAt?: Date | string;
}>): Message[] {
  return messages
    .filter((m): m is typeof m & { role: 'user' | 'assistant' | 'system' } => 
      m.role === 'user' || m.role === 'assistant' || m.role === 'system'
    )
    .map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      reasoning: m.reasoning,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date().toISOString(),
    }));
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
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [modelLoaded, setModelLoaded] = useState(false);

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
  // Memoize mapped initial messages to prevent unnecessary re-renders
  const mappedInitialMessages = useMemo(
    () => mapToAISDKMessages(initialMessages),
    [initialMessages]
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: '/api/chat',
    initialMessages: mappedInitialMessages,
    headers: selectedModelId
      ? { 'x-model-id': selectedModelId }
      : {},
    onFinish: () => {
      // Notify parent component of message updates after streaming completes
      if (onMessagesChange) {
        const mappedMessages = mapFromAISDKMessages(messages);
        onMessagesChange(mappedMessages);
      }
    },
  });

  // Memoize mapped messages to prevent unnecessary re-renders in MessageList
  const mappedMessages = useMemo(
    () => mapFromAISDKMessages(messages),
    [messages]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={mappedMessages}
          isStreaming={isLoading}
        />
      </div>

      {/* Input with Model Selector */}
      {modelLoaded && (
        <MessageInput
          input={input}
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

'use client';

import React from 'react';
import { useChat } from 'ai/react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Message } from '@/types/chat';

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

/**
 * Main chat interface with Vercel AI SDK integration
 */
export function ChatInterface({
  conversationId: _conversationId,
  initialMessages = [],
  onMessagesChange,
}: ChatInterfaceProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: '/api/chat',
    initialMessages: initialMessages as never[],
    onFinish: () => {
      // Notify parent component of message updates after streaming completes
      if (onMessagesChange) {
        // Map AI SDK messages to our Message type
        const mappedMessages: Message[] = messages
          .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
          .map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            createdAt: m.createdAt?.toISOString() || new Date().toISOString(),
          }));
        onMessagesChange(mappedMessages);
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages as unknown as Message[]}
          isStreaming={isLoading}
        />
      </div>

      {/* Input */}
      <MessageInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import type { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
  isStreaming?: boolean;
}

/**
 * Message list with auto-scroll functionality
 */
export function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to AI Chatbot</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Start a conversation by typing your message below.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          <ExamplePrompt
            title="Explain a concept"
            prompt="Explain quantum computing in simple terms"
          />
          <ExamplePrompt
            title="Write code"
            prompt="Write a Python function to calculate fibonacci numbers"
          />
          <ExamplePrompt
            title="Creative writing"
            prompt="Write a short story about a time traveler"
          />
          <ExamplePrompt
            title="Problem solving"
            prompt="How can I improve my productivity?"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {messages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

/**
 * Example prompt card component
 */
function ExamplePrompt({ title, prompt }: { title: string; prompt: string }) {
  return (
    <button
      className="p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
      onClick={() => {
        const input = document.querySelector('textarea');
        if (input) {
          input.value = prompt;
          input.focus();
        }
      }}
    >
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{prompt}</p>
    </button>
  );
}

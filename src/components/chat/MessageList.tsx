'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { Card } from '@/components/ui/card';
import { Sparkles, Code, Lightbulb, MessageCircle } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full px-4 py-8">
        <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Start a Conversation</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose an example below or type your own message to begin
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExamplePrompt
              icon={<Lightbulb className="h-5 w-5" />}
              title="Explain a concept"
              prompt="Explain quantum computing in simple terms"
              gradient="from-blue-500 to-cyan-500"
            />
            <ExamplePrompt
              icon={<Code className="h-5 w-5" />}
              title="Write code"
              prompt="Write a Python function to calculate fibonacci numbers"
              gradient="from-purple-500 to-pink-500"
            />
            <ExamplePrompt
              icon={<Sparkles className="h-5 w-5" />}
              title="Creative writing"
              prompt="Write a short story about a time traveler"
              gradient="from-orange-500 to-red-500"
            />
            <ExamplePrompt
              icon={<MessageCircle className="h-5 w-5" />}
              title="Problem solving"
              prompt="How can I improve my productivity?"
              gradient="from-green-500 to-emerald-500"
            />
          </div>
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
function ExamplePrompt({ 
  icon, 
  title, 
  prompt, 
  gradient 
}: { 
  icon: React.ReactNode;
  title: string; 
  prompt: string;
  gradient: string;
}) {
  return (
    <Card
      className="p-5 text-left cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 group"
      onClick={() => {
        const input = document.querySelector('textarea');
        if (input) {
          input.value = prompt;
          input.focus();
        }
      }}
    >
      <div className="space-y-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
        </div>
      </div>
    </Card>
  );
}

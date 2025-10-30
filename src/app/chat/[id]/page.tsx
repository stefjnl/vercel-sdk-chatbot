'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { getConversation, updateConversation } from '@/lib/storage/conversations';
import type { Message, Conversation } from '@/types/chat';

/**
 * Individual chat page
 */
export default function ChatPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conversationId) {
      const conv = getConversation(conversationId);
      setConversation(conv);
      setLoading(false);
    }
  }, [conversationId]);

  const handleMessagesChange = (messages: Message[]) => {
    if (conversationId) {
      updateConversation(conversationId, { messages });
      setConversation((prev) => (prev ? { ...prev, messages } : null));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Conversation not found</h2>
          <p className="text-muted-foreground">
            This conversation may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      conversationId={conversationId}
      initialMessages={conversation.messages}
      onMessagesChange={handleMessagesChange}
    />
  );
}

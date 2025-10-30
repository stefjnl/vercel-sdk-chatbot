'use client';

import React from 'react';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

/**
 * List of conversations in the sidebar
 */
export function ConversationList({
  conversations,
  onDelete,
  onRename,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          No conversations yet. Start a new chat to begin!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}

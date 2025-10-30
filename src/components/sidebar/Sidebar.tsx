'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Menu, X } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  getConversations,
  createConversation,
  deleteConversation,
  renameConversation,
} from '@/lib/storage/conversations';
import type { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils/helpers';

/**
 * Sidebar with conversation management
 */
export function Sidebar() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    setConversations(getConversations());
  }, []);

  const handleNewChat = () => {
    const newConversation = createConversation();
    setConversations([newConversation, ...conversations]);
    router.push(`/chat/${newConversation.id}`);
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
    setConversations(conversations.filter((c) => c.id !== id));
  };

  const handleRename = (id: string, title: string) => {
    renameConversation(id, title);
    setConversations(
      conversations.map((c) => (c.id === id ? { ...c, title } : c))
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-72 border-r bg-background transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-bold">AI Chatbot</h1>
            <ThemeToggle />
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={handleNewChat}
              className="w-full"
              variant="outline"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Powered by NanoGPT
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

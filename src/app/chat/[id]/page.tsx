"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSkeleton } from "@/components/chat/ChatSkeleton";
import {
  getConversation,
  updateConversation,
} from "@/lib/storage/conversations";
import type { Message, Conversation } from "@/types/chat";

/**
 * Individual chat page
 * Loads conversation data and displays the chat interface
 * Shows skeleton loader while conversation is being fetched
 */
export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      try {
        const conv = getConversation(conversationId);
        if (!conv) {
          setError("Conversation not found");
        } else {
          setConversation(conv);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load conversation");
        console.error("Error loading conversation:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [conversationId]);

  const handleMessagesChange = (messages: Message[]) => {
    if (conversationId) {
      try {
        // Check if this is the first assistant response and title needs updating
        const firstUserMessage = messages.find((m) => m.role === "user");
        const firstAssistantMessage = messages.find(
          (m) => m.role === "assistant"
        );

        if (
          firstUserMessage &&
          firstAssistantMessage &&
          conversation?.title === "New Conversation"
        ) {
          // Auto-rename after first complete back-and-forth
          const { generateTitle } = require("@/lib/utils/markdown");
          const newTitle = generateTitle(firstUserMessage.content);
          updateConversation(conversationId, { messages, title: newTitle });
          setConversation((prev) =>
            prev ? { ...prev, messages, title: newTitle } : null
          );
        } else {
          updateConversation(conversationId, { messages });
          setConversation((prev) => (prev ? { ...prev, messages } : null));
        }
      } catch (err) {
        console.error("Error updating conversation:", err);
        setError("Failed to save messages");
      }
    }
  };

  // Show skeleton loader while data is loading
  if (loading) {
    return <ChatSkeleton />;
  }

  // Show error state
  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {error || "Conversation not found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error === "Conversation not found"
              ? "This conversation may have been deleted."
              : "There was an error loading this conversation."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
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

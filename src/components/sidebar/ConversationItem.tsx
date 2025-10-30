'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MoreVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import type { Conversation } from '@/types/chat';
import { formatTimestamp, cn } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface ConversationItemProps {
  conversation: Conversation;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

/**
 * Individual conversation item in the sidebar
 */
export function ConversationItem({
  conversation,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const isActive = pathname === `/chat/${conversation.id}`;

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors',
        isActive && 'bg-accent'
      )}
    >
      {isEditing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') handleCancel();
            }}
            className="h-8 flex-1"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleRename}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Link
            href={`/chat/${conversation.id}`}
            className="flex-1 truncate text-sm"
          >
            {conversation.title}
          </Link>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(conversation.updatedAt)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    if (confirm('Delete this conversation?')) {
                      onDelete(conversation.id);
                      if (isActive) {
                        router.push('/');
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
}

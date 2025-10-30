'use client';

import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/helpers';

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop?: () => void;
}

/**
 * Message input with auto-resize and keyboard shortcuts
 */
export function MessageInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onStop,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const characterCount = input.length;
  const maxCharacters = 4000;

  return (
    <form
      onSubmit={onSubmit}
      className="border-t bg-background p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={isLoading}
              className={cn(
                'min-h-[60px] max-h-[200px] resize-none pr-12',
                'focus-visible:ring-1'
              )}
              rows={1}
            />
            {characterCount > 0 && (
              <div
                className={cn(
                  'absolute bottom-2 right-2 text-xs',
                  characterCount > maxCharacters
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {characterCount}/{maxCharacters}
              </div>
            )}
          </div>

          {isLoading && onStop ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStop}
              aria-label="Stop generation"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || characterCount > maxCharacters}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

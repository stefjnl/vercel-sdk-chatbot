'use client';

import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from './ModelSelector';
import { cn } from '@/lib/utils/helpers';

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  selectedModelId: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onModelChange: (modelId: string) => void;
  onStop?: () => void;
}

/**
 * Message input with auto-resize, keyboard shortcuts, and model selector
 */
export function MessageInput({
  input,
  isLoading,
  selectedModelId,
  onInputChange,
  onSubmit,
  onModelChange,
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
      className="border-t bg-background/95 backdrop-blur-sm p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Model Selector */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Model:
          </span>
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelChange={onModelChange}
            showDescription={false}
            disabled={isLoading}
          />
        </div>

        {/* Message Input */}
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={isLoading}
              className={cn(
                'min-h-[60px] max-h-[200px] resize-none pr-12 border-2',
                'focus-visible:ring-2 focus-visible:ring-primary/20',
                'rounded-2xl shadow-sm'
              )}
              rows={1}
            />
            {characterCount > 0 && (
              <div
                className={cn(
                  'absolute bottom-3 right-3 text-xs font-medium',
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
              className="h-11 w-11 rounded-xl shadow-md"
            >
              <Square className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || characterCount > maxCharacters}
              aria-label="Send message"
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for chat interface
 * Displays placeholder UI while chat is loading to prevent layout shift
 */
export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Message List Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* AI Message Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>

        {/* User Message Skeleton */}
        <div className="flex gap-4 justify-end">
          <div className="flex-1 space-y-2 max-w-xs">
            <Skeleton className="h-4 w-full ml-auto" />
            <Skeleton className="h-4 w-3/4 ml-auto" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        </div>

        {/* AI Message Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <Skeleton className="flex-1 h-14 rounded-2xl" />
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

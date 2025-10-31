'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ModelConfig } from '@/types/chat';
import { loadModels, findModelById } from '@/lib/models/loader';
import { cn } from '@/lib/utils/helpers';

export interface ModelSelectorProps {
  /**
   * Currently selected model ID
   */
  selectedModelId: string;
  /**
   * Called when model selection changes
   */
  onModelChange: (modelId: string) => void;
  /**
   * Optional CSS class for styling
   */
  className?: string;
  /**
   * Whether to show model descriptions on hover
   */
  showDescription?: boolean;
  /**
   * Disable the selector
   */
  disabled?: boolean;
}

/**
 * ModelSelector component - Dropdown for LLM model selection
 *
 * Features:
 * - Dynamic model loading from models.json
 * - Comprehensive error handling with fallback models
 * - Loading states and error indicators
 * - ARIA attributes for accessibility
 * - Responsive design with tooltip support
 * - Model capability badges
 * - Input validation
 */
export function ModelSelector({
  selectedModelId,
  onModelChange,
  className,
  showDescription = true,
  disabled = false,
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load models on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeModels() {
      setIsLoading(true);
      setError(null);

      const { models: loadedModels, error: loadError } = await loadModels();

      if (isMounted) {
        console.log('ModelSelector: Loaded models:', loadedModels);
        setModels(loadedModels);
        if (loadError) {
          setError(loadError);
          console.warn('ModelSelector:', loadError);
        }
        setIsLoading(false);
      }
    }

    initializeModels();

    return () => {
      isMounted = false;
    };
  }, []);

  // Validate selected model exists
  const selectedModel = selectedModelId
    ? findModelById(models, selectedModelId)
    : models[0];

  // Handle model selection with validation
  const handleModelSelect = useCallback(
    (modelId: string) => {
      if (!models.some((m) => m.id === modelId)) {
        console.warn(`ModelSelector: Invalid model ID selected: ${modelId}`);
        return;
      }
      onModelChange(modelId);
      setIsOpen(false);
    },
    [models, onModelChange]
  );

  // Display name for trigger button
  const triggerLabel = selectedModel?.name || 'Select Model';

  // Loading state
  if (isLoading) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn('w-full sm:w-auto gap-2', className)}
        aria-label="Loading models"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    );
  }

  // Error state with fallback UI
  if (models.length === 0) {
    return (
      <Button
        variant="destructive"
        disabled
        className={cn('w-full sm:w-auto gap-2', className)}
        aria-label="Error loading models"
      >
        <AlertCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Models unavailable</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button - Use Radix UI DropdownMenuTrigger */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || isLoading}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Select LLM model. Currently selected: ${triggerLabel}`}
          className={cn(
            'inline-flex items-center justify-between rounded-md border border-input',
            'bg-background px-3 py-2 text-sm font-medium',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'gap-2 w-full sm:w-auto',
            error && 'border-destructive/50',
            className
          )}
        >
          <span className="truncate flex-1 sm:flex-none">{triggerLabel}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent
        align="start"
        className="w-full sm:w-64 max-h-[60vh] overflow-y-auto"
        role="listbox"
      >
        {/* Error Banner */}
        {error && (
          <>
            <div className="px-2 py-2 text-xs text-muted-foreground flex items-start gap-2 border-b">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <span>{error}</span>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Model Selection Group */}
        <DropdownMenuLabel className="font-semibold">
          LLM Models
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={selectedModel?.id || ''}
          onValueChange={handleModelSelect}
        >
          {models.map((model) => (
            <div key={model.id} className="relative">
              <DropdownMenuRadioItem
                value={model.id}
                role="option"
                aria-selected={selectedModel?.id === model.id}
                aria-label={`${model.name} - ${model.description}`}
                className="flex flex-col items-start py-2 px-2 cursor-pointer"
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{model.name}</div>
                    {showDescription && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {model.description}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {model.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                        >
                          {cap}
                        </span>
                      ))}
                      {model.capabilities.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground">
                          +{model.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Max tokens: {model.maxTokens.toLocaleString()}
                    </div>
                  </div>
                </div>
              </DropdownMenuRadioItem>
            </div>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>

      {/* Hidden error message for screen readers */}
      {error && (
        <div className="sr-only" role="alert">
          Warning: {error}
        </div>
      )}
    </DropdownMenu>
  );
}

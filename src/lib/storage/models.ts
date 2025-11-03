import type { ModelPreference } from '@/types/chat';
import { DEFAULT_MODEL } from '@/lib/api/nanogpt';
import { FALLBACK_MODELS } from '@/lib/models/constants';

const STORAGE_KEY = 'ai-chatbot-model-preference';

/**
 * Get user's saved model preference from localStorage
 * Returns DEFAULT_MODEL if none saved
 */
export function getModelPreference(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_MODEL;

    const preference: ModelPreference = JSON.parse(data);
    const candidate = preference.selectedModelId;

    const isSupported = FALLBACK_MODELS.some(
      (model) => model.id === candidate
    );

    return isSupported && candidate ? candidate : DEFAULT_MODEL;
  } catch (error) {
    console.error('Failed to load model preference:', error);
    return DEFAULT_MODEL;
  }
}

/**
 * Save user's model preference to localStorage
 */
export function saveModelPreference(modelId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const preference: ModelPreference = {
      selectedModelId: modelId,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.error('Failed to save model preference:', error);
  }
}

/**
 * Clear saved model preference (reset to default)
 */
export function clearModelPreference(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear model preference:', error);
  }
}

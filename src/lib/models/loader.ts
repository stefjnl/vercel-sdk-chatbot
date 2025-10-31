import type { ModelConfig, ModelsCollection } from '@/types/chat';
import { FALLBACK_MODELS } from './constants';

/**
 * Validates a ModelConfig object has required fields
 */
function isValidModelConfig(model: unknown): model is ModelConfig {
  if (typeof model !== 'object' || model === null) {
    return false;
  }

  const m = model as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    m.id.length > 0 &&
    typeof m.name === 'string' &&
    m.name.length > 0 &&
    typeof m.description === 'string' &&
    Array.isArray(m.capabilities) &&
    typeof m.maxTokens === 'number' &&
    m.maxTokens > 0 &&
    typeof m.default === 'boolean'
  );
}

/**
 * Validates the entire ModelsCollection structure
 */
function isValidModelsCollection(data: unknown): data is ModelsCollection {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const collection = data as Record<string, unknown>;
  return (
    Array.isArray(collection.models) &&
    collection.models.length > 0 &&
    collection.models.every(isValidModelConfig)
  );
}

/**
 * Loads and validates models from the JSON file
 * Returns fallback models if loading fails
 */
export async function loadModels(): Promise<{
  models: ModelConfig[];
  error?: string;
}> {
  try {
    const response = await fetch('/models.json', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(
        `Failed to fetch models.json: ${response.status} ${response.statusText}`
      );
      return {
        models: FALLBACK_MODELS,
        error: `Failed to load models: HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (!isValidModelsCollection(data)) {
      console.warn('Loaded models.json has invalid structure', data);
      console.warn('Models received:', data.models);
      // If validation fails, return the models anyway with a warning
      // This handles cases where the JSON structure is valid but our validation is too strict
      if (Array.isArray(data.models) && data.models.length > 0) {
        const filteredModels = data.models.filter(isValidModelConfig);
        if (filteredModels.length > 0) {
          console.warn('Returning only valid models from JSON despite overall validation failure');
          return { 
            models: filteredModels,
            error: 'Models validation warning: some models were filtered out',
          };
        }
      }
      return {
        models: FALLBACK_MODELS,
        error: 'Models configuration is malformed',
      };
    }

    return { models: data.models };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading models.json:', errorMessage);

    return {
      models: FALLBACK_MODELS,
      error: `Failed to load models: ${errorMessage}`,
    };
  }
}

/**
 * Finds a model by ID from a collection
 * Returns undefined if not found
 */
export function findModelById(
  models: ModelConfig[],
  modelId: string
): ModelConfig | undefined {
  return models.find((m) => m.id === modelId);
}

/**
 * Gets the default model from a collection
 */
export function getDefaultModel(models: ModelConfig[]): ModelConfig {
  if (models.length === 0) {
    throw new Error('getDefaultModel: models array is empty');
  }
  const defaultModel = models.find((m) => m.default);
  return defaultModel || models[0];
}

/**
 * Validates if a model ID exists in the collection
 */
export function isValidModelId(models: ModelConfig[], modelId: string): boolean {
  return models.some((m) => m.id === modelId);
}

/**
 * Filters models by capability
 */
export function filterModelsByCapability(
  models: ModelConfig[],
  capability: string
): ModelConfig[] {
  return models.filter((m) => m.capabilities.includes(capability));
}

/**
 * Resolves the effective model ID (validates selection, falls back to default)
 */
export function resolveModelId(
  models: ModelConfig[],
  selectedId?: string
): string {
  if (selectedId && isValidModelId(models, selectedId)) {
    return selectedId;
  }

  const defaultModel = getDefaultModel(models);
  return defaultModel.id;
}

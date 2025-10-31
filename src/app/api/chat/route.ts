import { streamText } from 'ai';
import { nanogpt, DEFAULT_MODEL, validateApiKey } from '@/lib/api/nanogpt';
import { isValidModelId } from '@/lib/models/loader';
import { FALLBACK_MODELS } from '@/lib/models/constants';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 30;

/**
 * POST /api/chat
 *
 * Handles streaming chat completions using Vercel AI SDK.
 * Accepts messages array and streams responses from NanoGPT.
 *
 * Headers:
 * - x-model-id: Selected LLM model ID (optional, validates and falls back to DEFAULT_MODEL)
 */
export async function POST(req: Request) {
  try {
    // Validate API key
    const validation = validateApiKey();
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { messages } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Extract and validate model ID from request header
    const modelId = req.headers.get('x-model-id');
    const selectedModel = validateModelId(modelId);

    // Stream response from NanoGPT with selected model
    const result = await streamText({
      model: nanogpt(selectedModel),
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return streaming response with proper headers
    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * Validates the model ID from request header
 * Falls back to DEFAULT_MODEL if invalid or missing
 */
function validateModelId(modelId: string | null): string {
  if (!modelId) {
    return DEFAULT_MODEL;
  }

  // Check if model ID is valid (exists in FALLBACK_MODELS)
  if (isValidModelId(FALLBACK_MODELS, modelId)) {
    return modelId;
  }

  console.warn(`Invalid model ID requested: ${modelId}, using default`);
  return DEFAULT_MODEL;
}

import { createOpenAI } from '@ai-sdk/openai';

/**
 * NanoGPT API provider configuration using OpenAI SDK adapter
 * 
 * Endpoint: https://nano-gpt.com/api/v1
 * Default Model: openai/gpt-oss-120b
 * 
 * This provider supports reasoning tokens via delta.reasoning in the stream.
 */
export const nanogpt = createOpenAI({
  name: 'nanogpt',
  baseURL: 'https://nano-gpt.com/api/v1',
  apiKey: process.env.NANOGPT_API_KEY || '',
});

/**
 * Default model for NanoGPT
 */
export const DEFAULT_MODEL = 'openai/gpt-oss-120b';

/**
 * Validate NanoGPT API key is configured
 */
export function validateApiKey(): { valid: boolean; error?: string } {
  const apiKey = process.env.NANOGPT_API_KEY;

  if (!apiKey) {
    return {
      valid: false,
      error: 'NANOGPT_API_KEY is not configured. Please add it to your .env file.',
    };
  }

  if (apiKey === 'your_nanogpt_api_key_here') {
    return {
      valid: false,
      error: 'Please replace the placeholder NANOGPT_API_KEY with your actual API key.',
    };
  }

  return { valid: true };
}

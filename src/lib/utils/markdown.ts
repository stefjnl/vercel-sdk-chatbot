/**
 * Markdown utility functions
 */

/**
 * Check if text contains markdown formatting
 */
export function hasMarkdown(text: string): boolean {
  const markdownPatterns = [
    /#{1,6}\s/, // Headers
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /\[.*\]\(.*\)/, // Links
    /```[\s\S]*```/, // Code blocks
    /`.*`/, // Inline code
    /^\s*[-*+]\s/, // Lists
    /^\s*\d+\.\s/, // Numbered lists
    /^\s*>\s/, // Blockquotes
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Extract code blocks from markdown
 */
export function extractCodeBlocks(markdown: string): Array<{
  language: string;
  code: string;
}> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
  }

  return blocks;
}

/**
 * Sanitize markdown to prevent XSS
 */
export function sanitizeMarkdown(markdown: string): string {
  // Remove potentially dangerous HTML tags
  const dangerousTags = /<script|<iframe|<object|<embed|<link|<style/gi;
  return markdown.replace(dangerousTags, '');
}

/**
 * Generate title from first user message
 */
export function generateTitle(message: string, maxLength = 50): string {
  // Remove markdown formatting
  let title = message
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .trim();

  // Truncate to first sentence or max length
  const firstSentence = title.match(/^[^.!?]+[.!?]/);
  if (firstSentence) {
    title = firstSentence[0];
  }

  if (title.length > maxLength) {
    title = title.substring(0, maxLength).trim();
    // Avoid cutting in the middle of a word
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      title = title.substring(0, lastSpace);
    }
    title += '...';
  }

  return title || 'New Conversation';
}

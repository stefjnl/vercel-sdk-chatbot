
# Complete Production-Ready AI Chatbot with Vercel AI SDK

Create a fully functional, production-ready AI chatbot application using **Vercel AI SDK**, TypeScript, Next.js 14+ (App Router). The application must work immediately after setup with no additional coding required, featuring a polished interface matching Claude/Gemini quality standards.

═══════════════════════════════════════════════════════════════════

## TECHNICAL STACK

**Core Framework:**
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Shadcn/ui components

**AI Integration:**
- Vercel AI SDK (`ai` package)
- `@ai-sdk/openai-compatible` for custom provider
- NanoGPT API (OpenAI-compatible endpoint)

**Deployment:**
- Docker containerization

═══════════════════════════════════════════════════════════════════

## NANOGPT API CONFIGURATION

**Endpoint:** `https://api.nano-gpt.com/v1`  
**Authentication:** Bearer token

see "C:\git\vercel-sdk-chatbot\nanogpt-request-flow.md" document for further details

**Integration Approach:**
Use `@ai-sdk/openai-compatible` to create custom provider:

```typescript
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const nanogpt = createOpenAICompatible({
  name: 'nanogpt',
  baseURL: 'https://api.nano-gpt.com/v1',
  apiKey: process.env.NANOGPT_API_KEY,
});
```

**Supported Models:** `gpt-4o`, `gpt-4o-mini`

═══════════════════════════════════════════════════════════════════

## CORE FEATURES

**Chat Functionality:**
1. Real-time streaming responses using `streamText()`
2. Conversation history with localStorage persistence
3. Multiple conversation threads
4. New/delete/rename chat operations
5. Markdown rendering with syntax highlighting
6. Copy code button for code blocks
7. Auto-scroll to latest message
8. Typing indicators during streaming
9. Message regeneration capability

**UI/UX:**
10. Mobile-responsive with collapsible sidebar
11. Dark/light theme toggle with system preference detection
12. Empty states with example prompts
13. Loading states and skeleton loaders
14. Smooth transitions and animations

═══════════════════════════════════════════════════════════════════

## PROJECT STRUCTURE

```
/app
  /api
    /chat
      route.ts              # Route handler using streamText()
  /chat
    /[id]
      page.tsx              # Individual chat page
  layout.tsx                # Root layout with providers
  page.tsx                  # Home/redirect

/components
  /chat
    ChatInterface.tsx       # Main chat container
    MessageList.tsx         # Messages display
    MessageInput.tsx        # Input with auto-resize
    Message.tsx             # Individual message component
  /sidebar
    Sidebar.tsx             # Conversation sidebar
    ConversationList.tsx
    ConversationItem.tsx
  /ui
    # Shadcn components

/lib
  /api
    nanogpt.ts              # NanoGPT provider setup
  /storage
    conversations.ts        # localStorage operations
  /utils
    markdown.ts             # Markdown utilities
    
/types
  chat.ts                   # TypeScript interfaces
```

═══════════════════════════════════════════════════════════════════

## VERCEL AI SDK IMPLEMENTATION

### Route Handler (`/app/api/chat/route.ts`)

**Requirements:**
- Use `streamText()` from `ai` package
- Accept POST requests with `messages` array
- Return `toDataStreamResponse()` for streaming
- Handle errors with proper HTTP status codes
- Set `maxDuration` for edge runtime

**Implementation Pattern:**
```typescript
import { streamText } from 'ai';
import { nanogpt } from '@/lib/api/nanogpt';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: nanogpt('gpt-4o'),
    messages,
    temperature: 0.7,
    maxTokens: 2000,
  });
  
  return result.toDataStreamResponse();
}
```

### Frontend Hook (`useChat`)

**Requirements:**
- Import from `@ai-sdk/react`
- Manages message state automatically
- Handles streaming updates
- Provides input handling utilities

**Implementation Pattern:**
```typescript
'use client';
import { useChat } from '@ai-sdk/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  
  // Component implementation
}
```

═══════════════════════════════════════════════════════════════════

## CONVERSATION STORAGE

**Schema (localStorage):**
```typescript
{
  conversations: [
    {
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
      messages: Message[];
    }
  ]
}
```

**Operations:**
- Auto-generate title from first user message (max 50 chars)
- Save after each message exchange
- Load on mount with error recovery
- Delete/rename functionality

═══════════════════════════════════════════════════════════════════

## UI/UX SPECIFICATIONS

**Layout:**
- Sidebar: 280px (collapsible on mobile)
- Main chat area with fixed input at bottom
- Responsive breakpoints: 640px, 768px, 1024px

**Message Design:**
- User messages: right-aligned, colored background
- AI messages: left-aligned, neutral background
- Avatar indicators for user/assistant
- Timestamp on hover
- Actions: Copy, Regenerate (AI only)

**Input Field:**
- Multi-line textarea with auto-resize (max 200px)
- Enter to send, Shift+Enter for new line
- Send button (disabled when empty/loading)
- Stop generation button during streaming
- Character/token count indicator

**Empty State:**
- Welcome message
- 4-6 example prompt cards
- Clear call-to-action

**Loading States:**
- Skeleton loaders for messages
- Pulsing dot indicator during streaming
- Smooth fade transitions

═══════════════════════════════════════════════════════════════════

## REQUIRED DEPENDENCIES

**package.json must include:**
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "ai": "^4.0.0",
    "@ai-sdk/openai-compatible": "^1.0.0",
    "@ai-sdk/react": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.0.0",
    "uuid": "^11.0.0",
    "date-fns": "^4.0.0",
    "zod": "^3.23.0"
  }
}
```

═══════════════════════════════════════════════════════════════════

## CONFIGURATION FILES

**1. next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
export default nextConfig;
```

**2. tsconfig.json**
- `strict: true`
- Path aliases: `@/*` → `./src/*`
- Target: ES2022

**3. tailwind.config.ts**
- Shadcn/ui preset
- Dark mode: 'class'
- Custom colors for chat themes

**4. .env.example**
```
NANOGPT_API_KEY=your_nanogpt_api_key_here
```

═══════════════════════════════════════════════════════════════════

## DOCKER CONFIGURATION

**Dockerfile:**
- Multi-stage build (dependencies → builder → runner)
- Node.js 20 Alpine base
- Build Next.js standalone output
- Non-root user
- Expose port 3000
- Health check on `/api/health`

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  ai-chatbot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NANOGPT_API_KEY=${NANOGPT_API_KEY}
    restart: unless-stopped
```

**Commands:**
```bash
docker build -t ai-chatbot .
docker-compose up -d
```

═══════════════════════════════════════════════════════════════════

## ERROR HANDLING

**API Route:**
- Validate API key presence
- Catch network failures
- Handle rate limiting (429)
- Parse errors gracefully
- Return user-friendly error messages

**Frontend:**
- Display error messages in chat
- Retry button for failed messages
- Connection loss detection
- Fallback UI for missing data

═══════════════════════════════════════════════════════════════════

## PERFORMANCE OPTIMIZATIONS

**Required:**
- React.memo for message components
- Virtualized list for 100+ messages
- Debounced input (300ms)
- Code splitting for markdown renderer
- Lazy load conversation history
- Optimistic UI updates

═══════════════════════════════════════════════════════════════════

## CODE QUALITY STANDARDS

**Must implement:**
- TypeScript strict mode (no `any`)
- ESLint with Next.js config
- Proper error boundaries
- ARIA labels for accessibility
- Semantic HTML
- Single responsibility per component
- Consistent naming conventions
- JSDoc comments for utilities

═══════════════════════════════════════════════════════════════════

## MARKDOWN RENDERING

**Requirements:**
- Use `react-markdown` with `remark-gfm`
- Syntax highlighting with `react-syntax-highlighter`
- Copy button for code blocks
- Support: tables, lists, links, images, inline code
- Sanitize HTML output

**Code Block Component:**
```typescript
- Language indicator badge
- Copy to clipboard button
- Line numbers (optional)
- Theme matches app theme
```

═══════════════════════════════════════════════════════════════════

## DOCUMENTATION

**README.md must include:**

1. **Quick Start**
   ```bash
   npm install
   cp .env.example .env
   # Add NANOGPT_API_KEY to .env
   npm run dev
   ```

2. **Docker Deployment**
   ```bash
   docker-compose up -d
   ```

3. **Environment Variables**
   - `NANOGPT_API_KEY` - Required, obtain from NanoGPT dashboard

4. **Architecture Overview**
   - Vercel AI SDK integration
   - Component structure
   - State management approach

5. **Development Guide**
   - Local setup
   - Adding new features
   - Testing streaming

6. **Troubleshooting**
   - Common errors
   - API key issues
   - Streaming problems

═══════════════════════════════════════════════════════════════════

## ADDITIONAL FILES

**Required:**
- `.gitignore` (node_modules, .env, .next)
- `.dockerignore` (node_modules, .git, .env*)
- `.eslintrc.json` (Next.js + TypeScript rules)
- Type definitions in `/types`
- Utility functions with tests

═══════════════════════════════════════════════════════════════════

## CRITICAL SUCCESS CRITERIA

**The application MUST:**

1. ✅ Install successfully with `npm install`
2. ✅ Run immediately with `npm run dev` after env setup
3. ✅ Stream responses in real-time using Vercel AI SDK
4. ✅ Work with Docker (`docker-compose up`)
5. ✅ Persist conversations to localStorage
6. ✅ Handle multiple conversation threads
7. ✅ Render markdown with code syntax highlighting
8. ✅ Be fully responsive (mobile, tablet, desktop)
9. ✅ Include dark/light theme toggle
10. ✅ Have zero TypeScript errors
11. ✅ Match Claude/Gemini UI quality
12. ✅ Include complete documentation

**Zero additional coding should be required after file generation.**

═══════════════════════════════════════════════════════════════════

## VERCEL AI SDK SPECIFICS

**Key Points:**
- Use `streamText()` not manual fetch()
- Use `useChat()` hook for frontend
- Messages automatically formatted correctly
- Streaming handled by SDK
- No need for custom SSE parsing
- Error handling built into hooks
- TypeScript types included

**Provider Setup Pattern:**
```typescript
// lib/api/nanogpt.ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const nanogpt = createOpenAICompatible({
  name: 'nanogpt',
  baseURL: 'https://api.nano-gpt.com/v1',
  apiKey: process.env.NANOGPT_API_KEY,
});
```

═══════════════════════════════════════════════════════════════════

**Generate ALL files needed for immediate deployment. No placeholders. Complete implementation only.**
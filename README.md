# AI Chatbot - using Vercel AI SDK

An AI chatbot application built with **Next.js 14**, **TypeScript**, **Vercel AI SDK**, and **NanoGPT API**. Features real-time streaming responses, conversation management, markdown rendering with syntax highlighting, and a polished UI matching Claude/Gemini quality standards.

![AI Chatbot](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

### Core Functionality
- 🚀 **Real-time Streaming** - Powered by Vercel AI SDK `streamText()`
- 💬 **Multi-Conversation Support** - Create, rename, and delete chat threads
- 💾 **LocalStorage Persistence** - Conversations saved automatically
- 🧠 **Reasoning Display** - Collapsible "Thinking..." sections for AI reasoning
- 📝 **Markdown Rendering** - Full GFM support with syntax highlighting
- 📋 **Copy Code Blocks** - One-click copy functionality
- 🎨 **Dark/Light Theme** - System preference detection + manual toggle
- 📱 **Fully Responsive** - Mobile-first design with collapsible sidebar

### UI/UX
- ⚡ Auto-scroll to latest message
- 🎭 Empty states with example prompts
- 💀 Loading states and skeleton loaders
- 🎯 Character count with 4000 char limit
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- 🛑 Stop generation during streaming

---
![model-selection](https://github.com/user-attachments/assets/ed37a929-7f1d-45aa-a277-e1644f1de07f)
---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- NanoGPT API key ([Get yours here](https://nano-gpt.com))

### Installation

```bash
# Clone the repository (or extract files)
cd vercel-sdk-chatbot

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your NANOGPT_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t ai-chatbot .

# Run with docker-compose
docker-compose up -d

# Or run directly
docker run -p 3000:3000 -e NANOGPT_API_KEY=your_key_here ai-chatbot
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NANOGPT_API_KEY=your_nanogpt_api_key_here
```

**Important:** Replace `your_nanogpt_api_key_here` with your actual API key from the NanoGPT dashboard.

---

## 📁 Project Structure

```
vercel-sdk-chatbot/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts      # Streaming chat API (Vercel AI SDK)
│   │   │   └── health/
│   │   │       └── route.ts      # Health check endpoint
│   │   ├── chat/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Individual chat page
│   │   ├── layout.tsx            # Root layout with theme provider
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles & Tailwind
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx # Main chat container (useChat hook)
│   │   │   ├── Message.tsx       # Message with reasoning display
│   │   │   ├── MessageList.tsx   # Message list with auto-scroll
│   │   │   └── MessageInput.tsx  # Input with auto-resize
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx       # Conversation sidebar
│   │   │   ├── ConversationList.tsx
│   │   │   └── ConversationItem.tsx
│   │   ├── ui/                   # Shadcn/ui components
│   │   └── theme-toggle.tsx      # Dark/light mode toggle
│   ├── lib/
│   │   ├── api/
│   │   │   └── nanogpt.ts        # NanoGPT provider config
│   │   ├── storage/
│   │   │   └── conversations.ts  # LocalStorage operations
│   │   └── utils/
│   │       ├── helpers.ts        # Utility functions
│   │       └── markdown.ts       # Markdown utilities
│   └── types/
│       └── chat.ts               # TypeScript interfaces
├── public/                       # Static assets
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker Compose config
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## 🏗️ Architecture Overview

### Vercel AI SDK Integration

**API Route (`src/app/api/chat/route.ts`):**
```typescript
import { streamText } from 'ai';
import { nanogpt } from '@/lib/api/nanogpt';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: nanogpt('openai/gpt-oss-120b'),
    messages,
    temperature: 0.7,
    maxTokens: 2000,
  });
  
  return result.toDataStreamResponse();
}
```

**Frontend (`src/components/chat/ChatInterface.tsx`):**
```typescript
import { useChat } from '@ai-sdk/react';

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
});
```

### NanoGPT Provider

Using `@ai-sdk/openai-compatible` for seamless integration:

```typescript
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const nanogpt = createOpenAICompatible({
  name: 'nanogpt',
  baseURL: 'https://nano-gpt.com/api/v1/chat/completions',
  apiKey: process.env.NANOGPT_API_KEY,
});
```

**Endpoint:** `https://nano-gpt.com/api/v1/chat/completions`  
**Model:** `openai/gpt-oss-120b`

### Reasoning Token Display

NanoGPT emits reasoning tokens via `delta.reasoning` before content. The Message component displays these in a collapsible section:

- **Collapsed by default** - Click to expand
- **Styled distinctively** - Muted, italic text with border
- **Labeled "Thinking..."** - Clear indication of reasoning content

---

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Adding New Features

1. **New Components:** Add to `src/components/`
2. **API Routes:** Add to `src/app/api/`
3. **Utilities:** Add to `src/lib/utils/`
4. **Types:** Add to `src/types/`

### Testing Streaming

The `/api/chat` endpoint supports streaming. Test with:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## 🐛 Troubleshooting

### Common Issues

**1. API Key Error**
```
Error: NANOGPT_API_KEY is not configured
```
**Solution:** Ensure `.env` file exists with valid API key.

**2. Streaming Not Working**
- Check browser console for errors
- Verify API key is valid
- Ensure NanoGPT API is accessible

**3. Build Errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**4. Docker Issues**
```bash
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Health Check

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to verify the API is running.

---

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NANOGPT_API_KEY` | NanoGPT API authentication key | ✅ Yes | - |

---

## 🎨 UI Components

Built with [Shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/):

- **Button** - Primary actions
- **Input/Textarea** - Form controls
- **Dialog** - Modals
- **Dropdown Menu** - Context menus
- **Collapsible** - Reasoning sections
- **Tooltip** - Helpful hints

---

## 🚢 Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add `NANOGPT_API_KEY` environment variable
4. Deploy

### Docker

```bash
# Production build
docker build -t ai-chatbot:latest .

# Deploy to server
docker save ai-chatbot:latest | gzip > ai-chatbot.tar.gz
# Transfer to server and load
docker load < ai-chatbot.tar.gz
docker-compose up -d
```

---

## 🔒 Security

- ✅ API key stored in environment variables (never in code)
- ✅ Input validation on API routes
- ✅ Markdown sanitization to prevent XSS
- ✅ Rate limiting (implement via middleware if needed)
- ✅ Error handling without exposing internal details

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [NanoGPT API](https://nano-gpt.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)

---

## ⭐ Acknowledgments

- **Vercel** - For the incredible AI SDK
- **NanoGPT** - For the powerful API
- **Shadcn** - For the beautiful UI components
- **Radix UI** - For accessible primitives

---

**Built with ❤️ using Next.js 15, TypeScript, and Vercel AI SDK**

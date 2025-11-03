# Technical Overview: AI Chatbot Application

## 🏗️ Architecture Overview

This is a **production-ready AI chatbot** built with modern web technologies, focusing on real-time streaming, conversation management, and a polished user experience. The application follows a **client-side architecture** with clear separation of concerns.

### Core Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI Integration**: Vercel AI SDK (`ai` package)
- **Language Model**: NanoGPT API (OpenAI-compatible)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Storage**: Browser localStorage for conversation persistence
- **Real-time**: Streaming responses with streaming UI updates

## 📁 Folder Structure Analysis

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/
│   │   ├── chat/route.ts   # Core chat API (streaming endpoint)
│   │   └── health/route.ts # Health check
│   ├── chat/[id]/page.tsx  # Dynamic chat pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── chat/               # Chat-specific components
│   ├── sidebar/            # Conversation management
│   ├── ui/                 # shadcn/ui components
│   └── ErrorBoundary.tsx   # Error handling
├── lib/
│   ├── api/nanogpt.ts      # NanoGPT provider config
│   ├── storage/            # LocalStorage operations
│   ├── tools/              # AI tools (Brave Search)
│   ├── models/             # Model management
│   └── utils/              # Helper functions
└── types/chat.ts           # TypeScript definitions
```

## 🔑 Key Code Files & Their Roles

### 1. **API Layer** - `src/app/api/chat/route.ts`
**Purpose**: Core chat endpoint with streaming support
**Key Features**:
- Edge runtime configuration for performance
- Streaming responses via Vercel AI SDK
- Model validation and fallback
- Built-in Brave Search tool integration
- Comprehensive error handling

```typescript
// Streaming chat completion
const result = await streamText({
  model: nanogpt(selectedModel),
  messages,
  temperature: 0.7,
  maxTokens: 2000,
  tools: {
    'brave-web-search': braveSearchTool,
  },
});
```

### 2. **Main Chat Interface** - `src/components/chat/ChatInterface.tsx`
**Purpose**: Orchestrates chat functionality with Vercel AI SDK
**Key Features**:
- `useChat` hook integration for state management
- Message type mapping between internal format and AI SDK
- Model selection with persistence
- Real-time streaming UI updates

### 3. **Conversation Storage** - `src/lib/storage/conversations.ts`
**Purpose**: LocalStorage-based persistence layer
**Key Features**:
- CRUD operations for conversations
- Automatic conversation creation
- Message persistence and retrieval
- Conversation renaming and deletion

### 4. **NanoGPT Provider** - `src/lib/api/nanogpt.ts`
**Purpose**: AI model provider configuration
**Key Features**:
- OpenAI-compatible interface to NanoGPT
- API key validation
- Model management (default: `openai/gpt-oss-120b`)

### 5. **Sidebar Component** - `src/components/sidebar/Sidebar.tsx`
**Purpose**: Conversation management interface
**Key Features**:
- Real-time conversation list updates
- Mobile-responsive design
- Auto-navigation to new conversations

## 🎯 Core Features Implementation

### 1. **Real-time Streaming**
- **Implementation**: Vercel AI SDK's `streamText()` function
- **Frontend**: `useChat` hook provides streaming state
- **UI**: Auto-scroll to latest messages during streaming

### 2. **Reasoning Display**
- **NanoGPT Feature**: Supports reasoning tokens via `delta.reasoning`
- **UI**: Collapsible "Thinking..." sections in messages
- **Type Safety**: Extends base Message type with `reasoning?` field

### 3. **Conversation Management**
- **Persistence**: LocalStorage with JSON serialization
- **Features**: Create, rename, delete, auto-title generation
- **Navigation**: Dynamic routing with `/chat/[id]` pattern

### 4. **Model Selection**
- **Dynamic**: Users can switch between available models
- **Persistence**: Model preference saved in localStorage
- **Fallback**: Invalid models fall back to default

### 5. **Web Search Integration**
- **Tool**: Brave Search API integration
- **Usage**: AI can perform real-time web searches
- **Display**: Search results shown with tool invocation UI

## 🛠️ Technical Highlights

### **Type Safety**
- Comprehensive TypeScript definitions in `src/types/chat.ts`
- Strict typing for message formats and tool invocations
- Runtime validation via Zod schemas

### **Performance Optimizations**
- **Edge Runtime**: API routes run on Vercel Edge for low latency
- **Memoization**: React.useMemo for expensive operations
- **Streaming**: Real-time responses without waiting for completion

### **Error Handling**
- **Error Boundaries**: React error boundary for UI crashes
- **API Errors**: Comprehensive error mapping with user-friendly messages
- **Fallback Strategies**: Graceful degradation for API failures

### **Responsive Design**
- **Mobile-first**: Collapsible sidebar on mobile devices
- **Component Library**: shadcn/ui provides accessible, responsive components
- **Theme Support**: Dark/light mode with system preference detection

## 🔧 Configuration & Setup

### **Environment Variables**
```env
NANOGPT_API_KEY=your_nanogpt_api_key_here
BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here
```

### **Model Configuration**
- **Default Model**: `openai/gpt-oss-120b`
- **Fallback Models**: Configured in `src/lib/models/constants.ts`
- **Validation**: API validates model IDs before requests

## 🚀 Deployment Ready Features

- **Docker Support**: Multi-stage Docker build included
- **Environment Configuration**: Secure environment variable handling
- **Health Checks**: `/api/health` endpoint for monitoring
- **Production Optimized**: Edge runtime, streaming, and caching

This application demonstrates modern web development practices with a focus on user experience, performance, and maintainability. The clean architecture allows for easy extension and modification of features.
# Vercel AI Chatbot

### **Core Application (40+ Files)**

**Configuration Files (11 files):**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode)
- `next.config.js` - Next.js 14 configuration
- `tailwind.config.ts` - Tailwind CSS with dark mode
- `postcss.config.js` - PostCSS setup
- `.env` / `.env.example` - Environment variables
- `.gitignore` / `.dockerignore` - Git/Docker exclusions
- `.eslintrc.json` - ESLint configuration
- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Container orchestration
- `components.json` - Shadcn/ui configuration

**Source Code (29+ files):**

**API Routes (`src/app/api/`):**
- `chat/route.ts` - Streaming chat endpoint with Vercel AI SDK
- `health/route.ts` - Health check for Docker

**Pages (`src/app/`):**
- `layout.tsx` - Root layout with theme provider
- `page.tsx` - Home page
- `chat/[id]/page.tsx` - Individual chat page
- `globals.css` - Global styles and Tailwind

**Chat Components (`src/components/chat/`):**
- `ChatInterface.tsx` - Main container with `useChat()` hook
- `Message.tsx` - Message with reasoning display (collapsible)
- `MessageList.tsx` - Auto-scrolling message list
- `MessageInput.tsx` - Auto-resizing textarea with shortcuts

**Sidebar Components (`src/components/sidebar/`):**
- `Sidebar.tsx` - Conversation management
- `ConversationList.tsx` - List of conversations
- `ConversationItem.tsx` - Individual conversation with rename/delete

**UI Components (`src/components/ui/`):**
- `button.tsx` - Button variants
- `input.tsx` / `textarea.tsx` - Form controls
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Context menus
- `collapsible.tsx` - Collapsible sections (for reasoning)
- `tooltip.tsx` - Helpful tooltips
- `theme-toggle.tsx` - Dark/light mode switch

**Libraries (`src/lib/`):**
- `api/nanogpt.ts` - NanoGPT provider configuration
- `storage/conversations.ts` - LocalStorage operations
- `utils/helpers.ts` - Utility functions (cn, copyToClipboard, etc.)
- `utils/markdown.ts` - Markdown utilities

**Types (`src/types/`):**
- `chat.ts` - TypeScript interfaces (Message, Conversation, etc.)

---

## **Quick Start Guide**

```bash
# Currently running at:
http://localhost:3000

# Restart with:
npm run dev
```

### **2. Configure Your API Key**

Edit the `.env` file:

```env
NANOGPT_API_KEY=your_actual_api_key_here
```

### **3. Start Using the Chatbot**

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"New Chat"** in the sidebar
3. Type a message and press **Enter**
4. Watch the streaming response in real-time!

---

## 🎯 **Key Features Implemented**

### **✅ Real-time Streaming**
- Vercel AI SDK `streamText()` integration
- NanoGPT API via OpenAI-compatible provider
- Endpoint: `https://nano-gpt.com/api/v1`
- Model: `openai/gpt-oss-120b`

### **✅ Reasoning Display**
- **Collapsible sections** for AI reasoning tokens
- Labeled "Thinking..." with muted/italic styling
- Collapsed by default for clean UX
- Uses `delta.reasoning` from NanoGPT stream

### **✅ Conversation Management**
- Create, rename, delete conversations
- LocalStorage persistence
- Auto-generated titles from first message
- Sidebar navigation

### **✅ Markdown Rendering**
- Full GFM support (tables, lists, links)
- Syntax highlighting for code blocks
- Copy button for code snippets
- Language badges

### **✅ UI/UX Excellence**
- Dark/light theme with system detection
- Fully responsive (mobile, tablet, desktop)
- Auto-scroll to latest message
- Character count (4000 limit)
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Stop generation button during streaming
- Empty states with example prompts

---

## 📦 **Technologies Used**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2 | React framework with App Router |
| **React** | 18.3 | UI library |
| **TypeScript** | 5.0 | Type safety (strict mode) |
| **Vercel AI SDK** | 3.4 | Streaming chat SDK |
| **@ai-sdk/openai** | 0.0.66 | OpenAI provider for NanoGPT |
| **Tailwind CSS** | 3.4 | Utility-first CSS |
| **Shadcn/ui** | Latest | Beautiful UI components |
| **Radix UI** | Latest | Accessible primitives |
| **React Markdown** | 9.0 | Markdown rendering |
| **React Syntax Highlighter** | 15.5 | Code syntax highlighting |
| **next-themes** | 0.3 | Theme management |
| **Lucide React** | 0.445 | Icon library |

---

## 🐳 **Docker Deployment**

### **Build and Run**

```bash
# Build the image
docker build -t ai-chatbot .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### **Features**
- Multi-stage build (optimized size)
- Node.js 20 Alpine base
- Non-root user for security
- Health check endpoint
- Standalone Next.js output

---

## 📝 **Available Scripts**

```bash
npm run dev          # Start development server (already running!)
npm run build        # Build for production (✅ tested, working)
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

---

## 🔧 **Configuration Files**

### **Environment Variables (`.env`)**
```env
NANOGPT_API_KEY=your_nanogpt_api_key_here
```

### **NanoGPT Configuration**
```typescript
// src/lib/api/nanogpt.ts
export const nanogpt = createOpenAI({
  baseURL: 'https://nano-gpt.com/api/v1',
  apiKey: process.env.NANOGPT_API_KEY,
});

export const DEFAULT_MODEL = 'openai/gpt-oss-120b';
```

---

## 🎨 **UI Components Structure**

### **Shadcn/ui Components**
All components follow Shadcn/ui patterns with Radix UI primitives:
- `Button` - Multiple variants (default, outline, ghost, etc.)
- `Input/Textarea` - Form controls with auto-resize
- `Dialog` - Modal dialogs for confirmations
- `Dropdown Menu` - Context menus with actions
- `Collapsible` - Expandable reasoning sections
- `Tooltip` - Helpful hints on hover

### **Theme System**
- CSS variables for theming
- Dark/light mode toggle
- System preference detection
- Smooth transitions

---

## 📚 **Project Architecture**

### **Data Flow**

```
User Input
  ↓
MessageInput Component
  ↓
useChat() Hook (Vercel AI SDK)
  ↓
POST /api/chat (Edge Runtime)
  ↓
streamText() → NanoGPT API
  ↓
Server-Sent Events (SSE)
  ↓
Real-time UI Updates
  ↓
LocalStorage Persistence
```

### **State Management**
- **Chat State**: Managed by `useChat()` hook
- **Conversations**: LocalStorage with `src/lib/storage/conversations.ts`
- **Theme**: `next-themes` provider
- **UI State**: React component state

---

## 🧪 **Testing the Application**

### **1. Basic Chat Flow**
1. Click "New Chat"
2. Type: "Explain quantum computing"
3. Press Enter
4. See streaming response with reasoning section

### **2. Reasoning Display**
1. Look for "Thinking..." label (collapsed)
2. Click chevron to expand
3. See reasoning tokens in muted/italic text

### **3. Code Rendering**
1. Ask: "Write a Python hello world"
2. See syntax-highlighted code block
3. Click copy button to copy code

### **4. Theme Toggle**
1. Click sun/moon icon in header
2. See smooth transition to dark/light mode
3. Verify persistence on page refresh

### **5. Conversation Management**
1. Create multiple conversations
2. Rename a conversation
3. Delete a conversation
4. Check LocalStorage persistence

---

## 🐛 **Troubleshooting**

### **Build Issues**
```bash
# Clean build
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### **API Key Issues**
- Verify `.env` file exists in project root
- Check API key is not the placeholder value
- Restart dev server after changing `.env`

### **Port 3000 Already in Use**
```bash
# Kill process on port 3000 (Windows)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
PORT=3001 npm run dev
```

---

## 📖 **Documentation**

- **README.md** - Comprehensive guide with all features
- **API Route Comments** - Inline documentation
- **Component JSDoc** - TypeScript documentation
- **Type Definitions** - Fully typed interfaces

---

## 🚀 **Next Steps**


### **Optional Enhancements**
- Add user authentication (NextAuth.js)
- Implement rate limiting
- Add message editing capability
- Export conversations as JSON/Markdown
- Add search functionality
- Implement message regeneration with different parameters
- Add conversation sharing

### **Production Deployment**
- Deploy to Vercel (recommended)
- Or use Docker image on any cloud provider
- Set up monitoring and analytics
- Configure custom domain

---

## 📞 **Resources**

- **Project**: `c:\git\vercel-sdk-chatbot`
- **Dev Server**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **NanoGPT Docs**: https://nano-gpt.com/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎊 **Congratulations!**

You now have a **fully functional, production-ready AI chatbot** with:

✅ Real-time streaming  
✅ Reasoning display  
✅ Conversation management  
✅ Beautiful UI with dark/light themes  
✅ Complete TypeScript type safety  
✅ Docker deployment ready  
✅ Comprehensive documentation  

**Everything works out of the box - just add your API key and start chatting!** 🚀

---

**Built with ❤️ using Next.js 14, TypeScript, and Vercel AI SDK**

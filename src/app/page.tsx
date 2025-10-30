/**
 * Home page - displays welcome message
 */
export default function HomePage() {
  // In a real app, you might want to redirect to the most recent conversation
  // or create a new one. For simplicity, we'll just show a message.
  // The Sidebar component handles creating new chats.
  
  return (
    <div className="flex items-center justify-center h-full p-8 text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Welcome to AI Chatbot</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Click &quot;New Chat&quot; in the sidebar to start a conversation
        </p>
      </div>
    </div>
  );
}

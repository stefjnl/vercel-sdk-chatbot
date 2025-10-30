import { MessageSquare, Sparkles, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Home page - displays welcome message
 */
export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-700">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to AI Chat
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI conversations. Start chatting now and explore endless possibilities.
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Fast Responses
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <MessageSquare className="h-3 w-3 mr-1" />
              Natural Conversations
            </Badge>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-blue-500/50">
            <div className="space-y-2">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Smart Conversations</h3>
              <p className="text-sm text-muted-foreground">
                Engage in natural, context-aware dialogues powered by advanced AI
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-purple-500/50">
            <div className="space-y-2">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">Creative Assistance</h3>
              <p className="text-sm text-muted-foreground">
                Get help with writing, coding, brainstorming, and problem-solving
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-green-500/50">
            <div className="space-y-2">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Instant responses with real-time streaming for a seamless experience
              </p>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            Click <span className="font-semibold text-foreground">&quot;New Chat&quot;</span> in the sidebar to begin
          </p>
        </div>
      </div>
    </div>
  );
}

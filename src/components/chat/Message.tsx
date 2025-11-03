"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  User,
  Bot,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import type {
  Message as MessageType,
  ToolInvocationResult,
  ToolInvocationState,
} from "@/types/chat";
import { cn, copyToClipboard, formatTimestamp } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BraveSearchToolResult } from "@/lib/tools/brave-search";

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getInvocationStateLabel(
  state: ToolInvocationState,
  isError?: boolean
): string {
  if (isError) {
    return "Error";
  }

  switch (state) {
    case "partial-call":
      return "Preparing";
    case "call":
      return "Running";
    case "result":
      return "Completed";
    default:
      return "Processing";
  }
}

function parseBraveSearchResult(result: unknown): BraveSearchToolResult | null {
  if (!isRecord(result)) {
    return null;
  }

  if (result.source !== "Brave Search") {
    return null;
  }

  const entries = Array.isArray(result.results) ? result.results : [];

  const parsedResults = entries
    .map((item) => {
      if (!isRecord(item) || typeof item.url !== "string") {
        return null;
      }

      return {
        title:
          typeof item.title === "string" && item.title ? item.title : item.url,
        url: item.url,
        description:
          typeof item.description === "string" ? item.description : "",
      };
    })
    .filter(
      (entry): entry is BraveSearchToolResult["results"][number] =>
        entry !== null
    );

  return {
    query: typeof result.query === "string" ? result.query : "",
    results: parsedResults,
    totalResults:
      typeof result.totalResults === "number"
        ? result.totalResults
        : parsedResults.length,
    source: "Brave Search",
    fetchedAt:
      typeof result.fetchedAt === "string"
        ? result.fetchedAt
        : new Date().toISOString(),
    message: typeof result.message === "string" ? result.message : undefined,
    error: typeof result.error === "string" ? result.error : undefined,
  } satisfies BraveSearchToolResult;
}

function ToolInvocationCard({
  invocation,
}: {
  invocation: ToolInvocationResult;
}) {
  const query =
    isRecord(invocation.args) && typeof invocation.args.query === "string"
      ? invocation.args.query
      : undefined;
  const stateLabel = getInvocationStateLabel(
    invocation.state,
    invocation.isError
  );
  const isBraveSearch = invocation.toolName === "brave-web-search";

  const renderContent = () => {
    if (invocation.isError) {
      const result = parseBraveSearchResult(invocation.result);
      const message =
        result?.error || "The tool reported an error while running.";
      return <p className="text-sm text-destructive">{message}</p>;
    }

    if (invocation.state === "partial-call" || invocation.state === "call") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>
            {isBraveSearch ? "Searching Brave" : "Running tool"}
            {query ? ` for "${query}"` : ""}...
          </span>
        </div>
      );
    }

    if (invocation.state === "result") {
      if (isBraveSearch) {
        const result = parseBraveSearchResult(invocation.result);

        if (!result) {
          return (
            <p className="text-sm text-muted-foreground">
              Brave Search returned results.
            </p>
          );
        }

        if (result.error) {
          return <p className="text-sm text-destructive">{result.error}</p>;
        }

        if (result.results.length === 0) {
          return (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>No web results found.</p>
              {result.message && <p>{result.message}</p>}
            </div>
          );
        }

        return (
          <div className="space-y-2">
            <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              Sources from {result.source}
            </div>
            <div className="space-y-2">
              {result.results.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className="rounded-md border border-border/60 bg-background/60 p-2"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                  >
                    <span>
                      {index + 1}. {item.title}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {item.description && (
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {result.message && (
              <p className="text-xs text-muted-foreground">{result.message}</p>
            )}
          </div>
        );
      }

      return (
        <p className="text-sm text-muted-foreground">Tool call finished.</p>
      );
    }

    return (
      <p className="text-sm text-muted-foreground">Tool call in progress.</p>
    );
  };

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-3 shadow-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>{isBraveSearch ? "Brave Search" : invocation.toolName}</span>
        <span>{stateLabel}</span>
      </div>
      <div className="mt-2 space-y-2">{renderContent()}</div>
    </div>
  );
}

/**
 * Props for the code component in ReactMarkdown
 * Based on react-markdown's Code component signature
 */
interface CodeComponentProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}

/**
 * Code block component with syntax highlighting and copy functionality
 */
const CodeBlock = memo(
  ({
    language,
    code,
    theme,
  }: {
    language: string;
    code: string;
    theme: string;
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      const success = await copyToClipboard(code);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="relative group my-4">
        <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-b-0">
          <span className="text-xs font-mono text-muted-foreground uppercase">
            {language}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-b-lg border">
          <SyntaxHighlighter
            language={language}
            style={theme === "dark" ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.875rem",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = "CodeBlock";

/**
 * Message component with markdown rendering and reasoning display
 */
export const Message = memo(
  ({ message, isStreaming = false }: MessageProps) => {
    const { theme } = useTheme();
    const [reasoningOpen, setReasoningOpen] = useState(false);
    const isUser = message.role === "user";

    return (
      <div
        className={cn(
          "group flex gap-4 px-4 md:px-6 py-6 hover:bg-accent/50 transition-colors",
          isUser ? "bg-transparent" : "bg-muted/30"
        )}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback
            className={cn(
              "font-medium",
              isUser
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                : "bg-gradient-to-br from-green-600 to-emerald-600 text-white"
            )}
          >
            {isUser ? (
              <User className="h-5 w-5" />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Reasoning Section (AI messages only) */}
          {!isUser && message.reasoning && (
            <Collapsible open={reasoningOpen} onOpenChange={setReasoningOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {reasoningOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="italic">Thinking...</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="text-sm text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-4 py-2">
                  {message.reasoning}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {!isUser &&
            message.toolInvocations &&
            message.toolInvocations.length > 0 && (
              <div className="space-y-3">
                {message.toolInvocations.map((invocation) => (
                  <ToolInvocationCard
                    key={invocation.id}
                    invocation={invocation}
                  />
                ))}
              </div>
            )}

          {/* Main Message Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isStreaming && !message.content ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse-slow" />
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse-slow [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse-slow [animation-delay:0.4s]" />
                </div>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({
                    className,
                    children,
                    ...props
                  }: CodeComponentProps) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    const isInline =
                      !match && !className?.includes("language-");

                    return !isInline && match ? (
                      <CodeBlock
                        language={match[1]}
                        code={codeString}
                        theme={theme || "light"}
                      />
                    ) : (
                      <code
                        className={cn(
                          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
                          className
                        )}
                        {...(props as React.HTMLAttributes<HTMLElement>)}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Timestamp and Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.createdAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{new Date(message.createdAt).toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!isUser && message.content && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={async () => {
                  await copyToClipboard(message.content);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

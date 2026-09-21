"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { askCirculonAssistant } from "@/lib/actions/chat";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    text: "👋 Hi! I'm **CIRCULON AI**. Ask me anything about our circular waste marketplace, platform features, material rates, or how to get started!"
  }
];

const SUGGESTED_QUESTIONS = [
  "What features does CIRCULON have?",
  "How does buyer matching work?",
  "How do I calculate scrap value?",
  "How does company approval work?"
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isPending) return;

    const userMessage: ChatMessage = { role: "user", text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputValue("");

    startTransition(async () => {
      try {
        const response = await askCirculonAssistant(text, messages);
        setMessages((prev) => [...prev, { role: "assistant", text: response }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Sorry, I had trouble connecting. Please ask again!" }
        ]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label="Open CIRCULON AI Chat"
          className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-tr from-green-700 via-green-600 to-emerald-500 hover:from-green-600 hover:to-emerald-400 text-white rounded-full shadow-xl shadow-green-900/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400/40"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full" />
          </div>
          <span className="text-sm font-black tracking-wide hidden sm:inline-block pr-1">
            Ask CIRCULON AI
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
            Gemini
          </span>
        </button>
      )}

      {/* 2. Interactive Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-250 ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white px-5 py-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">
                    CIRCULON AI
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-400 text-emerald-950">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 font-medium">
                  Platform Assistant & Circular Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 text-green-100 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 text-green-100 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/60 text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-gray-800 text-white"
                        : "bg-green-700 text-white shadow-xs"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-green-600 text-white rounded-tr-xs shadow-sm font-medium"
                        : "bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Pending typing state */}
            {isPending && (
              <div className="flex items-center gap-2 text-gray-400 pt-1">
                <div className="w-7 h-7 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] font-medium text-gray-400 ml-1">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (visible when few messages) */}
          {messages.length <= 2 && (
            <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-900 rounded-lg text-[10px] font-bold text-left transition"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-200/90 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about CIRCULON features, matching, rates..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isPending}
              className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center justify-center shrink-0 cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUp, BookOpen, Bot, FileText, Sparkles } from "lucide-react";
import { api } from "../api/client";
import type { ChatMessage } from "../api/types";

const suggestions = [
  {
    title: "Company policies",
    prompt: "Where can I find the latest company policies?",
    icon: FileText,
  },
  {
    title: "IT support",
    prompt: "What should I do if I can't connect to the company VPN?",
    icon: Bot,
  },
  {
    title: "People & benefits",
    prompt: "Summarise the employee benefits available to me.",
    icon: BookOpen,
  },
];
export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    let active = true;
    setError("");
    if (!sessionId) {
      setMessages([]);
      return;
    }
    api
      .getMessages(sessionId)
      .then((data) => {
        if (active) setMessages(data);
      })
      .catch(() => {
        if (active) setError("We couldn't load this conversation.");
      });
    return () => {
      active = false;
    };
  }, [sessionId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  const send = async (content: string) => {
    const clean = content.trim();
    if (!clean || loading) return;
    if (!sessionId) {
      setError("Start a new chat from the sidebar before sending a message.");
      return;
    }
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: clean,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const response = await api.sendMessage(sessionId, clean);
      setMessages((current) => [...current, response]);
    } catch {
      setError("Your message couldn't be sent. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };
  return (
    <div className="flex h-screen min-h-[560px] flex-col bg-white">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-6 sm:px-10">
        <div>
          <div className="text-[10px] font-bold tracking-[.2em] text-blue-600">
            WORKSPACE
          </div>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            Knowledge assistant
          </h2>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Internal
          knowledge
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 sm:px-8">
        {messages.length === 0 ? (
          <div className="m-auto w-full max-w-3xl py-12">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Sparkles size={25} />
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold tracking-[.22em] text-blue-600">
                YOUR AI WORKMATE
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                What can I help you figure out?
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Ask a question about company policies, processes, or internal
                documentation.
              </p>
            </div>
            <div className="mt-9 grid gap-3 md:grid-cols-3">
              {suggestions.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setInput(item.prompt);
                    inputRef.current?.focus();
                  }}
                  className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <item.icon size={18} className="text-blue-600" />
                  <div className="mt-4 text-sm font-semibold text-slate-800">
                    {item.title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.prompt}
                  </p>
                  <div className="mt-3 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                    Ask this question →
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-7 py-8">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${message.role === "assistant" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}
                >
                  {message.role === "assistant" ? (
                    <Bot size={16} />
                  ) : (
                    <span className="text-xs font-bold">Y</span>
                  )}
                </div>
                <div
                  className={`min-w-0 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}
                >
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    {message.role === "assistant"
                      ? "Knowledge Assistant"
                      : "You"}
                  </div>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "bg-slate-50 text-slate-800 ring-1 ring-slate-100" : "bg-blue-600 text-white"}`}
                  >
                    {message.content}
                  </div>
                  {!!message.sources?.length && (
                    <div className="mt-3 rounded-xl border border-slate-200 p-3">
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <BookOpen size={13} /> Sources
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, index) => (
                          <span
                            key={`${source.title}-${index}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200"
                          >
                            <FileText size={13} />
                            {source.title}
                            {source.page && (
                              <span className="text-slate-400">
                                p. {source.page}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
        {error && (
          <div className="mx-auto mb-3 w-full max-w-3xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 pb-4 pt-3 sm:px-8">
        <form
          onSubmit={submit}
          className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your workplace…"
            rows={1}
            aria-label="Message the knowledge assistant"
            className="max-h-36 min-h-10 flex-1 resize-y bg-transparent py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
          >
            <ArrowUp size={19} />
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] text-slate-400">
          AI can make mistakes. Verify important information with the linked
          source documents.
        </p>
      </div>
    </div>
  );
}

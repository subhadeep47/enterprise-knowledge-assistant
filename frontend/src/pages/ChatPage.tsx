import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Search,
} from "lucide-react";
import { api } from "../api/client";
import type { ChatMessage, ChatSession } from "../api/types";
import AssistantMarkdown from "./AssistantMarkdown";

const suggestions = [
  {
    number: "01",
    title: "Company policies",
    prompt: "Where can I find the latest company policies?",
    note: "Guidelines, leave and workplace standards",
  },
  {
    number: "02",
    title: "IT support",
    prompt: "What should I do if I can't connect to the company VPN?",
    note: "Troubleshooting and access requests",
  },
  {
    number: "03",
    title: "People & benefits",
    prompt: "Summarise the employee benefits available to me.",
    note: "Benefits, onboarding and people ops",
  },
];

interface ChatNavigationState {
  sessionId: string;
  messages: ChatMessage[];
}

export default function ChatPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const navigationState =
    location.state as ChatNavigationState | null;
  const initialMessages =
    navigationState?.sessionId === sessionId &&
    Array.isArray(navigationState.messages)
      ? navigationState.messages
      : null;
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => initialMessages ?? [],
  );
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(
    () => (initialMessages ? sessionId : null),
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startingConversationRef = useRef(false);
  const handledSeedSessionRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const loadingSession = Boolean(sessionId && loadedSessionId !== sessionId);
  const hasConversation = Boolean(sessionId) || startingConversation;

  useEffect(() => {
    setError("");
    if (!sessionId) {
      if (startingConversationRef.current) return;
      setMessages([]);
      setLoadedSessionId(null);
      handledSeedSessionRef.current = null;
      return;
    }
    if (initialMessages) {
      handledSeedSessionRef.current = sessionId;
      setLoadedSessionId(sessionId);
      return;
    }
    if (handledSeedSessionRef.current === sessionId) return;

    setMessages([]);
    setLoadedSessionId(null);
    let active = true;
    const controller = new AbortController();
    api
      .getMessages(sessionId, controller.signal)
      .then((data) => {
        if (active) {
          setMessages(data);
          setLoadedSessionId(sessionId);
        }
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return;
        if (active) {
          setError("We couldn't load this conversation.");
          setLoadedSessionId(sessionId);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [initialMessages, sessionId]);
  useEffect(() => {
    if (initialMessages && sessionId) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });
    }
  }, [initialMessages, location.pathname, location.search, navigate, sessionId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  const send = async (content: string) => {
    const clean = content.trim();
    if (!clean || loading) return;
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "USER",
      content: clean,
      createdAt: new Date().toISOString(),
    };
    setInput("");
    setLoading(true);
    setError("");
    let conversationStarted = Boolean(sessionId);
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        startingConversationRef.current = true;
        setStartingConversation(true);
        setMessages([userMessage]);
        const session: ChatSession = await api.createSession();
        activeSessionId = String(session.id);
        conversationStarted = true;
        startingConversationRef.current = false;
        setStartingConversation(false);
        setLoadedSessionId(String(session.id));
        window.dispatchEvent(new Event("eka:sessions-updated"));
        navigate(`/chat?session=${session.id}`, {
          state: {
            sessionId: String(session.id),
            messages: [userMessage],
          },
        });
      } else {
        setMessages((current) => [...current, userMessage]);
      }

      const response = await api.sendMessage(activeSessionId, clean);
      setMessages((current) => [...current, response]);
    } catch {
      if (!conversationStarted) {
        startingConversationRef.current = false;
        setStartingConversation(false);
        setMessages([]);
        setInput(clean);
      }
      setError(
        conversationStarted
          ? "Your message couldn't be sent. Please try again."
          : "Couldn't start your conversation. Please try again.",
      );
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
    <div className="flex h-screen min-h-[560px] flex-col bg-[#F4F0EA]">
      <header className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-[#D6CEC3] px-5 sm:px-8">
        <div>
          <p className="mono-label text-[9px] text-[#C85A32]">Workspace / 01</p>
          <h2 className="mt-1 text-sm font-semibold">Knowledge assistant</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#706B64]">
          <span className="h-2 w-2 bg-[#C85A32]" /> INTERNAL KNOWLEDGE
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loadingSession ? (
          <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
            <div className="grid h-11 w-11 place-items-center border border-[#D6CEC3] bg-[#F8F5F0] text-[#C85A32]">
              <LoaderCircle size={19} className="animate-spin" />
            </div>
            <p className="mt-4 text-sm font-semibold">Opening conversation</p>
            <p className="mt-1 text-xs text-[#706B64]">
              Your messages will be ready in a moment.
            </p>
            <div className="mt-6 w-full max-w-sm space-y-2" aria-hidden="true">
              <div className="h-2 animate-pulse bg-[#E9E2D8]" />
              <div className="h-2 w-4/5 animate-pulse bg-[#E9E2D8]" />
              <div className="h-2 w-3/5 animate-pulse bg-[#E9E2D8]" />
            </div>
          </div>
        ) : !hasConversation ? (
          <div className="mx-auto grid min-h-full max-w-[1240px] grid-cols-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(220px,.7fr)] lg:gap-12 lg:px-12 lg:py-12">
            <section className="flex flex-col justify-center">
              <p className="mono-label mb-5 flex items-center gap-3 text-[10px] text-[#C85A32]">
                <span className="h-px w-8 bg-[#C85A32]" />
                Ask the knowledge base
              </p>
              <h1 className="display-font max-w-3xl text-[clamp(3.5rem,7vw,6.5rem)] leading-[.88] tracking-[-.035em]">
                What do you
                <br />
                need to <em className="text-[#C85A32]">know?</em>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-6 text-[#706B64] sm:text-base">
                Search company knowledge in plain language. Get a useful answer,
                with the documents behind it.
              </p>
              <div className="mt-10 grid grid-cols-1 border-t border-[#D6CEC3] sm:grid-cols-3">
                {suggestions.map((item) => (
                  <button
                    key={item.number}
                    onClick={() => {
                      setInput(item.prompt);
                      inputRef.current?.focus();
                    }}
                    className="group border-b border-[#D6CEC3] py-4 text-left transition hover:bg-[#EEE8E0] sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0"
                  >
                    <span className="mono-label text-[9px] text-[#C85A32]">
                      {item.number} / Prompt
                    </span>
                    <div className="mt-3 flex items-center justify-between gap-2 text-sm font-semibold">
                      {item.title}
                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-[#C85A32] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#706B64]">
                      {item.note}
                    </p>
                  </button>
                ))}
              </div>
            </section>
            <aside className="flex flex-col justify-between border-t border-[#171614] pt-5 lg:mt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div>
                <p className="mono-label text-[9px] text-[#706B64]">
                  A better way to find it
                </p>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <Search
                      size={17}
                      className="mt-0.5 shrink-0 text-[#C85A32]"
                    />
                    <div>
                      <p className="text-sm font-semibold">Ask naturally</p>
                      <p className="mt-1 text-xs leading-5 text-[#706B64]">
                        No keywords or folder hunting required.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <BookOpen
                      size={17}
                      className="mt-0.5 shrink-0 text-[#C85A32]"
                    />
                    <div>
                      <p className="text-sm font-semibold">See the source</p>
                      <p className="mt-1 text-xs leading-5 text-[#706B64]">
                        Answers can include references to internal documents.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <LockKeyhole
                      size={17}
                      className="mt-0.5 shrink-0 text-[#C85A32]"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        Stay in your workspace
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#706B64]">
                        Use approved company knowledge, not guesswork.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-[#D6CEC3] pt-4">
                <p className="display-font text-2xl italic">
                  Less searching.
                  <br />
                  <span className="text-[#C85A32]">More doing.</span>
                </p>
                <p className="mono-label mt-4 text-[8px] text-[#8A8177]">
                  FIELDNOTES / INTERNAL AI
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="w-full space-y-7 px-5 py-8 sm:px-8 lg:px-10">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex gap-3 ${message.role === "USER" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center ${message.role === "ASSISTANT" ? "bg-[#C85A32] text-[#F4F0EA]" : "border border-[#D6CEC3] bg-[#E9E2D8] text-[#171614]"}`}
                >
                  {message.role === "ASSISTANT" ? (
                    <Bot size={15} />
                  ) : (
                    <span className="mono-label text-[9px]">You</span>
                  )}
                </div>
                <div
                  className={`min-w-0 max-w-[85%] ${message.role === "USER" ? "text-right" : ""}`}
                >
                  <div className="mono-label mb-2 text-[9px] text-[#706B64]">
                    {message.role === "ASSISTANT"
                      ? "Knowledge assistant"
                      : "You"}
                  </div>
                  <div
                    className={`border px-4 py-3 text-sm leading-6 ${
                      message.role === "ASSISTANT"
                        ? "border-[#D6CEC3] bg-[#EEE8E0] text-[#171614]"
                        : "border-[#171614] bg-[#171614] text-[#F4F0EA]"
                    }`}
                  >
                    {message.role === "ASSISTANT" ? (
                      <AssistantMarkdown content={message.content} />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                  </div>
                  {!!message.sources?.length && (
                    <div className="mt-3 border border-[#D6CEC3] p-3">
                      <div className="mb-2 flex items-center gap-1.5 mono-label text-[9px] text-[#706B64]">
                        <BookOpen size={13} /> Sources
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, index) => (
                          <span
                            key={`${source.title}-${index}`}
                            className="inline-flex items-center gap-1.5 border border-[#D6CEC3] bg-[#F4F0EA] px-2.5 py-1.5 text-xs text-[#706B64]"
                          >
                            <FileText size={13} />
                            {source.title}
                            {source.page && (
                              <span className="text-[#C85A32]">
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
                <div className="grid h-8 w-8 place-items-center bg-[#C85A32] text-[#F4F0EA]">
                  <Bot size={15} />
                </div>
                <div className="border border-[#D6CEC3] bg-[#EEE8E0] px-4 py-3 text-sm text-[#706B64]">
                  {startingConversation
                    ? "Starting your conversation…"
                    : "Working on an answer…"}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
        {error && (
          <div className="mx-auto mb-3 w-[calc(100%-2rem)] max-w-3xl border border-[#C85A32] bg-[#F7E3D9] px-4 py-3 text-sm text-[#8B3518]">
            {error}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-[#D6CEC3] bg-[#F4F0EA] px-4 pb-4 pt-3 sm:px-8">
        <form
          onSubmit={submit}
          className="mx-auto flex max-w-3xl items-end gap-3 border border-[#171614] bg-[#F9F6F1] p-2 pl-4 transition focus-within:ring-2 focus-within:ring-[#C85A32]/25"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question about your workplace…"
            rows={1}
            aria-label="Message the knowledge assistant"
            disabled={loading || loadingSession}
            className="max-h-36 min-h-10 flex-1 resize-y bg-transparent py-2 text-sm leading-6 text-[#171614] outline-none placeholder:text-[#8A8177]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || loadingSession}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center bg-[#C85A32] text-[#F4F0EA] transition hover:bg-[#A94321]"
          >
            <ArrowUpRight size={19} />
          </button>
        </form>
        <p className="mono-label mt-3 text-center text-[8px] text-[#8A8177]">
          AI can make mistakes · Verify important information with source
          documents
        </p>
      </div>
    </div>
  );
}

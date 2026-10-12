import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUp, BookOpen, Bot, FileText, Sparkles } from "lucide-react";
import { api } from "../api/client";
import type { ChatMessage } from "../api/types";

const suggestions = [
  { title: "Company policies", prompt: "Where can I find the latest company policies?" },
  { title: "IT support", prompt: "What should I do if I can't connect to the company VPN?" },
  { title: "People & benefits", prompt: "Summarise the employee benefits available to me." },
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
    if (!sessionId) { setMessages([]); return; }
    api.getMessages(sessionId).then((data) => { if (active) setMessages(data); }).catch(() => { if (active) setError("We couldn't load this conversation."); });
    return () => { active = false; };
  }, [sessionId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (content: string) => {
    const clean = content.trim();
    if (!clean || loading) return;
    if (!sessionId) {
      setError("Start a new chat from the sidebar before sending a message.");
      return;
    }
    const userMessage: ChatMessage = { id: `local-${Date.now()}`, role: "user", content: clean, createdAt: new Date().toISOString() };
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

  const submit = (event: FormEvent) => { event.preventDefault(); void send(input); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(input); }
  };

  return (
    <div className="chat-page">
      <header className="topbar">
        <div><span className="topbar-kicker">WORKSPACE</span><h2>Knowledge assistant</h2></div>
        <div className="topbar-status"><span className="status-dot" /> Internal knowledge</div>
      </header>

      <div className={`chat-content ${messages.length ? "chat-content--active" : ""}`}>
        {messages.length === 0 ? (
          <div className="welcome-panel">
            <div className="welcome-icon"><Sparkles size={23} /></div>
            <span className="welcome-overline">YOUR AI WORKMATE</span>
            <h1>What can I help<br />you figure out?</h1>
            <p>Ask a question about company policies, processes, or internal documentation.</p>
            <div className="suggestion-grid">
              {suggestions.map((item) => (
                <button key={item.title} className="suggestion-card" onClick={() => { setInput(item.prompt); inputRef.current?.focus(); }}>
                  <span>{item.title}</span><p>{item.prompt}</p><ArrowUp size={15} className="suggestion-arrow" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message) => (
              <article key={message.id} className={`message message--${message.role}`}>
                {message.role === "assistant" ? <div className="message-avatar"><Bot size={17} /></div> : <div className="user-message-avatar">Y</div>}
                <div className="message-body">
                  <div className="message-author">{message.role === "assistant" ? "Knowledge Assistant" : "You"}</div>
                  <div className="message-text">{message.content}</div>
                  {!!message.sources?.length && (
                    <div className="source-list">
                      <div className="source-label"><BookOpen size={13} /> Sources</div>
                      {message.sources.map((source, index) => <div className="source-chip" key={`${source.title}-${index}`}><FileText size={13} /><span>{source.title}</span>{source.page && <small>p. {source.page}</small>}</div>)}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {loading && <div className="message message--assistant"><div className="message-avatar"><Bot size={17} /></div><div className="message-body"><div className="message-author">Knowledge Assistant</div><div className="typing-indicator"><i /><i /><i /></div></div></div>}
            <div ref={bottomRef} />
          </div>
        )}
        {error && <div className="inline-error">{error}</div>}
      </div>

      <div className="composer-area">
        <form className="composer" onSubmit={submit}>
          <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} placeholder="Ask anything about your workplace…" rows={1} aria-label="Message the knowledge assistant" />
          <button type="submit" className="send-button" disabled={!input.trim() || loading} aria-label="Send message"><ArrowUp size={19} /></button>
        </form>
        <div className="composer-footnote">AI can make mistakes. Verify important information with the linked source documents.</div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Thread = {
  id: string;
  user_email: string;
  status: string;
  updated_at: string;
  last: { sender: string; body: string; created_at: string } | null;
};

type Msg = { id: string; sender: string; body: string; created_at: string };

export default function AdminInbox() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json().catch(() => ({}));
      if (res.ok) setThreads((data.threads || []) as Thread[]);
      else setError(data.error || "Could not load inbox");
    } catch {
      setError("Could not load inbox");
    }
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support?threadId=${id}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMessages((data.messages || []) as Msg[]);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const t = setInterval(() => {
      loadMessages(activeId);
      loadThreads();
    }, 10000);
    return () => clearInterval(t);
  }, [activeId, loadMessages, loadThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reply.trim();
    if (!clean || !activeId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: activeId, body: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Could not send reply");
      else {
        setReply("");
        loadMessages(activeId);
      }
    } catch {
      setError("Network error. Try again");
    }
    setSending(false);
  };

  const closeThread = async () => {
    if (!activeId) return;
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeId, close: true }),
    }).catch(() => {});
    setActiveId(null);
    loadThreads();
  };

  const active = threads.find((t) => t.id === activeId) || null;

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-shimmer h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-3">
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">
        {threads.length === 0 && (
          <p className="text-sm text-gray-400 p-5">No conversations yet.</p>
        )}
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveId(t.id)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] last:border-0 transition-colors ${
              activeId === t.id ? "bg-brand-50 dark:bg-brand-950/20" : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate min-w-0">
                {t.user_email}
              </p>
              <span
                className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  t.status === "open"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-gray-100 dark:bg-white/[0.06] text-gray-500"
                }`}
              >
                {t.status}
              </span>
            </div>
            {t.last && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {t.last.sender === "user" ? "" : t.last.sender === "admin" ? "You: " : "Bot: "}
                {t.last.body}
              </p>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark flex flex-col min-h-[420px]">
        {!active ? (
          <p className="text-sm text-gray-400 p-6 text-center my-auto">
            Pick a conversation to read and reply.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate min-w-0">
                {active.user_email}
              </p>
              {active.status === "open" && (
                <button
                  type="button"
                  onClick={closeThread}
                  className="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
                >
                  Close
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[240px] max-h-[50vh]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      m.sender === "admin"
                        ? "bg-brand-500 text-white rounded-br-md"
                        : m.sender === "bot"
                          ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-gray-800 dark:text-gray-200 rounded-bl-md"
                          : "bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-gray-200 rounded-bl-md"
                    }`}
                  >
                    {m.sender === "bot" && (
                      <span className="block text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-0.5">BOT</span>
                    )}
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendReply} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-white/[0.06]">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply as Shopa team..."
                maxLength={2000}
                className="input-base !py-2.5"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="shrink-0 h-10 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all disabled:opacity-50 active:scale-95"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 md:col-span-2">{error}</p>
      )}
    </div>
  );
}

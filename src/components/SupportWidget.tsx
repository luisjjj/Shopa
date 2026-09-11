"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeadsetIcon, XIcon } from "@/components/Icons";

type Msg = { id: string; sender: string; body: string; created_at: string };

const GREETING: Msg = {
  id: "greeting",
  sender: "bot",
  body: "Hi! I'm Shopa support. Ask me anything about pricing, payouts, delivery, or your store, a human jumps in if I can't help.",
  created_at: new Date().toISOString(),
};

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/support/thread");
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages as Msg[]);
      } else if (!res.ok && data.error) {
        setError(String(data.error));
      }
    } catch {
      // chat stays usable with greeting only
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [open, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.trim();
    if (!clean || sending) return;
    setSending(true);
    setError("");
    const optimistic: Msg = {
      id: `local-${Date.now()}`,
      sender: "user",
      body: clean,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send. Try again");
      } else {
        // Replace optimistic bubble with server truth, then reload.
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        load();
      }
    } catch {
      setError("Network error. Try again");
    }
    setSending(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with support"
          title="Chat with support"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          <HeadsetIcon size={22} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-up max-h-[70vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                <HeadsetIcon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Support</p>
                <p className="text-[11px] text-green-600 dark:text-green-400 leading-tight">Online, replies instantly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[200px]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    m.sender === "user"
                      ? "bg-brand-500 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-gray-200 rounded-bl-md"
                  }`}
                >
                  {m.body}
                  {m.sender === "admin" && (
                    <span className="block text-[10px] opacity-60 mt-1">Shopa team</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="text-xs text-red-500 px-4 pb-1">{error}</p>
          )}

          <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              maxLength={2000}
              className="input-base !py-2.5"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="shrink-0 w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-all disabled:opacity-50 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatFab from "./ChatFab";
import TypingIndicator from "./TypingIndicator";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

/** Читает cookie по имени (для session_id). */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Извлекает short_link_code из URL если на странице /{CODE}. */
function getShortLinkCode(): string | null {
  const path = window.location.pathname;
  const match = path.match(/^\/([A-Z]{4,6})$/);
  return match ? match[1] : null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Авто-прокрутка к последнему сообщению.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  // Загрузка истории при первом открытии чата.
  useEffect(() => {
    if (!open || historyLoaded) return;
    setHistoryLoaded(true);

    const sid = getCookie("cv_session_id");
    if (!sid) return;

    setSessionId(sid);
    // Загружаем историю
    fetch(`${API}/api/chat/history/${sid}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.messages?.length) {
          setMessages(
            data.messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              text: m.content,
            }))
          );
        }
      })
      .catch(() => {});
  }, [open, historyLoaded]);

  async function send() {
    const userMsg = input.trim();
    if (!userMsg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setStreaming("…");
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          session_id: sessionId ?? undefined,
          short_link_code: getShortLinkCode() ?? undefined,
        }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setStreaming(acc);
      }
      setMessages((m) => [...m, { role: "assistant", text: acc }]);
    } catch (err) {
      console.error("chat stream failed", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "AI временно недоступен. Свяжитесь напрямую в Telegram @vrg18." },
      ]);
    } finally {
      setStreaming("");
    }
  }

  return (
    <>
      {!open && <ChatFab onOpen={() => setOpen(true)} />}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col p-3 shadow-2xl z-40">
          {/* Заголовок панели. */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-online-dot" />
              <span className="text-sm font-medium">AI-ассистент Валерия</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="text-gray-500 hover:text-white text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>
          {/* Контейнер сообщений. */}
          <div className="flex-1 min-h-0 max-h-96 overflow-y-auto mb-2">
            {messages.map((m, i) => (
              <ChatMessage key={i} {...m} />
            ))}
            {streaming === "…" && <TypingIndicator />}
            {streaming && streaming !== "…" && (
              <ChatMessage role="assistant" text={streaming} />
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Спросите про опыт…"
              className="flex-1 bg-gray-800 px-2 py-1 rounded text-sm focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!!streaming}
              aria-label="Отправить"
              className="bg-blue-600 px-3 rounded text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
        </div>
      )}
    </>
  );
}

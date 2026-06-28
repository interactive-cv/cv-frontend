"use client";

import { useState } from "react";
import ChatMessage from "./ChatMessage";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");

  async function send() {
    const userMsg = input.trim();
    if (!userMsg || streaming) return; // не пускаем повторный запрос во время стрима
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setStreaming("…");
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
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
      <button
        onClick={() => setOpen(!open)}
        aria-label="Чат"
        className="fixed bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg hover:bg-blue-500 transition-colors z-40"
      >
        Чат
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-gray-900 rounded-lg flex flex-col p-3 shadow-xl z-40">
          <div className="flex-1 overflow-y-auto">
            {messages.map((m, i) => (
              <ChatMessage key={i} {...m} />
            ))}
            {streaming && <ChatMessage role="assistant" text={streaming} />}
          </div>
          <div className="flex gap-2 mt-2">
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

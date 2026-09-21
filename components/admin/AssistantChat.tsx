"use client";

import { useEffect, useRef, useState } from "react";
import {
  assistantChatStream,
  clearAssistantThread,
  listAssistantMessages,
  saveAssistantMessage,
  type AssistantMessage,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import TypingIndicator from "@/components/chat/TypingIndicator";

/** Вычленяет текст для заказчика из ответа ассистента (если есть маркер). */
export function extractDraft(text: string): { draft: string | null; clean: string } {
  if (!text.includes("===DRAFT===")) return { draft: null, clean: text };
  const [before, after] = text.split("===DRAFT===");
  let draft = after.split("===END===")[0].trim();
  if (draft.startsWith("```")) draft = draft.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
  return { draft: draft || null, clean: before.trim() };
}

export default function AssistantChat({
  appId,
  onDraft,
}: {
  appId: string;
  /** Ассистент предложил текст для заказчика (маркер ===DRAFT===). */
  onDraft: (text: string) => void;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    listAssistantMessages(token, appId)
      .then(setMessages)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoaded(true));
  }, [appId]);

  // Вниз при открытии (мгновенно) и при каждом токене стрима.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, streamText, loaded]);

  async function send() {
    const message = input.trim();
    if (!message || streaming) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setError("");
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      },
    ]);
    setInput("");
    setStreaming(true);
    setStreamText("");
    try {
      const res = await assistantChatStream(token, appId, message);
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setStreamText(acc);
        // Живая подстановка черновика в поле «для заказчика»
        const { draft } = extractDraft(acc);
        if (draft) onDraft(draft);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: acc,
          created_at: new Date().toISOString(),
        },
      ]);
      const { draft } = extractDraft(acc);
      if (draft) onDraft(draft);
      // Ответ ассистента — в историю (БД)
      saveAssistantMessage(token, appId, acc).catch(() => {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  async function clearThread() {
    if (streaming || messages.length === 0) return;
    if (!confirm("Очистить диалог с ассистентом по этому заказу?")) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await clearAssistantThread(token, appId);
      setMessages([]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!loaded) return <p className="text-gray-500 text-sm">Загрузка...</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">
          🤖 Ассистент — спросить, обсудить, попросить ответ заказчику
        </span>
        {messages.length > 0 && (
          <button
            onClick={clearThread}
            disabled={streaming}
            className="text-[10px] text-gray-500 hover:text-red-400 disabled:opacity-50"
          >
            очистить
          </button>
        )}
      </div>

      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 mb-2 pr-1"
      >
        {messages.length === 0 && !streaming && (
          <p className="text-gray-600 text-xs">
            Спрашивайте про заказ («что он имеет в виду под…»),
            обсуждайте тактику или просите: «напиши ответ заказчику…» —
            текст появится в поле «для заказчика» слева.
          </p>
        )}
        {messages.map((m) => {
          const { draft, clean } =
            m.role === "assistant" ? extractDraft(m.content) : { draft: null, clean: m.content };
          return (
            <div
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap max-w-[92%] ${
                m.role === "user"
                  ? "self-end bg-blue-900/40 text-blue-50"
                  : "self-start bg-gray-800 text-gray-100"
              }`}
            >
              {clean || <span className="text-gray-500">(только текст для заказчика)</span>}
              {draft && (
                <button
                  onClick={() => onDraft(draft)}
                  className="mt-1 block text-[10px] text-blue-400 hover:text-blue-300 underline"
                >
                  ↩ снова подставить в «для заказчика»
                </button>
              )}
            </div>
          );
        })}
        {streaming && (
          <div className="self-start bg-gray-800 rounded-xl px-3 py-2 max-w-[92%] text-sm whitespace-pre-wrap">
            {streamText || <TypingIndicator />}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mb-1">{error}</p>}

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Вопрос, обсуждение или «напиши ответ заказчику…» (Enter — отправить)"
          className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] max-h-32 resize-y"
          rows={2}
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="self-end bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {streaming ? "…" : "→"}
        </button>
      </div>
    </div>
  );
}

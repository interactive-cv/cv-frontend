"use client";

import { useEffect, useRef, useState } from "react";
import {
  addNegotiationMessage,
  deleteNegotiationMessage,
  listNegotiation,
  suggestReplyStream,
  type NegotiationChannel,
  type NegotiationMessage,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import TypingIndicator from "@/components/chat/TypingIndicator";

const CHANNEL_LABELS: Record<NegotiationChannel, string> = {
  fl: "FL.ru",
  telegram: "TG",
  email: "Email",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NegotiationTab({ appId }: { appId: string }) {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Вставка сообщения заказчика
  const [customerText, setCustomerText] = useState("");
  const [customerChannel, setCustomerChannel] = useState<NegotiationChannel>("fl");

  // Черновик ответа (LLM)
  const [draft, setDraft] = useState("");
  const [draftChannel, setDraftChannel] = useState<NegotiationChannel>("fl");
  const [instruction, setInstruction] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [adding, setAdding] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  function flashNotice(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  }

  async function reload() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      setMessages(await listNegotiation(token, appId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streaming]);

  const lastCustomer = [...messages].reverse().find((m) => m.role === "customer");

  async function addCustomerMessage() {
    const text = customerText.trim();
    if (!text || adding) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setAdding(true);
    setError("");
    try {
      await addNegotiationMessage(token, appId, {
        role: "customer",
        channel: customerChannel,
        content: text,
      });
      setCustomerText("");
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function suggestReply() {
    if (streaming) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setError("");
    setDraft("");
    setStreaming(true);
    try {
      const res = await suggestReplyStream(token, appId, {
        instruction: instruction.trim() || undefined,
      });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setDraft(acc);
      }
      // Канал ответа по умолчанию — как у последнего сообщения заказчика
      if (lastCustomer) setDraftChannel(lastCustomer.channel);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStreaming(false);
    }
  }

  async function markSent() {
    const text = draft.trim();
    if (!text) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await addNegotiationMessage(token, appId, {
        role: "me",
        channel: draftChannel,
        content: text,
      });
      setDraft("");
      setInstruction("");
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    flashNotice("✓ Скопировано");
  }

  async function removeMessage(id: string) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await deleteNegotiationMessage(token, id);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!loaded) return <p className="text-gray-500">Загрузка...</p>;

  return (
    <div className="max-w-4xl">
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {notice && <p className="text-green-500 text-sm mb-4">{notice}</p>}

      {/* Лента переписки */}
      <div className="flex flex-col gap-3 mb-6 max-h-[50vh] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Переписки пока нет. Вставьте сообщение заказчика с площадки — и появится
            кнопка подсказки ответа.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`group flex ${m.role === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative rounded-xl px-4 py-2.5 max-w-[85%] whitespace-pre-wrap text-sm ${
                m.role === "me"
                  ? "bg-blue-900/40 text-blue-50"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              <div className="text-[10px] text-gray-400 mb-1 flex gap-2 items-center">
                <span>{m.role === "me" ? "Я" : "Заказчик"}</span>
                <span className="uppercase">{CHANNEL_LABELS[m.channel]}</span>
                <span>{formatTime(m.created_at)}</span>
              </div>
              {m.content}
              <button
                onClick={() => removeMessage(m.id)}
                title="Удалить сообщение"
                className="absolute -top-2 -right-2 hidden group-hover:block bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-full w-5 h-5 text-xs leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-end">
            <div className="bg-blue-900/40 rounded-xl px-4 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Вставка сообщения заказчика */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
        <div className="text-xs text-gray-500 mb-2">
          ✉ Сообщение заказчика — вставьте копипастом с площадки
        </div>
        <textarea
          value={customerText}
          onChange={(e) => setCustomerText(e.target.value)}
          placeholder="Текст сообщения заказчика..."
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[70px] resize-y"
        />
        <div className="flex gap-2 mt-2 items-center">
          <select
            value={customerChannel}
            onChange={(e) => setCustomerChannel(e.target.value as NegotiationChannel)}
            className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="fl">FL.ru</option>
            <option value="telegram">Telegram</option>
            <option value="email">Email</option>
          </select>
          <button
            onClick={addCustomerMessage}
            disabled={!customerText.trim() || adding}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Помощник ответа */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-500">
            ✨ Черновик ответа — glm-5.3 видит заказ, ТЗ, отклик и всю переписку
          </div>
          <button
            onClick={suggestReply}
            disabled={streaming || !lastCustomer}
            title={
              lastCustomer
                ? "Сгенерировать черновик ответа"
                : "Сначала добавьте сообщение заказчика"
            }
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {streaming ? "⏳ Генерация…" : "✨ Предложить ответ"}
          </button>
        </div>
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Указание для LLM (необязательно): «согласись, но предложи переписку», «запроси ТЗ письменно»…"
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {(draft || streaming) && (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y"
            />
            <div className="flex gap-2 mt-2 items-center flex-wrap">
              <select
                value={draftChannel}
                onChange={(e) => setDraftChannel(e.target.value as NegotiationChannel)}
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="fl">Отправлю на FL.ru</option>
                <option value="telegram">Отправлю в Telegram</option>
                <option value="email">Отправлю на Email</option>
              </select>
              <button
                onClick={copyDraft}
                disabled={!draft.trim()}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📋 Копировать
              </button>
              <button
                onClick={markSent}
                disabled={!draft.trim() || streaming}
                className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ✓ Отправлено — в ленту
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

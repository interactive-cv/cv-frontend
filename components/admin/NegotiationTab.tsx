"use client";

import { useEffect, useRef, useState } from "react";
import {
  addNegotiationMessage,
  deleteNegotiationMessage,
  listNegotiation,
  saveDraftReply,
  type NegotiationChannel,
  type NegotiationMessage,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import AssistantChat from "./AssistantChat";

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

export default function NegotiationTab({
  appId,
  initialDraft,
}: {
  appId: string;
  initialDraft: string | null;
}) {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Вставка сообщения заказчика
  const [customerText, setCustomerText] = useState("");
  const [customerChannel, setCustomerChannel] = useState<NegotiationChannel>("fl");

  // Поле «для заказчика»: редактируется, автосохраняется, отправляется в ленту
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [draftChannel, setDraftChannel] = useState<NegotiationChannel>("fl");
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCustomer = [...messages].reverse().find((m) => m.role === "customer");

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
  }, [messages.length]);

  // Автосохранение черновика (debounce 1.5s) — не теряется при перезагрузке
  function onDraftChange(v: string) {
    setDraft(v);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) saveDraftReply(token, appId, v).catch(() => {});
    }, 1500);
  }

  async function addCustomerMessage() {
    const text = customerText.trim();
    if (!text) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setError("");
    try {
      await addNegotiationMessage(token, appId, {
        role: "customer",
        channel: customerChannel,
        content: text,
      });
      setCustomerText("");
      setDraftChannel(customerChannel);
      await reload();
    } catch (e) {
      setError((e as Error).message);
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
      onDraftChange("");
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
    <div className="max-w-6xl">
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {notice && <p className="text-green-500 text-sm mb-4">{notice}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ===== Левая колонка: чат с заказчиком ===== */}
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 mb-2 font-medium">
            💬 Чат с заказчиком
          </div>

          {/* Лента */}
          <div className="flex flex-col gap-3 mb-4 max-h-[40vh] overflow-y-auto pr-1">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm">
                Переписки пока нет. Вставьте сообщение заказчика с площадки.
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
            <div ref={bottomRef} />
          </div>

          {/* Вставка сообщения заказчика */}
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 mb-3">
            <div className="text-[10px] text-gray-500 mb-1">
              ✉ От заказчика — вставьте копипаст с площадки
            </div>
            <textarea
              value={customerText}
              onChange={(e) => setCustomerText(e.target.value)}
              placeholder="Текст сообщения заказчика..."
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-y"
            />
            <div className="flex gap-2 mt-2 items-center">
              <select
                value={customerChannel}
                onChange={(e) => setCustomerChannel(e.target.value as NegotiationChannel)}
                className="bg-gray-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="fl">FL.ru</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={addCustomerMessage}
                disabled={!customerText.trim()}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Добавить в ленту
              </button>
            </div>
          </div>

          {/* Поле «для заказчика» */}
          <div className="bg-gray-900 rounded-xl p-3 border border-blue-900/50">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[10px] text-blue-400">
                ✍ Для заказчика — редактируйте, автосохранение
              </div>
              {lastCustomer && (
                <span className="text-[10px] text-gray-500">
                  отвечаем на сообщение от {formatTime(lastCustomer.created_at)}
                </span>
              )}
            </div>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="Здесь появится текст ответа (от ассистента справа) или пишите сами…"
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y"
            />
            <div className="flex gap-2 mt-2 items-center flex-wrap">
              <select
                value={draftChannel}
                onChange={(e) => setDraftChannel(e.target.value as NegotiationChannel)}
                className="bg-gray-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="fl">Отправлю на FL.ru</option>
                <option value="telegram">Отправлю в Telegram</option>
                <option value="email">Отправлю на Email</option>
              </select>
              <button
                onClick={copyDraft}
                disabled={!draft.trim()}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                📋 Копировать
              </button>
              <button
                onClick={markSent}
                disabled={!draft.trim()}
                className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                ✓ Отправлено — в ленту
              </button>
            </div>
          </div>
        </div>

        {/* ===== Правая колонка: тред с ассистентом ===== */}
        <div className="flex flex-col min-h-[60vh] lg:border-l lg:border-gray-800 lg:pl-4">
          <AssistantChat appId={appId} onDraft={(text) => onDraftChange(text)} />
        </div>
      </div>
    </div>
  );
}

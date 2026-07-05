"use client";

import { useEffect, useState } from "react";
import {
  listChats,
  getChat,
  type ChatSessionBrief,
  type ChatSessionDetail,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatSessionBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ChatSessionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    listChats(token)
      .then(setChats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openChat(id: string) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setLoadingDetail(true);
    setSelected(null);
    try {
      const detail = await getChat(token, id);
      setSelected(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoadingDetail(false);
    }
  }

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (error && !chats.length) return <p className="text-red-400">Ошибка: {error}</p>;

  // Группировка: по short_link_code, отдельная группа «Главная страница» (без code).
  const groups: Record<string, ChatSessionBrief[]> = {};
  for (const c of chats) {
    const key = c.short_link_code ?? "__main__";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  // Сортируем группы: главная страница вверху, потом по last_active
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "__main__") return -1;
    if (b === "__main__") return 1;
    const aLast = Math.max(...groups[a].map((c) => new Date(c.last_active_at).getTime()));
    const bLast = Math.max(...groups[b].map((c) => new Date(c.last_active_at).getTime()));
    return bLast - aLast;
  });

  function renderChatCard(c: ChatSessionBrief) {
    return (
      <button
        key={c.id}
        onClick={() => openChat(c.id)}
        className={`text-left bg-gray-900 rounded-xl p-3 hover:bg-gray-800 transition-colors border w-full ${
          selected?.id === c.id ? "border-blue-500" : "border-gray-800"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {c.is_admin && <span className="text-xs">👑</span>}
            <span className="font-medium text-sm">{c.display_name}</span>
          </div>
          <span className="text-xs text-gray-400">{c.message_count} сообщ.</span>
        </div>
        <div className="text-gray-500 text-xs mt-1">
          {new Date(c.last_active_at).toLocaleString("ru-RU")}
        </div>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Список чатов — сгруппированный */}
      <div>
        <h1 className="text-xl font-bold mb-4">💬 Чаты ({chats.length})</h1>
        {chats.length === 0 ? (
          <p className="text-gray-500">Пока нет диалогов.</p>
        ) : (
          <div className="grid gap-4">
            {sortedKeys.map((key) => (
              <div key={key}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                  {key === "__main__" ? "🌐 Главная страница" : `🔗 ${key}`}
                </div>
                <div className="grid gap-2">
                  {groups[key].map(renderChatCard)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Просмотр диалога */}
      <div>
        {loadingDetail && <p className="text-gray-500">Загрузка диалога...</p>}
        {selected && (
          <div>
            <h2 className="text-sm font-semibold mb-3">
              {selected.visitor_name || "Аноним"}
              {selected.short_link_code && (
                <span className="text-blue-400 ml-2">🔗 {selected.short_link_code}</span>
              )}
            </h2>
            <div className="bg-gray-900 rounded-xl p-4 max-h-[600px] overflow-y-auto grid gap-3">
              {selected.messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-2 text-sm ${
                    m.role === "user" ? "bg-gray-800 ml-8" : "bg-blue-900/30 mr-8"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {m.role === "user" ? "HR" : "AI"} ·{" "}
                    {new Date(m.created_at).toLocaleTimeString("ru-RU")}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-200">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!selected && !loadingDetail && (
          <p className="text-gray-500 text-sm">Выберите чат слева для просмотра диалога.</p>
        )}
      </div>
    </div>
  );
}

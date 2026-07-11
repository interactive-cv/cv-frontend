"use client";

import { useState } from "react";
import {
  createInterview,
  deleteInterview,
  updateInterview,
  type Interview,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Преобразует ISO → значение для <input type="datetime-local"> (локальное время). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export default function InterviewsTab({
  appId,
  interviews,
  onChanged,
}: {
  appId: string;
  interviews: Interview[];
  onChanged: () => void;
}) {
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Форма создания
  const [newDate, setNewDate] = useState("");
  const [newBefore, setNewBefore] = useState("");

  // Форма редактирования
  const [editDate, setEditDate] = useState("");
  const [editBefore, setEditBefore] = useState("");
  const [editAfter, setEditAfter] = useState("");

  async function handleCreate() {
    if (!newDate) {
      setError("Укажите дату и время");
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await createInterview(token, appId, {
        scheduled_at: new Date(newDate).toISOString(),
        notes_before: newBefore || undefined,
      });
      setNewDate("");
      setNewBefore("");
      setError("");
      onChanged();
    } catch (e) {
      setError(`Ошибка: ${(e as Error).message}`);
    }
  }

  function startEdit(iv: Interview) {
    setEditingId(iv.id);
    setEditDate(toLocalInput(iv.scheduled_at));
    setEditBefore(iv.notes_before ?? "");
    setEditAfter(iv.notes_after ?? "");
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await updateInterview(token, editingId, {
        scheduled_at: new Date(editDate).toISOString(),
        notes_before: editBefore || undefined,
        notes_after: editAfter || undefined,
      });
      setEditingId(null);
      setError("");
      onChanged();
    } catch (e) {
      setError(`Ошибка: ${(e as Error).message}`);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить этот этап собеседования?")) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await deleteInterview(token, id);
      onChanged();
    } catch (e) {
      setError(`Ошибка: ${(e as Error).message}`);
    }
  }

  return (
    <div className="grid gap-4 max-w-2xl">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Создание нового */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">+ Добавить этап</h3>
        <div className="grid gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Дата и время</label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Заметки до (необязательно)</label>
            <textarea
              value={newBefore}
              onChange={(e) => setNewBefore(e.target.value)}
              placeholder="Что подготовить, ссылки, имена интервьюеров..."
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-y"
            />
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Список интервью */}
      {interviews.length === 0 ? (
        <p className="text-gray-500 text-sm">Пока нет запланированных собеседований.</p>
      ) : (
        <div className="grid gap-3">
          {interviews.map((iv) => (
            <div key={iv.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              {editingId === iv.id ? (
                /* Режим редактирования */
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Дата и время</label>
                    <input
                      type="datetime-local"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Заметки до</label>
                    <textarea
                      value={editBefore}
                      onChange={(e) => setEditBefore(e.target.value)}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Заметки после</label>
                    <textarea
                      value={editAfter}
                      onChange={(e) => setEditAfter(e.target.value)}
                      placeholder="Как прошло, фидбек, следующие шаги..."
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-y"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                /* Режим просмотра */
                <div>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-200 text-sm">
                      📅 {formatDateTime(iv.scheduled_at)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(iv)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        ✎ Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(iv.id)}
                        className="text-xs text-red-400/70 hover:text-red-400"
                      >
                        🗑 Удалить
                      </button>
                    </div>
                  </div>
                  {iv.notes_before && (
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="text-gray-500">До:</span> {iv.notes_before}
                    </div>
                  )}
                  {iv.notes_after && (
                    <div className="mt-1 text-xs text-gray-400">
                      <span className="text-gray-500">После:</span> {iv.notes_after}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

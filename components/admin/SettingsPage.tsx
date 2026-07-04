"use client";

import { useEffect, useState } from "react";
import {
  applyMasterCv,
  getSettings,
  previewMasterCvEdit,
  updateSettings,
  type Settings,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import SplitEditor from "./SplitEditor";
import TypingIndicator from "@/components/chat/TypingIndicator";

type SectionKey =
  | "master_cv"
  | "readme"
  | "prompt_chat"
  | "prompt_generate"
  | "prompt_generate_freelance"
  | "prompt_cv_edit";

const SECTION_META: Record<
  SectionKey,
  { title: string; icon: string; hint: string; height: number }
> = {
  master_cv: {
    title: "Мастер-CV",
    icon: "📄",
    hint: "Единый источник правды. Этот текст попадает в LLM как контекст (чат + генерация). Редактируйте как markdown.",
    height: 450,
  },
  readme: {
    title: "README (GitHub-профиль)",
    icon: "📖",
    hint: "README для вашего GitHub-профиля. Хранится в БД. Для пуша в GitHub — скопируйте и вставьте вручную.",
    height: 350,
  },
  prompt_chat: {
    title: "Промпт HR-чата",
    icon: "💬",
    hint: 'Системный промпт AI-ассистента для рекрутёров. Плейсхолдеры: {name} (имя кандидата), {cv_markdown} (текст CV).',
    height: 300,
  },
  prompt_generate: {
    title: "Промпт генерации отклика (вакансии)",
    icon: "⚡",
    hint: "Промпт для AI-генерации CV и cover letter из вакансии. Плейсхолдеры: {cv_markdown}, {vacancy_text}, {selected_projects}, {cv_link}.",
    height: 350,
  },
  prompt_generate_freelance: {
    title: "Промпт генерации отклика (фриланс)",
    icon: "🚀",
    hint: "Промпт для AI-генерации CV и cover letter для фриланс-заказов (FL.ru). Плейсхолдеры: {cv_markdown}, {vacancy_text}, {selected_projects}, {cv_link}.",
    height: 350,
  },
  prompt_cv_edit: {
    title: "Промпт AI-правки CV",
    icon: "🤖",
    hint: "Промпт для AI-редактирования мастер-CV по инструкции. Плейсхолдеры: {current_cv}, {instruction}.",
    height: 250,
  },
};

export default function SettingsPage() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState<SectionKey | null>(null);
  const [msgKey, setMsgKey] = useState<SectionKey | null>(null);
  const [msg, setMsg] = useState("");

  // AI-правка мастер-CV
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiPreview, setAiPreview] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Грязность по секциям
  const [dirty, setDirty] = useState<Set<SectionKey>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    getSettings(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function onChange(key: SectionKey, value: string) {
    if (!data) return;
    setData({ ...data, [key]: { ...data[key], value } });
    setDirty((prev) => new Set(prev).add(key));
  }

  async function saveKey(key: SectionKey) {
    if (!data) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setSavingKey(key);
    setError("");
    try {
      const updated = await updateSettings(token, { [key]: data[key].value });
      setData(updated);
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setMsgKey(key);
      setMsg("✓ Сохранено");
      setTimeout(() => {
        setMsg("");
        setMsgKey(null);
      }, 2000);
    } catch (e) {
      setError(`Ошибка сохранения: ${(e as Error).message}`);
    } finally {
      setSavingKey(null);
    }
  }

  async function handleAiPreview() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !aiInstruction.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiPreview("");
    try {
      const result = await previewMasterCvEdit(token, aiInstruction);
      setAiPreview(result.preview_markdown);
    } catch (e) {
      setAiError(`Ошибка AI: ${(e as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAiApply() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !aiPreview) return;
    setAiLoading(true);
    setAiError("");
    try {
      const updated = await applyMasterCv(token, aiPreview);
      setData(updated);
      setAiInstruction("");
      setAiPreview("");
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete("master_cv");
        return next;
      });
      setMsgKey("master_cv");
      setMsg("✓ CV обновлён через AI");
      setTimeout(() => {
        setMsg("");
        setMsgKey(null);
      }, 3000);
    } catch (e) {
      setAiError(`Ошибка применения: ${(e as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  }

  function copyToClipboard(key: SectionKey) {
    if (!data) return;
    navigator.clipboard.writeText(data[key].value);
    setMsgKey(key);
    setMsg("📋 Скопировано в буфер");
    setTimeout(() => {
      setMsg("");
      setMsgKey(null);
    }, 2000);
  }

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (error && !data) return <p className="text-red-400">Ошибка: {error}</p>;
  if (!data) return null;

  const sections: SectionKey[] = [
    "master_cv",
    "readme",
    "prompt_chat",
    "prompt_generate",
    "prompt_generate_freelance",
    "prompt_cv_edit",
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-6">⚙ Настройки</h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="grid gap-6">
        {sections.map((key) => {
          const meta = SECTION_META[key];
          const isDirty = dirty.has(key);
          const isSaving = savingKey === key;
          const isMsg = msgKey === key;
          return (
            <div key={key} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">
                  {meta.icon} {meta.title}
                  {isDirty && <span className="text-amber-400 ml-2">●</span>}
                </h2>
                {isMsg && <span className="text-green-400 text-xs">{msg}</span>}
              </div>
              <p className="text-xs text-gray-500 mb-3">{meta.hint}</p>

              <SplitEditor
                label=""
                value={data[key].value}
                onChange={(v) => onChange(key, v)}
                minHeight={meta.height}
              />

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => saveKey(key)}
                  disabled={isSaving || !isDirty}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
                {key === "readme" && (
                  <button
                    onClick={() => copyToClipboard(key)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    📋 Скопировать
                  </button>
                )}
              </div>

              {/* AI-правка только для мастер-CV */}
              {key === "master_cv" && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-semibold mb-2">🤖 AI-правка</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Опишите, что изменить в CV. LLM вернёт предпросмотр —
                    примените, если устроит.
                  </p>
                  <textarea
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    placeholder="Например: добавь проект «Банк X» с ролями backend и DevOps"
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-y mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAiPreview}
                      disabled={aiLoading || !aiInstruction.trim()}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {aiLoading ? "Думаю..." : "🔍 Предпросмотр"}
                    </button>
                    {aiPreview && (
                      <button
                        onClick={handleAiApply}
                        disabled={aiLoading}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ✓ Применить
                      </button>
                    )}
                    {aiPreview && (
                      <button
                        onClick={() => setAiPreview("")}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                  {aiError && <p className="text-red-400 text-xs mt-2">{aiError}</p>}
                  {aiLoading && (
                    <div className="mt-3 flex items-center gap-3">
                      <TypingIndicator />
                      <span className="text-gray-500 text-sm">AI редактирует CV...</span>
                    </div>
                  )}
                  {aiPreview && !aiLoading && (
                    <div className="mt-3 bg-gray-950 rounded-lg p-3 border border-purple-900/50 max-h-[400px] overflow-auto">
                      <div className="text-xs text-purple-400 mb-2">
                        📋 Предпросмотр (не сохранено):
                      </div>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {aiPreview}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

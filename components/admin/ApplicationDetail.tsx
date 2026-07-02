"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApplication, updateApplication, publishApplication, archiveApplication } from "@/lib/admin";
import type { ApplicationDetail } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import SplitEditor from "./SplitEditor";

type Tab = "cv" | "cover" | "vacancy" | "analytics";

const STATUS_DOT: Record<string, string> = {
  active: "#22c55e",
  draft: "#f59e0b",
  archived: "#6b7280",
};

export default function ApplicationDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [tab, setTab] = useState<Tab>("cv");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Отслеживаем, были ли несохранённые правки (для подтверждения отмены).
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    getApplication(token, id)
      .then(setData)
      .catch(() => setMsg("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveEdits() {
    if (!data) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setSaving(true);
    try {
      await updateApplication(token, id, {
        cv_markdown: data.cv_markdown,
        cover_letter: data.cover_letter,
      });
      setMsg("✓ Сохранено");
      setDirty(false);
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    // Если были правки — предупреждаем об их потере. Если нет — просто уходим.
    if (dirty) {
      if (
        !window.confirm(
          "Отменить редактирование?\n\nНесохранённые правки будут потеряны."
        )
      ) {
        return;
      }
    }
    router.push("/admin");
  }

  async function publish() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !data) return;
    try {
      const result = await publishApplication(token, id);
      setData({ ...data, status: "active", short_link_code: result.code });
      setMsg(`✓ Опубликовано: ${result.url}`);
    } catch {
      setMsg("Ошибка публикации");
    }
  }

  async function archive() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !data) return;
    try {
      await archiveApplication(token, id);
      setData({ ...data, status: "archived" });
      setMsg("✓ Архивировано");
    } catch {
      setMsg("Ошибка");
    }
  }

  function copyLink() {
    if (!data?.short_link_code) return;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv.example.com";
    navigator.clipboard.writeText(`${siteUrl}/${data.short_link_code}`);
    setMsg("✓ Ссылка скопирована");
    setTimeout(() => setMsg(""), 2000);
  }

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (!data) return <p className="text-red-400">{msg || "Не найдено"}</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "cv", label: "📄 CV" },
    { id: "cover", label: "✉ Отклик" },
    { id: "vacancy", label: "📋 Вакансия" },
    { id: "analytics", label: "📊 Аналитика" },
  ];

  return (
    <div>
      {/* Шапка */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">
            {data.company} — {data.role}
          </h1>
          <span style={{ color: STATUS_DOT[data.status] }} className="text-xs">
            ● {data.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            ← Отменить
          </button>
          {data.short_link_code && (
            <button
              onClick={copyLink}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              🔗 Копировать ссылку
            </button>
          )}
          {data.status === "draft" && (
            <button
              onClick={publish}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              📤 Опубликовать
            </button>
          )}
          {data.status === "active" && (
            <button
              onClick={archive}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              📦 Архивировать
            </button>
          )}
        </div>
      </div>

      {msg && <p className="text-sm text-blue-400 mb-3">{msg}</p>}

      {/* Табы */}
      <div className="flex gap-1 border-b border-gray-800 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 ${
              tab === t.id
                ? "text-white border-blue-500"
                : "text-gray-500 border-transparent hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Контент табов */}
      {tab === "cv" && (
        <div>
          <SplitEditor
            label="✏ CV (редактируйте markdown)"
            value={data.cv_markdown}
            onChange={(v) => {
              setData({ ...data, cv_markdown: v });
              setDirty(true);
            }}
            minHeight={350}
          />
          <button
            onClick={saveEdits}
            disabled={saving}
            className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      )}

      {tab === "cover" && (
        <div>
          <SplitEditor
            label="✏ Cover letter / отклик (плейн-текст для копипаста в Telegram/email)"
            value={data.cover_letter}
            onChange={(v) => {
              setData({ ...data, cover_letter: v });
              setDirty(true);
            }}
            minHeight={200}
          />
          <button
            onClick={saveEdits}
            disabled={saving}
            className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Cover letter не публикуется на сайте — только для вас (скопировать в отклик на площадке).
          </p>
        </div>
      )}

      {tab === "vacancy" && (
        <pre className="bg-gray-900 rounded-lg p-4 text-sm whitespace-pre-wrap font-sans text-gray-300 min-h-[200px]">
          {data.vacancy_text}
        </pre>
      )}

      {tab === "analytics" && (
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{data.total_clicks}</div>
              <div className="text-xs text-gray-500 mt-1">всего кликов</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{data.unique_clicks}</div>
              <div className="text-xs text-gray-500 mt-1">уникальных</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">
                {data.short_link_code ? "✓" : "—"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {data.short_link_code ? "ссылка активна" : "нет ссылки"}
              </div>
            </div>
          </div>
          {data.short_link_code && (
            <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-400">
              🔗{" "}
              {(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "")}/
              <strong className="text-gray-200">{data.short_link_code}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

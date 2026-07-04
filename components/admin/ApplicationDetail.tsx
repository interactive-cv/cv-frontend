"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  archiveApplication,
  getApplication,
  publishApplication,
  updateApplication,
  type ApplicationDetail,
  type ApplicationKind,
} from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import SplitEditor from "./SplitEditor";

type Tab = "cv" | "cover" | "vacancy" | "details" | "analytics";

const STATUS_DOT: Record<string, string> = {
  active: "#22c55e",
  draft: "#f59e0b",
  archived: "#6b7280",
};

const KIND_LABEL: Record<string, string> = {
  vacancy: "💼 Вакансия",
  freelance: "🚀 Фриланс",
};

export default function ApplicationDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [tab, setTab] = useState<Tab>("cv");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
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

  async function saveDetails() {
    if (!data) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setSaving(true);
    try {
      await updateApplication(token, id, {
        kind: data.kind,
        source_url: data.source_url ?? undefined,
        chat_url: data.chat_url ?? undefined,
        budget: data.budget ?? undefined,
        applicant_count: data.applicant_count ?? undefined,
        deadline: data.deadline ?? undefined,
        expected_term: data.expected_term ?? undefined,
        rating: data.rating ?? undefined,
      });
      setMsg("✓ Детали сохранены");
      setDirty(false);
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (dirty) {
      if (!window.confirm("Отменить редактирование?\n\nНесохранённые правки будут потеряны.")) {
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

  function setRating(r: number) {
    if (!data) return;
    setData({ ...data, rating: r === data.rating ? 0 : r });
    setDirty(true);
  }

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (!data) return <p className="text-red-400">{msg || "Не найдено"}</p>;

  const isFreelance = data.kind === "freelance";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv.example.com";

  const tabs: { id: Tab; label: string }[] = [
    { id: "cv", label: "📄 CV" },
    { id: "cover", label: "✉ Отклик" },
    { id: "vacancy", label: isFreelance ? "📋 Заказ" : "📋 Вакансия" },
    { id: "details", label: "⚙ Детали" },
    { id: "analytics", label: "📊 Аналитика" },
  ];

  return (
    <div>
      {/* Шапка */}
      <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {data.company} — {data.role}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span style={{ color: STATUS_DOT[data.status] }} className="text-xs">
              ● {data.status}
            </span>
            <span className="text-xs text-gray-400">{KIND_LABEL[data.kind] ?? data.kind}</span>
            {data.rating ? (
              <span className="text-xs text-amber-400">
                {"★".repeat(data.rating)}
                <span className="text-gray-600">{"★".repeat(5 - data.rating)}</span>
              </span>
            ) : null}
          </div>
          {/* Кликабельные ссылки */}
          {(data.source_url || data.chat_url) && (
            <div className="flex gap-3 mt-2">
              {data.source_url && (
                <a
                  href={data.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  📄 {isFreelance ? "Проект" : "Вакансия"}
                </a>
              )}
              {data.chat_url && (
                <a
                  href={data.chat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  💬 {isFreelance ? "Заказчик" : "HR"}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
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
      <div className="flex gap-1 border-b border-gray-800 mb-4 flex-wrap">
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
          {data.short_link_code && (
            <div className="mt-4 bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">🔗 Ссылка на это CV (вставлена в cover letter):</div>
              <a
                href={`${siteUrl}/${data.short_link_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
              >
                {siteUrl.replace(/^https?:\/\//, "")}/{data.short_link_code}
              </a>
            </div>
          )}
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

      {tab === "details" && (
        <div className="grid gap-4 max-w-xl">
          {/* Тип */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Тип отклика</label>
            <div className="flex gap-2">
              {(["vacancy", "freelance"] as ApplicationKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setData({ ...data, kind: k });
                    setDirty(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    data.kind === k
                      ? k === "freelance"
                        ? "bg-purple-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          {/* Ссылки */}
          <div className="grid grid-cols-1 gap-3">
            <Field
              label="Ссылка на вакансию/проект"
              value={data.source_url ?? ""}
              onChange={(v) => {
                setData({ ...data, source_url: v });
                setDirty(true);
              }}
              placeholder="https://..."
            />
            <Field
              label="Ссылка на диалог с HR/заказчиком"
              value={data.chat_url ?? ""}
              onChange={(v) => {
                setData({ ...data, chat_url: v });
                setDirty(true);
              }}
              placeholder="https://..."
            />
          </div>

          {/* Поля фриланс-заказа */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Бюджет"
              value={data.budget ?? ""}
              onChange={(v) => {
                setData({ ...data, budget: v });
                setDirty(true);
              }}
              placeholder="50 000 ₽"
            />
            <Field
              label="Конкурс (откликнулись)"
              value={data.applicant_count?.toString() ?? ""}
              onChange={(v) => {
                setData({ ...data, applicant_count: v ? parseInt(v, 10) : null });
                setDirty(true);
              }}
              placeholder="12"
              type="number"
            />
            <Field
              label="Срок сдачи"
              value={data.deadline ? data.deadline.slice(0, 10) : ""}
              onChange={(v) => {
                setData({ ...data, deadline: v || null });
                setDirty(true);
              }}
              type="date"
            />
            <Field
              label="Ожидаемый срок сотрудничества"
              value={data.expected_term ?? ""}
              onChange={(v) => {
                setData({ ...data, expected_term: v });
                setDirty(true);
              }}
              placeholder="2 недели"
            />
          </div>

          {/* Рейтинг */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Рейтинг</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= (data.rating ?? 0) ? "text-amber-400" : "text-gray-600"
                  } hover:text-amber-300`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={saveDetails}
            disabled={saving || !dirty}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit"
          >
            {saving ? "Сохранение..." : "Сохранить детали"}
          </button>
        </div>
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
              🔗 {siteUrl.replace(/^https?:\/\//, "")}/
              <strong className="text-gray-200">{data.short_link_code}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Поле ввода с подписью. */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

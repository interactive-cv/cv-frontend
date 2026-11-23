"use client";

import { useEffect, useState } from "react";
import { getLlmSettings, updateLlmSettings, type LlmSettings } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

/** Короткие подписи моделей для UI (glm-5.3-flash → «Flash»). */
function modelLabel(m: string): string {
  if (m === "glm-5.3-flash") return "Flash";
  if (m === "glm-5.4") return "5.4";
  return m;
}

/** Подписи уровней рассуждений (порядок = available_reasoning_efforts). */
const EFFORT_LABELS: Record<string, string> = {
  low: "Низкий",
  high: "Высокий",
  max: "Макс",
};

/**
 * Выбор LLM-модели и уровня рассуждений для ВСЕХ вызовов z.ai из админки
 * (генерация откликов, диалоги, ассистент, HR-чат). Хранится на бэкенде
 * (app_setting), применяется без перезапуска.
 */
export default function LlmControls({ className = "" }: { className?: string }) {
  const [settings, setSettings] = useState<LlmSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    getLlmSettings(token)
      .then(setSettings)
      .catch(() => setError("Не удалось загрузить настройки LLM"));
  }, []);

  async function save(patch: Partial<Pick<LlmSettings, "model" | "reasoning_effort">>) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !settings || saving) return;
    const prev = settings;
    // Оптимистичное обновление: UI реагирует сразу, при ошибке откат.
    setSettings({ ...settings, ...patch });
    setSaving(true);
    setError(null);
    try {
      setSettings(await updateLlmSettings(token, patch));
    } catch (e) {
      setSettings(prev);
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    // Скелет тех же размеров, чтобы шапка не прыгала.
    return (
      <div className={`px-2 mb-4 ${className}`} aria-busy="true">
        <div className="h-5 rounded-full bg-gray-800/60 mb-2" />
        <div className="h-4 rounded bg-gray-800/60" />
      </div>
    );
  }

  const efforts = settings.available_reasoning_efforts;
  const effortIdx = Math.max(0, efforts.indexOf(settings.reasoning_effort));

  return (
    <div className={`px-2 mb-4 ${className}`}>
      {/* Модель: ползунок в стиле ThemeToggle, два сегмента */}
      <div
        role="radiogroup"
        aria-label="Модель LLM"
        title={`Модель для всех LLM-вызовов: ${settings.model}`}
        className="flex h-6 rounded-full bg-gray-800 overflow-hidden mb-2"
      >
        {settings.available_models.map((m) => {
          const active = settings.model === m;
          return (
            <button
              key={m}
              onClick={() => !active && save({ model: m })}
              role="radio"
              aria-checked={active}
              title={m}
              className={`flex-1 text-[10px] font-semibold rounded-full transition-colors duration-200 leading-none py-1 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              } ${saving ? "opacity-70 cursor-wait" : ""}`}
            >
              {modelLabel(m)}
            </button>
          );
        })}
      </div>

      {/* Уровень рассуждений: слайдер от «Низкий» до «Макс» */}
      <input
        type="range"
        min={0}
        max={efforts.length - 1}
        step={1}
        value={effortIdx}
        onChange={(e) => {
          const v = efforts[Number(e.target.value)];
          if (v && v !== settings.reasoning_effort) save({ reasoning_effort: v });
        }}
        aria-label="Уровень рассуждений"
        title={`Уровень рассуждений: ${EFFORT_LABELS[settings.reasoning_effort] ?? settings.reasoning_effort}`}
        className="w-full h-1.5 accent-blue-600 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] leading-none mt-1">
        {efforts.map((v) => (
          <span
            key={v}
            className={
              v === settings.reasoning_effort
                ? "text-white font-semibold"
                : "text-gray-500"
            }
          >
            {EFFORT_LABELS[v] ?? v}
          </span>
        ))}
      </div>

      {error && (
        <div className="text-[10px] text-red-400 mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

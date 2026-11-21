"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listLLMCalls, type LLMCall } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

function fmtTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("ru-RU", { hour12: false });
}

function fmtDuration(s: number | null): string {
  if (s === null) return "";
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)}с`;
  const m = Math.floor(s / 60);
  return `${m}м ${String(Math.round(s % 60)).padStart(2, "0")}с`;
}

/**
 * Живой журнал обращений к z.ai — плавающий виджет админки.
 * Показывает в момент вызова: источник, фактически отправленные модель
 * и уровень «думания», статус и длительность. Тела запросов не показываются.
 * Опрос — раз в 3 с, только пока панель открыта.
 */
export default function LLMLogWidget() {
  const [open, setOpen] = useState(false);
  const [calls, setCalls] = useState<LLMCall[]>([]);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      setCalls(await listLLMCalls(token));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    reload();
    timer.current = setInterval(reload, 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [open, reload]);

  const running = calls.some((c) => c.status === "running");

  return (
    <>
      {/* Кнопка */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Журнал обращений к LLM (z.ai): модель и уровень думания"
        className={`fixed bottom-4 right-4 z-50 rounded-full w-11 h-11 text-lg shadow-lg
          border transition-colors ${
            running
              ? "bg-green-900/80 border-green-600 text-green-300"
              : "bg-gray-900/90 border-gray-700 text-gray-300 hover:text-white"
          }`}
      >
        🤖
        {running && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        )}
      </button>

      {/* Панель журнала */}
      {open && (
        <div className="fixed bottom-18 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl
          border border-gray-700 bg-gray-950/95 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-3 py-2 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-300">
              LLM-вызовы {running && <span className="text-green-400">· идёт обращение…</span>}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white text-sm leading-none"
              title="Свернуть"
            >
              ×
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed">
            {error && <p className="text-red-400 p-2">{error}</p>}
            {!error && calls.length === 0 && (
              <p className="text-gray-600 p-2">
                Обращений пока не было. Сгенерируйте отклик или напишите в чат —
                здесь появятся фактические модель и уровень «думания».
              </p>
            )}
            {calls.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 px-2 py-1 rounded ${
                  c.status === "error" ? "text-red-300" : "text-gray-300"
                }`}
                title={c.error ? `Ошибка: ${c.error}` : `${c.source} · t=${c.temperature}`}
              >
                <span className="text-gray-500 shrink-0">{fmtTime(c.started_at)}</span>
                <span className="text-blue-300 shrink-0 w-24 truncate">{c.source}</span>
                <span className="shrink-0 font-medium">{c.model}</span>
                <span className="text-amber-300/90 shrink-0">effort: {c.effort}</span>
                <span className="flex-1" />
                {c.status === "running" && (
                  <span className="text-green-400 animate-pulse shrink-0">⏳</span>
                )}
                {c.status === "ok" && (
                  <span className="text-green-500/80 shrink-0">✓ {fmtDuration(c.duration_s)}</span>
                )}
                {c.status === "error" && (
                  <span className="shrink-0">✗ {fmtDuration(c.duration_s)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

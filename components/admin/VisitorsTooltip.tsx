"use client";

import { useEffect, useRef, useState } from "react";
import { getVisitors, type Visitor } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

/**
 * Tooltip/popover при наведении на «Уникальных: N».
 * Показывает список уникальных посетителей с именами («Крепкий Кабан» и т.д.),
 * количеством просмотров и индикатором чата.
 *
 * Кэширует результат по appId — загружает один раз.
 */
export default function VisitorsTooltip({
  appId,
  uniqueCount,
}: {
  appId: string;
  uniqueCount: number;
}) {
  const [visitors, setVisitors] = useState<Visitor[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show && visitors === null && !loading) {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;
      getVisitors(token, appId)
        .then(setVisitors)
        .catch(() => setVisitors([]))
        .finally(() => setLoading(false));
    }
  }, [show, visitors, loading, appId]);

  function handleEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  }

  function handleLeave() {
    timerRef.current = setTimeout(() => setShow(false), 200);
  }

  if (uniqueCount === 0) {
    return <span>👤 уникальных: <strong className="text-gray-200">0</strong></span>;
  }

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span>
        👤 уникальных: <strong className="text-gray-200 underline decoration-dotted">{uniqueCount}</strong>
      </span>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-950 border border-gray-700 rounded-xl p-3 shadow-2xl z-50 text-xs">
          {loading && <p className="text-gray-500">Загрузка...</p>}
          {visitors && visitors.length === 0 && (
            <p className="text-gray-500">
              Данные о посетителях появятся после кликов с новым трекингом.
            </p>
          )}
          {visitors && visitors.length > 0 && (
            <div className="grid gap-1.5">
              {visitors.map((v) => (
                <div key={v.session_id} className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    {v.is_admin && <span>👑</span>}
                    {v.display_name}
                    {v.has_chat && <span title="Был чат" className="text-blue-400">💬</span>}
                  </span>
                  <span className="text-gray-500">
                    {v.views} просм.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

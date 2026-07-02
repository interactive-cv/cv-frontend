"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listApplications, type Application } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

const STATUS_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  active: { color: "#22c55e", dot: "●", label: "active" },
  draft: { color: "#f59e0b", dot: "●", label: "draft" },
  archived: { color: "#6b7280", dot: "●", label: "archived" },
};

export default function ApplicationList() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    listApplications(token)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (error) return <p className="text-red-400">Ошибка: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Отклики ({items.length})</h1>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">
          Пока нет откликов.{" "}
          <Link href="/admin/new" className="text-blue-400 underline">
            Создайте первый
          </Link>
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map((app) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
            return (
              <Link
                key={app.id}
                href={`/admin/${app.id}`}
                className="block bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-colors"
                style={{ borderLeft: `3px solid ${cfg.color}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-base">
                      {app.company} — {app.role}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {app.published_at
                        ? `Опубликован: ${new Date(app.published_at).toLocaleDateString("ru-RU")}`
                        : `Создан: ${new Date(app.created_at).toLocaleDateString("ru-RU")}`}
                    </div>
                  </div>
                  <span style={{ color: cfg.color }} className="text-xs font-medium">
                    {cfg.dot} {cfg.label}
                  </span>
                </div>
                {/* inline-аналитика */}
                <div className="flex gap-5 mt-3 text-xs text-gray-400">
                  {app.short_link_code && (
                    <span>
                      🔗 {siteUrl.replace(/^https?:\/\//, "")}/
                      <strong className="text-gray-300">{app.short_link_code}</strong>
                    </span>
                  )}
                  <span>
                    👁 кликов: <strong className="text-gray-200">{app.total_clicks}</strong>
                  </span>
                  <span>
                    👤 уникальных:{" "}
                    <strong className="text-gray-200">{app.unique_clicks}</strong>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

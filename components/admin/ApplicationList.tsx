"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listApplications, type Application, type ApplicationKind } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";
import VisitorsTooltip from "./VisitorsTooltip";
import UpcomingInterviews from "./UpcomingInterviews";

const STATUS_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  active: { color: "#22c55e", dot: "●", label: "active" },
  draft: { color: "#f59e0b", dot: "●", label: "draft" },
  archived: { color: "#6b7280", dot: "●", label: "archived" },
};

const KIND_BADGE: Record<string, string> = {
  vacancy: "💼",
  freelance: "🚀",
  contest: "🏆",
};

const KIND_LABEL_RU: Record<string, string> = {
  vacancy: "Вакансии",
  freelance: "Фриланс",
  contest: "Конкурсы",
};

type Filter = "all" | ApplicationKind;

export default function ApplicationList() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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

  const filtered = filter === "all" ? items : items.filter((a) => a.kind === filter);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div>
      <UpcomingInterviews />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold">Отклики ({filtered.length})</h1>
        {/* Фильтр по типу */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {(["all", "vacancy", "freelance", "contest"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Все" : `${KIND_BADGE[f]} ${KIND_LABEL_RU[f]}`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">
          {items.length === 0 ? "Пока нет откликов. " : "Нет откликов этого типа. "}
          <Link href="/admin/new" className="text-blue-400 underline">
            Создайте первый
          </Link>
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
            const isFreelance = app.kind === "freelance";
            const isFreelanceLike = app.kind === "freelance" || app.kind === "contest";
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
                      {KIND_BADGE[app.kind] ?? "📋"} {app.company ? `${app.company} — ` : ""}{app.role}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {app.published_at
                        ? `Опубликован: ${new Date(app.published_at).toLocaleDateString("ru-RU")}`
                        : `Создан: ${new Date(app.created_at).toLocaleDateString("ru-RU")}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.rating ? (
                      <span className="text-amber-400 text-xs">
                        {"★".repeat(app.rating)}
                      </span>
                    ) : null}
                    <span style={{ color: cfg.color }} className="text-xs font-medium">
                      {cfg.dot} {cfg.label}
                    </span>
                  </div>
                </div>
                {/* inline-аналитика + freelance-поля */}
                <div className="flex gap-5 mt-3 text-xs text-gray-400 flex-wrap">
                  {isFreelanceLike && app.budget && (
                    <span>
                      💰 <strong className="text-gray-200">{app.budget}</strong>
                    </span>
                  )}
                  {isFreelanceLike && app.deadline && (
                    <span>
                      📅 до {new Date(app.deadline).toLocaleDateString("ru-RU")}
                    </span>
                  )}
                  {isFreelanceLike && app.applicant_count != null && (
                    <span>
                      👥 участников: <strong className="text-gray-200">{app.applicant_count}</strong>
                    </span>
                  )}
                  {app.short_link_code && (
                    <span>
                      🔗 {siteUrl.replace(/^https?:\/\//, "")}/
                      <strong className="text-gray-300">{app.short_link_code}</strong>
                    </span>
                  )}
                  <span>
                    👁 кликов: <strong className="text-gray-200">{app.total_clicks}</strong>
                  </span>
                  <VisitorsTooltip appId={app.id} uniqueCount={app.unique_clicks} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

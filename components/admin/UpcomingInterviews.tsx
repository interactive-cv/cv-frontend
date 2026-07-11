"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUpcoming, type Interview } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

function urgencyLevel(iso: string): "now" | "soon" | "later" {
  const now = new Date();
  const iv = new Date(iso);
  const diffHours = (iv.getTime() - now.getTime()) / 3600000;
  if (diffHours < 24) return "now";      // сегодня/просрочено
  if (diffHours < 72) return "soon";     // завтра-послезавтра
  return "later";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const URGENCY_STYLE: Record<string, { dot: string; label: string; text: string }> = {
  now: { dot: "bg-red-500", label: "🔴 скоро", text: "text-red-300" },
  soon: { dot: "bg-amber-500", label: "🟡 на днях", text: "text-amber-300" },
  later: { dot: "bg-gray-500", label: "⚪ позже", text: "text-gray-300" },
};

export default function UpcomingInterviews() {
  const [items, setItems] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    getUpcoming(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-400 mb-3">
        📅 Ближайшие собеседования
      </h2>
      <div className="grid gap-2">
        {items.map((iv) => {
          const urgency = urgencyLevel(iv.scheduled_at);
          const style = URGENCY_STYLE[urgency];
          return (
            <Link
              key={iv.id}
              href={`/admin/${iv.application_id}`}
              className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">
                  {iv.application_company ? `${iv.application_company} — ` : ""}
                  {iv.application_role}
                </div>
                <div className={`text-xs ${style.text}`}>
                  {formatWhen(iv.scheduled_at)} · {style.label}
                </div>
              </div>
              {iv.notes_after && (
                <span className="text-xs text-green-400/70 shrink-0">✓ отзыв</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

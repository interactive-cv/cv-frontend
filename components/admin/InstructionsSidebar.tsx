"use client";

import { useEffect, useRef, useState } from "react";
import { getInstructions, type InstructionItem } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return "только что";
  if (diffH < 24) return `${diffH} ч назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "вчера";
  if (diffD < 30) return `${diffD} дн назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function InstructionsSidebar({
  onUse,
}: {
  onUse: (text: string) => void;
}) {
  const [items, setItems] = useState<InstructionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    getInstructions(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-gray-500">Загрузка инструкций...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-xs text-gray-600">
        Пока нет сохранённых инструкций. Они появятся здесь после создания
        откликов с доп. инструкциями.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Выделите часть текста мышкой и нажмите «Использовать».
        Без выделения — копируется целиком.
      </p>
      {items.map((item) => (
        <InstructionCard key={item.id} item={item} onUse={onUse} />
      ))}
    </div>
  );
}

function InstructionCard({
  item,
  onUse,
}: {
  item: InstructionItem;
  onUse: (text: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleUse() {
    const selection = window.getSelection();
    let text = item.extra_instruction;

    if (selection && selection.toString().trim() && cardRef.current?.contains(selection.anchorNode)) {
      text = selection.toString().trim();
    }

    const preview = text.length > 60 ? text.slice(0, 60) + "..." : text;
    if (window.confirm(`Заменить текущую инструкцию на:\n\n«${preview}»?`)) {
      onUse(text);
    }
  }

  return (
    <div ref={cardRef} className="bg-gray-900 rounded-lg p-3 border border-gray-800">
      <div className="flex justify-between items-start mb-2 gap-2">
        <span className="text-xs font-medium text-gray-300 truncate flex-1">
          {item.company ? `${item.company} — ` : ""}
          {item.role}
        </span>
        <span className="text-[10px] text-gray-600 shrink-0">
          {timeAgo(item.created_at)}
        </span>
      </div>
      <p className="text-xs text-gray-400 select-text whitespace-pre-wrap leading-relaxed mb-2">
        {item.extra_instruction}
      </p>
      <button
        onClick={handleUse}
        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors w-full"
      >
        📋 Использовать
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Тумблер переключения тёмной/светлой темы.
 * Switch-стиль: овальная дорожка с кружком, который скользит влево/вправо.
 * Иконки 🌙 (dark) / ☀ (light) внутри кружка.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Плейсхолдер до гидратации — размер как у тумблера
    return <span className={`inline-block w-11 h-6 ${className}`} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      role="switch"
      aria-checked={!isDark}
      aria-label="Переключить тему"
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        isDark ? "bg-gray-700" : "bg-amber-300"
      } ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-0.5" : "translate-x-[22px]"
        }`}
      >
        <span className="text-[10px] leading-none">{isDark ? "🌙" : "☀"}</span>
      </span>
    </button>
  );
}

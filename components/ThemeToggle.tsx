"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Тумблер переключения тёмной/светлой темы.
 * Switch-стиль: овальная дорожка с кружком, который скользит влево/вправо.
 * Иконка (🌙/☀) — крупная, контрастная: тёмная на светлом кружке.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={`inline-block w-12 h-7 ${className}`} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      role="switch"
      aria-checked={!isDark}
      aria-label="Переключить тему"
      className={`relative inline-flex items-center w-12 h-7 rounded-full transition-colors duration-200 shrink-0 ${
        isDark ? "bg-indigo-900" : "bg-amber-200"
      } ${className}`}
    >
      {/* Скользящий кружок с SVG-иконкой */}
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
          isDark
            ? "translate-x-1 bg-gray-900 text-amber-300"
            : "translate-x-[26px] bg-white text-amber-600"
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {isDark ? (
            // Месяц
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          ) : (
            // Солнце
            <>
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}

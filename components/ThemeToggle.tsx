"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Кнопка переключения тёмной/светлой темы.
 * Маленькая, ставится в сайдбар админки и/или в футер публичного сайта.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Избегаем гидратации-мисматча: рендерим иконку только после mount.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={`inline-block w-8 h-8 ${className}`} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors ${className}`}
      aria-label="Переключить тему"
    >
      {isDark ? "☀" : "🌙"}
    </button>
  );
}

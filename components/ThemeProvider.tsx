"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes: переключатель тёмной/светлой темы.
 *
 * Поведение:
 * - attribute="class" → добавляет class="dark" или class="light" на <html>
 * - defaultTheme="dark" → ПРИ ПЕРВОМ визите (localStorage пуст) всегда тёмная,
 *   независимо от системных настроек (enableSystem=false).
 * - storageKey="cv-theme" → выбранный тумблером режим сохраняется в localStorage
 *   под этим ключом и восстанавливается при следующих визитах.
 * - themes=["dark","light"] → только эти два значения допустимы.
 * - disableTransitionOnChange → без анимации при переключении (мгновенно).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      storageKey="cv-theme"
      enableSystem={false}
      themes={["dark", "light"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

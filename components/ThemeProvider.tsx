"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes: переключатель тёмной/светлой темы.
 * - attribute="class" → добавляет class="dark" или class="light" на <html>
 * - defaultTheme="dark" → тёмная по умолчанию (как было раньше)
 * - localStorage → выбор сохраняется
 * Тёмная тема — основной «портфельный» вид; светлая — опция.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

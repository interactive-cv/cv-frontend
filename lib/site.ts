/**
 * Конфигурация сайта из переменных окружения.
 * Каждый, кто разворачивает свой CV, задаёт свои значения через .env:
 *   NEXT_PUBLIC_SITE_URL     — домен сайта (для metadata/robots/sitemap)
 *   NEXT_PUBLIC_OWNER_NAME   — имя кандидата (title, OG-картинка, Hero fallback)
 *   NEXT_PUBLIC_OWNER_ROLE   — роль/специализация (title, Hero fallback)
 * Все переменные public (NEXT_PUBLIC_*) — видны браузеру и инлайнятся в бандл.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv.example.com";

export const OWNER_NAME =
  process.env.NEXT_PUBLIC_OWNER_NAME ?? "Имя Фамилия";

export const OWNER_ROLE =
  process.env.NEXT_PUBLIC_OWNER_ROLE ?? "Fullstack";

/** Заголовок по умолчанию для SEO и OG-превью. */
export const DEFAULT_TITLE = `${OWNER_NAME} — ${OWNER_ROLE}`;

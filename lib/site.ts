/**
 * Конфигурация сайта из переменных окружения.
 * Каждый, кто разворачивает свой CV, задаёт свои значения через .env:
 *   NEXT_PUBLIC_SITE_URL     — домен сайта (для metadata/robots/sitemap)
 *   NEXT_PUBLIC_OWNER_NAME   — имя кандидата (title, OG-картинка, Hero fallback)
 *   NEXT_PUBLIC_OWNER_ROLE   — роль/специализация (title, Hero fallback)
 *   NEXT_PUBLIC_OWNER_TAGS   — ключевые теги-бейджи в Hero (через запятую)
 * Все переменные public (NEXT_PUBLIC_*) — видны браузеру и инлайнятся в бандл.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv.example.com";

export const OWNER_NAME =
  process.env.NEXT_PUBLIC_OWNER_NAME ?? "Имя Фамилия";

export const OWNER_ROLE =
  process.env.NEXT_PUBLIC_OWNER_ROLE ?? "Fullstack";

/** Ключевые теги-бейджи в Hero (из env через запятую). */
export const OWNER_TAGS: string[] =
  (process.env.NEXT_PUBLIC_OWNER_TAGS ?? "Fullstack, Next.js, FastAPI")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/** Заголовок по умолчанию для SEO и OG-превью. */
export const DEFAULT_TITLE = `${OWNER_NAME} — ${OWNER_ROLE}`;

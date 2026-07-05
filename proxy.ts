import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: перехватывает короткие ссылки (/{CODE}, 4-6 заглавных букв)
 * и резолвит их через бэкенд с пробросом cookies и IP браузера.
 *
 * Зачем: SSR (server component) не передаёт cookies/IP в fetch → бэкенд видел
 * IP Docker-контейнера, а не реального посетителя. Cookie session_id тоже терялся.
 * Middleware работает на Edge (до SSR) → имеет доступ к request браузера.
 *
 * После резолва: redirect на /{slug} с Set-Cookie от бэкенда.
 */
const SHORT_CODE_RE = /^[A-Z]{4,6}$/;
const API = process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.slice(1); // убираем ведущий /

  // Только короткие коды (4-6 заглавных букв)
  if (!SHORT_CODE_RE.test(path)) {
    return NextResponse.next();
  }

  try {
    // Пробрасываем cookies и IP браузера в запрос к бэкенду.
    const cookieHeader = request.headers.get("cookie") ?? "";
    const xff =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "";

    const res = await fetch(`${API}/api/links/resolve?code=${path}`, {
      headers: {
        cookie: cookieHeader,
        "x-forwarded-for": xff,
        "user-agent": request.headers.get("user-agent") ?? "",
        referer: request.headers.get("referer") ?? "",
      },
    });

    if (res.status === 200) {
      const { cv_variant_slug } = await res.json();
      // Создаём redirect с пробросом Set-Cookie от бэкенда.
      const response = NextResponse.redirect(
        new URL(`/${cv_variant_slug}`, request.url)
      );
      // Копируем Set-Cookie из ответа бэкенда.
      const setCookie = res.headers.getSetCookie?.() ?? [];
      for (const sc of setCookie) {
        // Парсим только name=value из Set-Cookie (без атрибутов, NextResponse добавит свои).
        const match = sc.match(/^([^=]+)=([^;]*)/);
        if (match) {
          response.cookies.set(match[1], match[2], {
            httpOnly: true,
            maxAge: 86400,
            sameSite: "lax",
            path: "/",
          });
        }
      }
      return response;
    }

    if (res.status === 410) {
      return NextResponse.redirect(new URL("/?expired=1", request.url));
    }
  } catch {
    // FALLTHROUGH к SSR page.tsx — пусть он попробует сам.
  }

  return NextResponse.next();
}

export const config = {
  // Применяем только к путям вида /XXXX (короткие ссылки).
  // Исключаем /admin, /api, статические файлы.
  matcher: ["/([A-Z]{4,6})$"],
};

/**
 * Пример программной генерации favicon через next/og (ImageResponse).
 *
 * Этот файл НЕ используется Next.js автоматически — он лежит вне каталога app/.
 * Это референс: скопируйте его в app/icon.tsx, если хотите генерировать иконку
 * кодом, либо положите свой квадратный PNG в app/icon.png (по умолчанию в шаблоне
 * лежит синяя иконка с «CV» + AI-бабблом).
 *
 * Next.js определяет favicon по конвенции имён в каталоге app/:
 *   - app/icon.png  → статичная иконка (любой квадрат: 32..512px)
 *   - app/icon.tsx  → динамическая генерация через next/og (ImageResponse)
 * Несколько файлов icon.* в одном каталоге — конфликтуют; выберите один.
 *
 * Ограничение Satori (движок next/og): он НЕ поддерживает градиентный текст
 * (background-clip: text) и градиентные рамки надёжно. Поэтому здесь —
 * упрощённый дизайн с однотонными заливками, который рендерится гарантированно.
 *
 * Подробнее: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
 */
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Упрощённый favicon: градиентный круг с инициалами. */
export default function Icon() {
  // Satori поддерживает градиентный фон (backgroundImage), но не градиентный текст.
  const gradient = "linear-gradient(135deg, #3b82f6, #06b6d4, #8b5cf6)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          backgroundImage: gradient,
          color: "white",
          fontSize: 240,
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        CV
      </div>
    ),
    size
  );
}

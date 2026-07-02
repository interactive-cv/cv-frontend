/**
 * Пример генерации favicon по умолчанию для open-source-шаблона.
 *
 * Этот файл НЕ используется Next.js автоматически (он лежит вне app/).
 * Это референс: скопируйте его в `app/icon.tsx`, чтобы получить
 * градиентную иконку с инициалами, либо положите свой `app/icon.png`.
 *
 * Next.js определяет favicon по конвенции имён в каталоге `app/`:
 *   - app/icon.png  → статичная иконка (любой квадрат: 32..512px)
 *   - app/icon.tsx  → динамическая генерация через next/og (ImageResponse)
 * Несколько файлов icon.* — конфликтуют; выберите один.
 *
 * Подробнее: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
 */
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon по умолчанию: градиентный круг с инициалами. */
export default function Icon() {
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
          background: "linear-gradient(120deg, #3b82f6, #06b6d4, #8b5cf6)",
          color: "white",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        AI
      </div>
    ),
    size
  );
}

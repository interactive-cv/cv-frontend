import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon в стиле AI-кнопки: градиентный круг с «AI». */
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

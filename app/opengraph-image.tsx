import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Имя Фамилия — Flutter / Fullstack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Динамическая OG-картинка для превью ссылок в Telegram/соцсетях.
 * Генерируется на лету через ImageResponse (Satori).
 */
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0b 0%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              background: "linear-gradient(120deg, #3b82f6, #06b6d4, #8b5cf6)",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            AI
          </div>
          <span style={{ fontSize: 24, color: "#9ca3af" }}>AI-портфолио</span>
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          Имя Фамилия
        </h1>
        <p style={{ fontSize: 36, color: "#9ca3af", margin: "16px 0 0 0" }}>
          Flutter / Fullstack · 11+ лет
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["Flutter", "Fullstack", "DevOps", "Java", "Next.js"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: 24,
                padding: "6px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size
  );
}

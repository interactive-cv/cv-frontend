export type ChatStyle = "glow" | "gradient" | "orb" | "capsule";

export const CHAT_STYLES: { id: ChatStyle; label: string }[] = [
  { id: "glow", label: "Свечение + подпись" },
  { id: "gradient", label: "Градиент + AI-бейдж" },
  { id: "orb", label: "Орб с искрами" },
  { id: "capsule", label: "Капсула-баннер" },
];

export const DEFAULT_CHAT_STYLE: ChatStyle = "capsule";
const STORAGE_KEY = "cv_chat_style";

export function loadChatStyle(): ChatStyle {
  if (typeof window === "undefined") return DEFAULT_CHAT_STYLE;
  const saved = window.localStorage.getItem(STORAGE_KEY) as ChatStyle | null;
  if (saved && CHAT_STYLES.some((s) => s.id === saved)) return saved;
  return DEFAULT_CHAT_STYLE;
}

export function saveChatStyle(style: ChatStyle): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, style);
}

export function nextStyle(current: ChatStyle): ChatStyle {
  const ids = CHAT_STYLES.map((s) => s.id);
  const idx = ids.indexOf(current);
  return ids[(idx + 1) % ids.length];
}

"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import type { ChatStyle } from "@/lib/chatStyles";

interface Props {
  style: ChatStyle;
  onOpen: () => void;
  /** Двойной клик по кнопке циклически переключает стиль. */
  onCycleStyle: () => void;
}

const baseWrap =
  "fixed bottom-6 right-6 z-40 select-none cursor-pointer flex items-center justify-center";

// Порог отличия одинарного клика от двойного (мс).
const DBLCLICK_THRESHOLD = 280;

export default function ChatFab({ style, onOpen, onCycleStyle }: Props) {
  // Таймер отложенного открытия. Если в течение порога приходит второй клик —
  // отменяем открытие и переключаем стиль (одиночный клик не должен перебивать двойной).
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (clickTimer.current) {
      // Второй клик в пределах порога → это двойной клик.
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onCycleStyle();
    } else {
      // Первый клик → ждём, не будет ли второго.
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onOpen();
      }, DBLCLICK_THRESHOLD);
    }
  };

  return (
    <div className={baseWrap} onClick={handleClick} role="button" aria-label="Чат">
      {style === "glow" && <GlowFab />}
      {style === "gradient" && <GradientFab />}
      {style === "orb" && <OrbFab />}
      {style === "capsule" && <CapsuleFab />}
    </div>
  );
}

/* --- 1. Свечение + подпись --- */
function GlowFab() {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="bg-blue-600 rounded-full h-14 w-14 flex items-center justify-center text-white animate-pulse-glow"
    >
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: "auto", opacity: 1 }}
        className="overflow-hidden whitespace-nowrap text-sm font-medium pr-3"
      >
        <HoverLabel />
      </motion.div>
      <span className="text-xl">💬</span>
    </motion.div>
  );
}

/* --- 2. Градиент + AI-бейдж --- */
function GradientFab() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="rounded-full h-14 px-4 flex items-center gap-2 text-white font-semibold animate-gradient shadow-xl"
      style={{
        backgroundImage:
          "linear-gradient(120deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6)",
      }}
    >
      <span className="bg-white/25 rounded-md px-1.5 py-0.5 text-xs font-bold">AI</span>
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: "auto", opacity: 1 }}
        className="overflow-hidden whitespace-nowrap text-sm pr-1"
      >
        Спросите про опыт
      </motion.span>
    </motion.div>
  );
}

/* --- 3. Орб с искрами --- */
function OrbFab() {
  // Искры по периметру орба.
  const sparks = Array.from({ length: 8 });
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="relative h-16 w-16 flex items-center justify-center rounded-full"
      style={{
        background: "radial-gradient(circle at 30% 30%, #60a5fa, #1e3a8a)",
        boxShadow: "0 0 24px rgba(59,130,246,0.6)",
      }}
    >
      {sparks.map((_, i) => {
        const angle = (i / sparks.length) * 2 * Math.PI;
        const r = 34;
        return (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 animate-sparkle"
            style={{
              left: `calc(50% + ${Math.cos(angle) * r}px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px)`,
              animationDelay: `${i * 0.22}s`,
            }}
          />
        );
      })}
      <span className="text-2xl">✦</span>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute top-full mt-2 whitespace-nowrap text-xs text-cyan-300 bg-gray-900/80 px-2 py-1 rounded"
      >
        Спросить AI
      </motion.div>
    </motion.div>
  );
}

/* --- 4. Капсула-баннер --- */
function CapsuleFab() {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gray-900 border border-blue-500/40 rounded-full pl-3 pr-4 h-12 flex items-center gap-2 shadow-xl shadow-blue-500/20"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-online-dot" />
      <span className="text-sm font-medium text-white whitespace-nowrap">
        AI-ассистент Валерия
      </span>
      <span className="text-blue-400">✦</span>
    </motion.div>
  );
}

function HoverLabel() {
  return <span className="text-sm">Спросить AI</span>;
}

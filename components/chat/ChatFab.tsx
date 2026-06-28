"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  onOpen: () => void;
}

/**
 * Кнопка чата: анимированный градиент blue→cyan→purple.
 * В покое — КРУГЛАЯ (aspect-square), бейдж «AI» по центру. При наведении —
 * расширяется вправо в капсулу с подписью «Спросите про опыт».
 */
export default function ChatFab({ onOpen }: Props) {
  // Hover tracked на уровне компонента → раскрытие срабатывает надёжно по всей площади.
  const [hovered, setHovered] = useState(false);

  // В покое — aspect-square (круг); при hover — убираем, чтобы расшириться в капсулу.
  const shapeClass = hovered ? "pr-5" : "aspect-square";

  return (
    <motion.button
      onClick={onOpen}
      aria-label="Спросить AI"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 h-16 pl-5 rounded-full font-semibold text-white animate-gradient shadow-xl shadow-blue-500/40 ${shapeClass}`}
      style={{
        backgroundImage:
          "linear-gradient(120deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6)",
      }}
    >
      {/* Бейдж AI — в покое по центру круга; при раскрытии сдвигается влево капсулы. */}
      <span className="bg-white/25 rounded-md px-2 py-1 text-sm font-bold shrink-0">
        AI
      </span>
      {/* Подпись раскрывается при hover (плавная ширина/прозрачность). */}
      <motion.span
        initial={false}
        animate={{ width: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden whitespace-nowrap text-sm font-medium pr-3"
      >
        Спросите про опыт
      </motion.span>
    </motion.button>
  );
}

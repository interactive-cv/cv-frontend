"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  onOpen: () => void;
}

/**
 * Кнопка чата: анимированный градиент blue→cyan→purple, всегда виден бейдж «AI».
 * Овальная (не круглая), бейдж слева. Наведение на кнопку → расширяется в капсулу
 * с подписью «Спросите про опыт».
 */
export default function ChatFab({ onOpen }: Props) {
  // Hover-состояние tracked на уровне компонента → раскрытие срабатывает надёжно
  // по всей площади кнопки (не зависит от ширины скрытого span).
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onOpen}
      aria-label="Спросить AI"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full pl-3 pr-4 py-2.5 font-semibold text-white animate-gradient shadow-xl shadow-blue-500/30"
      style={{
        backgroundImage:
          "linear-gradient(120deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6)",
      }}
    >
      {/* Бейдж AI — слева, всегда виден. */}
      <span className="bg-white/25 rounded-md px-1.5 py-0.5 text-xs font-bold">
        AI
      </span>
      {/* Подпись раскрывается при hovered=true (через animate, плавная ширина/прозрачность). */}
      <motion.span
        initial={false}
        animate={{ width: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden whitespace-nowrap text-sm font-medium"
      >
        Спросите про опыт
      </motion.span>
    </motion.button>
  );
}

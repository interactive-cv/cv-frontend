"use client";

import { motion } from "framer-motion";
import type { MasterCV } from "@/lib/types";
import { OWNER_NAME, OWNER_ROLE, OWNER_TAGS } from "@/lib/site";

const FALLBACK = {
  name: OWNER_NAME,
  tagline: OWNER_ROLE,
  city: "Город",
  format: "удалёнка",
  badges: OWNER_TAGS,
};

// Без initial-opacity: SSR рендерит видимый контент (хорошо для SEO/восприятия),
// анимация появления стартует с лёгкого translateY без скрытия.
export default function Hero({ cv }: { cv: MasterCV }) {
  const city = cv.format?.city || cv.contacts?.city || FALLBACK.city;
  const format = cv.format?.format || FALLBACK.format;

  return (
    <motion.section
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-24 text-center"
      suppressHydrationWarning
    >
      <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
        {FALLBACK.name}
      </h1>
      <p className="mt-4 text-lg text-gray-400">{cv.summary || FALLBACK.tagline}</p>

      <div className="mt-5 flex flex-wrap gap-2 justify-center">
        {FALLBACK.badges.map((b) => (
          <span
            key={b}
            className="px-3 py-1 text-xs rounded-full bg-gray-800/80 border border-gray-700 text-gray-300"
          >
            {b}
          </span>
        ))}
      </div>

      <p className="mt-5 text-sm text-gray-500">
        📍 {city} · 💼 {format}
      </p>

      <div className="mt-7 flex flex-wrap gap-5 justify-center text-sm">
        {cv.contacts?.email && (
          <a href={`mailto:${cv.contacts.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            ✉ {cv.contacts.email}
          </a>
        )}
        {cv.contacts?.telegram && (
          <a href={`https://t.me/${cv.contacts.telegram}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            ✈ @{cv.contacts.telegram}
          </a>
        )}
        {cv.contacts?.github && (
          <a href={`https://${cv.contacts.github}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            ⌥ {cv.contacts.github}
          </a>
        )}
      </div>
    </motion.section>
  );
}

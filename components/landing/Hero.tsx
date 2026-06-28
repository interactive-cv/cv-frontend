"use client";

import { motion } from "framer-motion";
import type { MasterCV } from "@/lib/types";

const FALLBACK = {
  name: "Валерий Григорьев",
  tagline: "Flutter / Fullstack · 11+ лет",
  city: "Геленджик",
  format: "удалёнка",
};

export default function Hero({ cv }: { cv: MasterCV }) {
  const city = cv.format?.city || cv.contacts?.city || FALLBACK.city;
  const format = cv.format?.format || FALLBACK.format;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-20 text-center"
    >
      <h1 className="text-5xl font-bold">{FALLBACK.name}</h1>
      <p className="mt-3 text-xl text-gray-400">{cv.summary || FALLBACK.tagline}</p>
      <p className="mt-2 text-gray-500">
        {city} · {format}
      </p>
      <div className="mt-6 flex gap-4 justify-center text-sm">
        {cv.contacts?.email && (
          <a href={`mailto:${cv.contacts.email}`} className="underline">
            {cv.contacts.email}
          </a>
        )}
        {cv.contacts?.telegram && (
          <a href={`https://t.me/${cv.contacts.telegram}`} className="underline">
            @{cv.contacts.telegram}
          </a>
        )}
        {cv.contacts?.github && (
          <a href={`https://${cv.contacts.github}`} className="underline">
            {cv.contacts.github}
          </a>
        )}
      </div>
    </motion.section>
  );
}

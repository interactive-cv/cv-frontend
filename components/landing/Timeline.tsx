"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProjectModal from "./ProjectModal";
import type { Project } from "@/lib/types";

export default function Timeline({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projects" className="py-16">
      <h2 className="text-2xl font-bold mb-8">Проекты</h2>
      <div className="relative border-l border-gray-800 ml-3">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="relative pl-8 pb-6"
            suppressHydrationWarning
          >
            {/* Точка на линии */}
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-600/20" />
            <button
              onClick={() => setSelected(p)}
              className="group block text-left w-full rounded-xl p-4 hover:bg-gray-900/70 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                  {p.period}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{p.role}</p>
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.tags.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-gray-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

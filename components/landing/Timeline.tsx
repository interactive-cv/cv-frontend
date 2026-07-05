"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProjectModal from "./ProjectModal";
import type { Project } from "@/lib/types";

export default function Timeline({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);

  // Разделяем: коммерческие проекты vs пет-проекты/open-source (по тегу "pet")
  const commercial = projects.filter((p) => !p.tags?.includes("pet"));
  const petProjects = projects.filter((p) => p.tags?.includes("pet"));

  function renderProject(p: Project, i: number) {
    return (
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
              {p.tags
                .filter((t) => t !== "pet")
                .slice(0, 5)
                .map((t) => (
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
    );
  }

  return (
    <section id="projects" className="py-16">
      <h2 className="text-2xl font-bold mb-8">Проекты</h2>
      <div className="relative border-l border-gray-800 ml-3">
        {commercial.map((p, i) => renderProject(p, i))}

        {/* Разделитель: Пет-проекты и open-source */}
        {petProjects.length > 0 && (
          <>
            <div className="relative pl-8 py-4">
              <span className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-600/20" />
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide">
                🚀 Пет-проекты и open-source
              </h3>
            </div>
            {petProjects.map((p, i) => renderProject(p, i))}
          </>
        )}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

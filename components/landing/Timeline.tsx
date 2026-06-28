"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProjectModal from "./ProjectModal";
import type { Project } from "@/lib/types";

export default function Timeline({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projects" className="py-12">
      <h2 className="text-2xl font-bold mb-6">Проекты</h2>
      <div className="relative border-l-2 border-gray-700 ml-4">
        {projects.map((p) => (
          <motion.button
            key={p.title}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onClick={() => setSelected(p)}
            className="block text-left mb-6 pl-6 hover:text-blue-400 transition-colors"
          >
            <span className="text-sm text-gray-500">{p.period}</span>
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-400">{p.role}</p>
          </motion.button>
        ))}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{project.title}</h3>
              <p className="text-sm text-gray-400">
                {project.period} · {project.role}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="text-gray-500 hover:text-white text-xl leading-none px-1"
            >
              ✕
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-300 leading-relaxed">{project.short_desc}</p>

          {Object.keys(project.metrics).length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Object.entries(project.metrics).map(([k, v]) => (
                <div key={k} className="bg-gray-800/60 rounded-lg p-3">
                  <div className="text-lg font-semibold text-blue-400">{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{k}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Стек</h4>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded text-gray-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

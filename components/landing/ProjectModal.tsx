"use client";

import type { Project } from "@/lib/types";

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold">{project.title}</h3>
        <p className="text-gray-400">
          {project.period} · {project.role}
        </p>
        <p className="mt-3">{project.short_desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span key={s} className="text-xs bg-gray-800 px-2 py-1 rounded">
              {s}
            </span>
          ))}
        </div>
        {Object.keys(project.metrics).length > 0 && (
          <dl className="mt-3 text-sm text-gray-400">
            {Object.entries(project.metrics).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt>{k}:</dt>
                <dd className="text-gray-200">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <button onClick={onClose} className="mt-4 text-sm underline">
          Закрыть
        </button>
      </div>
    </div>
  );
}

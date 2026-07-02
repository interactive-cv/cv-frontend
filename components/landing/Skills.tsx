"use client";

import { motion } from "framer-motion";

interface SkillsProps {
  skills: Record<string, string[]>;
  languages: Record<string, string>;
}

const CATEGORY_ORDER = [
  "Языки программирования",
  "Frameworks",
  "СУБД",
  "BaaS",
  "CI/CD / DevOps",
  "AI / LLM",
  "Операционные системы",
  "IDE",
  "Другое",
];

export default function Skills({ skills, languages }: SkillsProps) {
  const hasSkills = Object.keys(skills).length > 0;
  const hasLanguages = Object.keys(languages).length > 0;
  if (!hasSkills && !hasLanguages) return null;

  const ordered = [...Object.entries(skills)].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0])
  );

  return (
    <section id="skills" className="py-16">
      <h2 className="text-2xl font-bold mb-8">Навыки</h2>

      {hasSkills && (
        <div className="space-y-5">
          {ordered.map(([cat, techs], i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              suppressHydrationWarning
            >
              <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {techs.map((t) => (
                  <span
                    key={t}
                    className="text-sm px-2.5 py-1 rounded-lg bg-gray-800/70 border border-gray-700 text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {hasLanguages && (
        <div className="mt-8">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
            Языки
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(languages).map(([lang, level]) => (
              <div
                key={lang}
                className="px-4 py-2 rounded-xl bg-gray-800/70 border border-gray-700"
              >
                <span className="font-semibold">{lang}</span>
                <span className="text-gray-400 text-sm ml-2">{level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

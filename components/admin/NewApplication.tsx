"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCV, createApplication } from "@/lib/admin";
import { getProjects } from "@/lib/api";
import { TOKEN_KEY } from "./AdminLogin";
import SplitEditor from "./SplitEditor";
import TypingIndicator from "@/components/chat/TypingIndicator";

type Phase = "form" | "generating" | "edit";

export default function NewApplication() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");

  // Форма
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [vacancyText, setVacancyText] = useState("");
  const [projects, setProjects] = useState<{ title: string }[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Результат генерации
  const [cvMarkdown, setCvMarkdown] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    getProjects()
      .then((ps) => setProjects(ps.map((p) => ({ title: p.title }))))
      .catch(() => {});
  }, []);

  function toggleProject(title: string) {
    setSelectedProjects((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }

  async function handleGenerate() {
    if (!company.trim() || !role.trim() || !vacancyText.trim()) {
      setError("Заполните компанию, роль и текст вакансии");
      return;
    }
    setError("");
    setPhase("generating");
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const result = await generateCV(token, {
        company,
        role,
        vacancy_text: vacancyText,
        selected_projects: selectedProjects,
      });
      setCvMarkdown(result.cv_markdown);
      setCoverLetter(result.cover_letter);
      setPhase("edit");
    } catch (e) {
      setError(`Ошибка генерации: ${(e as Error).message}`);
      setPhase("form");
    }
  }

  async function handleSave(status: "draft" | "active") {
    setError("");
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const slug = `${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${role
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`.replace(/^-|-$/g, "");
    try {
      const result = await createApplication(token, {
        company,
        role,
        vacancy_text: vacancyText,
        cover_letter: coverLetter,
        cv_markdown: cvMarkdown,
        slug,
        status,
      });
      if (status === "active") {
        // публикация пройдёт на детальной странице
        router.push(`/admin/${result.id}`);
      } else {
        router.push(`/admin/${result.id}`);
      }
    } catch (e) {
      setError(`Ошибка сохранения: ${(e as Error).message}`);
    }
  }

  // ===== Phase: form =====
  if (phase === "form") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-6">Новый отклик</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Компания (Yandex)"
              className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Роль (Flutter Developer)"
              className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={vacancyText}
            onChange={(e) => setVacancyText(e.target.value)}
            placeholder="Вставьте текст вакансии..."
            className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[200px] resize-y"
          />
          {/* Чекбоксы проектов */}
          <div>
            <div className="text-sm text-gray-400 mb-2">
              Проекты для включения в CV (необязательно):
            </div>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => {
                const checked = selectedProjects.includes(p.title);
                return (
                  <button
                    key={p.title}
                    onClick={() => toggleProject(p.title)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      checked
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            ⚡ Сгенерировать CV и отклик
          </button>
        </div>
      </div>
    );
  }

  // ===== Phase: generating =====
  if (phase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <TypingIndicator />
        <p className="text-gray-400 text-sm">AI генерирует CV и отклик...</p>
      </div>
    );
  }

  // ===== Phase: edit =====
  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-2">
        {company} — {role}
      </h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="grid gap-6 mt-6">
        <SplitEditor
          label="✏ CV (редактируйте markdown)"
          value={cvMarkdown}
          onChange={setCvMarkdown}
          minHeight={300}
        />
        <SplitEditor
          label="✏ Cover letter / отклик (плейн-текст для копипаста в Telegram/email)"
          value={coverLetter}
          onChange={setCoverLetter}
          minHeight={150}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => handleSave("draft")}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Сохранить черновик
        </button>
        <button
          onClick={() => handleSave("active")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Сохранить и опубликовать →
        </button>
      </div>
    </div>
  );
}

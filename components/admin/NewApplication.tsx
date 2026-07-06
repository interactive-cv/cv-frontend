"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCV, createApplication, uploadSpecPdf, type ApplicationKind } from "@/lib/admin";
import { getProjects } from "@/lib/api";
import { TOKEN_KEY } from "./AdminLogin";
import SplitEditor from "./SplitEditor";
import TypingIndicator from "@/components/chat/TypingIndicator";

type Phase = "form" | "generating" | "edit";

export default function NewApplication() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");

  // Тип отклика
  const [kind, setKind] = useState<ApplicationKind>("vacancy");

  // Форма
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [vacancyText, setVacancyText] = useState("");
  const [projects, setProjects] = useState<{ title: string }[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Дополнительные поля (ссылки, бюджет, рейтинг и т.д.)
  const [sourceUrl, setSourceUrl] = useState("");
  const [chatUrl, setChatUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [applicantCount, setApplicantCount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [expectedTerm, setExpectedTerm] = useState("");
  const [rating, setRating] = useState(0);

  // ТЗ заказа (из PDF или вставленное вручную)
  const [specText, setSpecText] = useState("");
  const [specLoading, setSpecLoading] = useState(false);
  const [specError, setSpecError] = useState("");

  // Результат генерации
  const [cvMarkdown, setCvMarkdown] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // Дополнительная инструкция для LLM (на эту вакансию)
  const [extraInstruction, setExtraInstruction] = useState("");

  const isFreelance = kind === "freelance";

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setSpecLoading(true);
    setSpecError("");
    try {
      const result = await uploadSpecPdf(token, file);
      setSpecText(result.spec_text);
    } catch (err) {
      setSpecError(`Ошибка загрузки PDF: ${(err as Error).message}`);
    } finally {
      setSpecLoading(false);
      e.target.value = ""; // сбросить input чтобы можно было загрузить тот же файл снова
    }
  }

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
    if (!role.trim() || !vacancyText.trim()) {
      setError("Заполните роль/проект и текст вакансии/заказа");
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
        kind,
        spec_text: specText || undefined,
        extra_instruction: extraInstruction || undefined,
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
    // Slug из company+role или только role (если company не указан).
    const parts = [company, role]
      .filter(Boolean)
      .map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
      .join("-");
    const base = parts.replace(/^-|-$/g, "");
    const suffix = Math.random().toString(36).slice(2, 6);
    const slug = `${base}-${suffix}`;
    try {
      const result = await createApplication(token, {
        company,
        role,
        vacancy_text: vacancyText,
        cover_letter: coverLetter,
        cv_markdown: cvMarkdown,
        slug,
        status,
        kind,
        source_url: sourceUrl || undefined,
        chat_url: chatUrl || undefined,
        budget: budget || undefined,
        applicant_count: applicantCount ? parseInt(applicantCount, 10) : undefined,
        deadline: deadline || undefined,
        expected_term: expectedTerm || undefined,
        rating: rating || undefined,
        spec_text: specText || undefined,
      });
      router.push(`/admin/${result.id}`);
    } catch (e) {
      setError(`Ошибка сохранения: ${(e as Error).message}`);
    }
  }

  function handleCancel() {
    const msg =
      phase === "edit"
        ? "Отменить создание отклика?\n\nСгенерированные CV и отклик будут потеряны."
        : "Отменить создание отклика?\n\nВведённые данные будут потеряны.";
    if (window.confirm(msg)) {
      router.push("/admin");
    }
  }

  // ===== Phase: form =====
  if (phase === "form") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-6">Новый отклик</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="grid gap-4">
          {/* Селектор типа */}
          <div className="flex gap-2">
            <button
              onClick={() => setKind("vacancy")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                kind === "vacancy"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              💼 Вакансия
            </button>
            <button
              onClick={() => setKind("freelance")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                kind === "freelance"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              🚀 Фриланс
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={isFreelance ? "Заказчик" : "Компания (Yandex)"}
              className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={isFreelance ? "Проект (Flutter app)" : "Роль (Flutter Developer)"}
              className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={vacancyText}
            onChange={(e) => setVacancyText(e.target.value)}
            placeholder={isFreelance ? "Вставьте описание фриланс-заказа..." : "Вставьте текст вакансии..."}
            className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[200px] resize-y"
          />

          {/* ТЗ заказа (PDF + textarea) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                ТЗ заказа {isFreelance ? "(повысит релевантность отклика)" : "(необязательно)"}
              </span>
              <label className="text-xs px-2.5 py-1 rounded-lg border bg-gray-800 border-gray-700 text-gray-400 hover:text-white cursor-pointer transition-colors">
                📎 Загрузить PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  disabled={specLoading}
                />
              </label>
            </div>
            {specLoading && (
              <p className="text-xs text-blue-400 mb-2">Извлечение текста из PDF...</p>
            )}
            {specError && (
              <p className="text-xs text-red-400 mb-2">{specError}</p>
            )}
            {specText && (
              <div className="text-xs text-gray-500 mb-1">
                ✓ ТЗ загружено ({specText.length} символов). Можно отредактировать:
              </div>
            )}
            <textarea
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              placeholder="Вставьте текст ТЗ вручную или загрузите PDF выше..."
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y"
            />
          </div>

          {/* Ссылки (общие) */}
          <div className="grid grid-cols-2 gap-3">
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder={isFreelance ? "Ссылка на проект (FL.ru)" : "Ссылка на вакансию"}
              className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={chatUrl}
              onChange={(e) => setChatUrl(e.target.value)}
              placeholder={isFreelance ? "Ссылка на чат с заказчиком" : "Ссылка на диалог с HR"}
              className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Поля фриланс-заказа */}
          {isFreelance && (
            <div className="grid grid-cols-2 gap-3">
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Бюджет (50 000 ₽)"
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                value={applicantCount}
                onChange={(e) => setApplicantCount(e.target.value)}
                type="number"
                placeholder="Конкурс (откликнулись)"
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                type="date"
                placeholder="Срок сдачи"
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                value={expectedTerm}
                onChange={(e) => setExpectedTerm(e.target.value)}
                placeholder="Ожидаемый срок (2 недели)"
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Рейтинг */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Рейтинг:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(rating === star ? 0 : star)}
                className={`text-lg ${star <= rating ? "text-amber-400" : "text-gray-600"} hover:text-amber-300`}
              >
                ★
              </button>
            ))}
          </div>

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

          {/* Дополнительная инструкция для LLM */}
          <div>
            <div className="text-sm text-gray-400 mb-1">
              Доп. инструкция для AI (необязательно)
            </div>
            <p className="text-[11px] text-gray-600 mb-2 leading-snug">
              💡 Укажите, что подчеркнуть: «акцент на backend-опыт», «убрать 1С»,
              «не упоминать фриланс», «тональность — формальная».
              Кратко, 1-2 строки. LLM учтёт это при генерации.
            </p>
            <input
              value={extraInstruction}
              onChange={(e) => setExtraInstruction(e.target.value)}
              placeholder="Например: сделать акцент на опыте с PostgreSQL"
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              ⚡ Сгенерировать CV и отклик
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              Отменить
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Phase: generating =====
  if (phase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <TypingIndicator />
        <p className="text-gray-400 text-sm">
          {isFreelance ? "AI генерирует отклик на фриланс-заказ..." : "AI генерирует CV и отклик..."}
        </p>
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
        <button
          onClick={handleCancel}
          className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Отменить
        </button>
      </div>
    </div>
  );
}

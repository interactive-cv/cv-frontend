"use client";

import { useState, useRef, useEffect } from "react";
import { editChatStream, type ApplicationKind } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

type Message = { role: "user" | "assistant"; content: string };

/**
 * Парсит накопленный стрим — извлекает CV и cover letter из формата:
 * ===CV===...===COVER===...===END===
 * Возвращает то, что уже успело прийти (partial).
 */
function parsePartialResponse(text: string): { cv: string | null; cover: string | null } {
  let cv: string | null = null;
  let cover: string | null = null;

  if (text.includes("===CV===")) {
    const afterCv = text.split("===CV===")[1];
    if (afterCv.includes("===COVER===")) {
      cv = afterCv.split("===COVER===")[0].trim();
      const afterCover = afterCv.split("===COVER===")[1];
      cover = afterCover.split("===END===")[0].trim();
    } else {
      // CV ещё стримится, COVER не пришёл
      cv = afterCv.trim();
    }
  }

  return { cv, cover };
}

export default function EditChat({
  cvMarkdown,
  coverLetter,
  kind,
  vacancyText,
  onCvChange,
  onCoverChange,
}: {
  cvMarkdown: string;
  coverLetter: string;
  kind: ApplicationKind;
  vacancyText: string;
  onCvChange: (v: string) => void;
  onCoverChange: (v: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  async function handleSend() {
    const instruction = input.trim();
    if (!instruction || streaming) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const userMsg: Message = { role: "user", content: instruction };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setStreamText("");

    try {
      const res = await editChatStream(token, {
        cv_markdown: cvMarkdown,
        cover_letter: coverLetter,
        instruction,
        kind,
        vacancy_text: vacancyText,
        history: newMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.6,
      });

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setStreamText(acc);

        // Парсим накопленный текст — обновляем редакторы live
        const { cv, cover } = parsePartialResponse(acc);
        if (cv !== null) onCvChange(cv);
        if (cover !== null) onCoverChange(cover);
      }

      // Готово — добавляем краткий статус AI
      const { cv: finalCv, cover: finalCover } = parsePartialResponse(acc);
      const statusParts: string[] = [];
      if (finalCv !== null) statusParts.push("CV");
      if (finalCover !== null) statusParts.push("cover letter");
      const status = statusParts.length > 0
        ? `✓ Обновил: ${statusParts.join(" + ")}`
        : "✓ Готово";

      setMessages((prev) => [...prev, { role: "assistant", content: status }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠ Ошибка: ${(err as Error).message}` },
      ]);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Заголовок */}
      <div className="px-3 py-2 border-b border-gray-800 shrink-0">
        <h3 className="text-sm font-semibold text-gray-300">💬 AI-правка</h3>
        <p className="text-[10px] text-gray-600 mt-0.5">
          Точечные правки без перегенерации
        </p>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && !streaming && (
          <p className="text-xs text-gray-600 text-center mt-4">
            Напишите инструкцию — например:<br />
            «убери 1С», «сократи summary»,<br />
            «добавь про PostgreSQL»
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs rounded-lg px-2.5 py-1.5 ${
              msg.role === "user"
                ? "bg-blue-900/40 text-blue-200 ml-4"
                : "bg-gray-800 text-gray-400 mr-4"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {/* Стриминг — краткий индикатор */}
        {streaming && (
          <div className="text-xs text-gray-500 animate-pulse">
            ⏳ Редактирую{streamText.includes("===CV===") ? " — CV обновляется..." : "..."}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ввод */}
      <div className="p-2 border-t border-gray-800 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Инструкция для AI..."
          disabled={streaming}
          className="w-full bg-gray-800 rounded-lg px-2.5 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px] max-h-[100px]"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="w-full mt-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          {streaming ? "⏳..." : "Отправить"}
        </button>
      </div>
    </div>
  );
}

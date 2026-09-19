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
  // Смешанный режим: ассистент может прислать только CV, только COVER,
  // оба — или чистый текст (ответ на вопрос, тексты не трогаем).
  let cv: string | null = null;
  let cover: string | null = null;

  if (text.includes("===CV===")) {
    const afterCv = text.split("===CV===")[1];
    if (afterCv.includes("===COVER===")) {
      cv = afterCv.split("===COVER===")[0].trim();
    } else {
      cv = afterCv.split("===END===")[0].trim();
    }
  }

  if (text.includes("===COVER===")) {
    const afterCover = text.split("===COVER===")[1];
    cover = afterCover.split("===END===")[0].trim();
  }

  return { cv, cover };
}

export default function EditChat({
  cvMarkdown,
  coverLetter,
  kind,
  vacancyText,
  coverLimit,
  onCvChange,
  onCoverChange,
}: {
  cvMarkdown: string;
  coverLetter: string;
  kind: ApplicationKind;
  vacancyText: string;
  coverLimit?: number;
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

  async function handleSend(mode: "chat" | "edit") {
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
        cover_limit: coverLimit,
        mode,
      });

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setStreamText(acc);

        // В режиме правки парсим накопленный текст — редакторы live
        if (mode === "edit") {
          const { cv, cover } = parsePartialResponse(acc);
          if (cv !== null) onCvChange(cv);
          if (cover !== null) onCoverChange(cover);
        }
      }

      let reply: string;
      if (mode === "edit") {
        const { cv: finalCv, cover: finalCover } = parsePartialResponse(acc);
        const parts: string[] = [];
        if (finalCv !== null) parts.push(`CV (${finalCv.length} симв.)`);
        if (finalCover !== null) parts.push(`отклик (${finalCover.length} симв.)`);
        const note = acc.split("===CV===")[0].split("===COVER===")[0].trim();
        reply = parts.length > 0
          ? `✅ Применено: ${parts.join(", ")}${note ? `
${note}` : ""}`
          : `⚠ Правка не распознана (нет маркеров). Ответ:
${acc.trim()}`;
      } else {
        reply = acc.trim() || "(пустой ответ)";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
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
      handleSend("chat");
    }
  }

  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Заголовок */}
      <div className="px-3 py-2 border-b border-gray-800 shrink-0">
        <h3 className="text-sm font-semibold text-gray-300">💬 Диалог с ИИ</h3>
        <p className="text-[10px] text-gray-600 mt-0.5">
          Спрашивайте и обсуждайте. Правка текстов — кнопкой «✏️ Применить»
        </p>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && !streaming && (
          <p className="text-xs text-gray-600 text-center mt-4">
            Спросите: «что подчеркнуть в отклике?»<br />
            или обсудите: «какой стек предложить?»<br />
            Правки — «✏️ Применить»: «убери 1С»,
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
            ⏳ {streamText.includes("===CV===") || streamText.includes("===COVER===") ? "Применяю правку..." : "Думает..."}
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
          placeholder="Вопрос («что подчеркнуть?») или команда правки («убери 1С», «перепиши короче»)…"
          disabled={streaming}
          className="w-full bg-gray-800 rounded-lg px-2.5 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px] max-h-[100px]"
          rows={2}
        />
        <div className="flex gap-1.5 mt-1.5">
          <button
            onClick={() => handleSend("chat")}
            disabled={streaming || !input.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {streaming ? "⏳..." : "Спросить"}
          </button>
          <button
            onClick={() => handleSend("edit")}
            disabled={streaming || !input.trim()}
            title="Ваш текст — команда: применить правку к CV/отклику"
            className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            ✏️ Применить
          </button>
        </div>
      </div>
    </div>
  );
}

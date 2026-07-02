import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CVVariant } from "@/lib/types";

export default function CVPage({ variant }: { variant: CVVariant }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-6">
      {/* Иконка-логотип (тот же файл что favicon: монашеская на проде, синяя в open-source) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.png"
        alt="Логотип"
        width={64}
        height={64}
        className="rounded-xl shadow-lg shadow-black/40 mb-4"
      />
      <h1 className="text-3xl font-bold mb-1">{variant.title}</h1>
      {variant.company && (
        <p className="text-gray-400 mb-4">{variant.company}</p>
      )}
      {/* prose-sm: уменьшенная вертикальная разбивка (меньше margin-top у заголовков/абзацев) */}
      <div className="prose prose-invert prose-sm prose-cv max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{variant.content_markdown}</ReactMarkdown>
      </div>
    </article>
  );
}

import ReactMarkdown from "react-markdown";
import type { CVVariant } from "@/lib/types";

export default function CVPage({ variant }: { variant: CVVariant }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">{variant.title}</h1>
      {variant.company && (
        <p className="text-gray-400 mb-6">{variant.company}</p>
      )}
      <div className="prose prose-invert prose-cv max-w-none">
        <ReactMarkdown>{variant.content_markdown}</ReactMarkdown>
      </div>
    </article>
  );
}

import type { CVVariant } from "@/lib/types";

export default function CVPage({ variant }: { variant: CVVariant }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">{variant.title}</h1>
      {variant.company && <p className="text-gray-400 mb-4">{variant.company}</p>}
      <pre className="whitespace-pre-wrap font-sans bg-gray-900 rounded-lg p-4 text-sm leading-relaxed">
        {variant.content_markdown}
      </pre>
    </article>
  );
}

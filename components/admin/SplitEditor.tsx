"use client";

import ReactMarkdown from "react-markdown";

/** Split-редактор: markdown слева, live-preview справа. */
export default function SplitEditor({
  value,
  onChange,
  label,
  minHeight = 200,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  minHeight?: number;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <div className="grid grid-cols-2 gap-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          className="bg-gray-800 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
          spellCheck={false}
        />
        <div
          style={{ minHeight }}
          className="bg-gray-800 rounded-lg p-3 overflow-auto prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        >
          <ReactMarkdown>{value || "*Превью появится здесь*"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

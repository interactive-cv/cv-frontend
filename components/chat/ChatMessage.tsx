import ReactMarkdown from "react-markdown";

export default function ChatMessage({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`${
          isUser ? "bg-blue-600" : "bg-gray-800"
        } px-3 py-2 rounded-lg max-w-[80%] text-sm`}
      >
        {/* Пользовательские сообщения — plain text (без интерпретации).
            Ответы AI — markdown (жирный, списки, код). */}
        {isUser ? (
          text
        ) : (
          <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

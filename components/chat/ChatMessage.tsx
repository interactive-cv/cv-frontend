export default function ChatMessage({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: string;
}) {
  const align = role === "user" ? "justify-end" : "justify-start";
  const color = role === "user" ? "bg-blue-600" : "bg-gray-800";
  return (
    <div className={`flex ${align} mb-2`}>
      <div className={`${color} px-3 py-2 rounded-lg max-w-[80%] text-sm`}>{text}</div>
    </div>
  );
}

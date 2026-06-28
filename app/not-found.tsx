import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-3">404 — страница не найдена</h1>
      <p className="text-gray-400 mb-6">
        Возможно, CV было удалено или ссылка неверна.
      </p>
      <Link href="/" className="text-blue-400 underline">
        На главную
      </Link>
    </main>
  );
}

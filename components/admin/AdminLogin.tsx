"use client";

import { useState } from "react";

const TOKEN_KEY = "cv_admin_token";

export default function AdminLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setError("Введите admin-token");
      return;
    }
    localStorage.setItem(TOKEN_KEY, token.trim());
    onSuccess(token.trim());
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={submit} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-center">⚡ Admin — CV</h1>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="bg-gray-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Войти
        </button>
        <p className="text-gray-600 text-[11px] text-center">
          Token хранится в localStorage этого браузера
        </p>
      </form>
    </div>
  );
}

export { TOKEN_KEY };

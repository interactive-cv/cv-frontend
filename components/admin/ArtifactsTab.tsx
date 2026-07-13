"use client";

import { useState } from "react";
import { deleteArtifact, uploadArtifact, type Artifact } from "@/lib/admin";
import { TOKEN_KEY } from "./AdminLogin";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ArtifactsTab({
  appId,
  artifacts,
  onChanged,
}: {
  appId: string;
  artifacts: Artifact[];
  onChanged: () => void;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setUploading(true);
    setError("");
    try {
      await uploadArtifact(token, appId, file);
      onChanged();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("400")) {
        setError("Файл слишком большой (макс. 100 MB)");
      } else {
        setError(`Ошибка загрузки: ${msg}`);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string, filename: string) {
    if (!window.confirm(`Удалить файл «${filename}»? Публичная ссылка перестанет работать.`)) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await deleteArtifact(token, id);
      onChanged();
    } catch (err) {
      setError(`Ошибка удаления: ${(err as Error).message}`);
    }
  }

  function copyLink(url: string, code: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  return (
    <div className="grid gap-4 max-w-2xl">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Загрузка */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">📁 Артефакты конкурса</h3>
          <label className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors">
            {uploading ? "Загрузка..." : "📎 Загрузить файл"}
            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          APK, видео, архивы с исходниками. Лимит 100 MB.
          Файлы доступны публично по ссылке, пока отклик активен.
        </p>
      </div>

      {/* Список */}
      {artifacts.length === 0 ? (
        <p className="text-gray-500 text-sm">Пока нет загруженных артефактов.</p>
      ) : (
        <div className="grid gap-3">
          {artifacts.map((art) => (
            <div key={art.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-200 text-sm truncate">
                    📦 {art.filename}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                    <span>{formatSize(art.size_bytes)}</span>
                    <span>⬇ {art.download_count} скачиваний</span>
                    {art.mime_type && (
                      <span className="text-gray-600">{art.mime_type}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(art.id, art.filename)}
                  className="text-xs text-red-400/70 hover:text-red-400 shrink-0"
                >
                  🗑 Удалить
                </button>
              </div>
              {/* Публичная ссылка */}
              <div className="mt-3 flex items-center gap-2">
                <code className="text-xs text-blue-400 bg-gray-800 px-2 py-1 rounded truncate flex-1">
                  {art.download_url}
                </code>
                <button
                  onClick={() => copyLink(art.download_url, art.code)}
                  className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white shrink-0 transition-colors"
                >
                  {copiedCode === art.code ? "✓" : "📋 Копировать"}
                </button>
                <a
                  href={art.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white shrink-0 transition-colors"
                >
                  ⬇
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

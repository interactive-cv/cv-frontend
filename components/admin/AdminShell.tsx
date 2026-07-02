"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminLogin, { TOKEN_KEY } from "./AdminLogin";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    setToken(saved);
    setReady(true);
  }, []);

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    router.push("/admin");
  }

  if (!ready) return null;

  if (!token) {
    return <AdminLogin onSuccess={setToken} />;
  }

  const navItems = [
    { href: "/admin", label: "📋 Отклики", icon: "📋" },
    { href: "/admin/analytics", label: "📊 Аналитика", icon: "📊" },
  ];

  return (
    <div className="min-h-screen flex bg-black text-gray-100">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-800 p-4 flex flex-col gap-1 shrink-0">
        <div className="text-lg font-bold mb-6 px-2">⚡ Admin</div>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => router.push("/admin/new")}
          className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Новый отклик
        </button>
        <div className="flex-1" />
        <button
          onClick={logout}
          className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors text-left"
        >
          🚪 Выйти
        </button>
      </aside>

      {/* Контент */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

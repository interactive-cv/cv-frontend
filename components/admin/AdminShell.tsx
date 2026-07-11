"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminLogin, { TOKEN_KEY } from "./AdminLogin";
import ThemeToggle from "@/components/ThemeToggle";

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
    { href: "/admin/chats", label: "💬 Чаты", icon: "💬" },
    { href: "/admin/analytics", label: "📊 Аналитика", icon: "📊" },
    { href: "/admin/settings", label: "⚙ Настройки", icon: "⚙" },
  ];

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar — фиксированный, не прокручивается */}
      <aside className="w-56 border-r border-gray-800 p-4 flex flex-col gap-1 shrink-0 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-lg font-bold">⚡ Admin</span>
          <ThemeToggle />
        </div>
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
          className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors text-left shrink-0"
        >
          🚪 Выйти
        </button>
      </aside>

      {/* Контент — прокручивается отдельно */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

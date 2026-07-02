import { OWNER_NAME } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-gray-800/80">
      <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight hover:text-blue-400 transition-colors">
          {OWNER_NAME}
        </a>
        <div className="flex gap-5 text-sm text-gray-400">
          <a href="#projects" className="hover:text-white transition-colors">
            Проекты
          </a>
          <a href="#graph" className="hover:text-white transition-colors">
            Граф
          </a>
        </div>
      </nav>
    </header>
  );
}

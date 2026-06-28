export default function Header() {
  return (
    <header className="border-b border-gray-800">
      <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="font-semibold text-lg">
          Валерий Григорьев
        </a>
        <div className="flex gap-4 text-sm text-gray-400">
          <a href="#projects" className="hover:text-white">
            Проекты
          </a>
          <a href="#graph" className="hover:text-white">
            Граф
          </a>
        </div>
      </nav>
    </header>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <p>
          © {new Date().getFullYear()} Имя Фамилия · Flutter / Fullstack · DevOps
        </p>
        <div className="flex gap-4">
          <a href="mailto:you@example.com" className="hover:text-white transition-colors">
            Email
          </a>
          <a
            href="https://t.me/your_handle"
            className="hover:text-white transition-colors"
          >
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}

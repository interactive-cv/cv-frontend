export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <p>
          © {new Date().getFullYear()} Валерий Григорьев · Flutter / Fullstack · DevOps
        </p>
        <div className="flex gap-4">
          <a href="mailto:vrg18@vk.com" className="hover:text-white transition-colors">
            Email
          </a>
          <a
            href="https://t.me/vrg18"
            className="hover:text-white transition-colors"
          >
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}

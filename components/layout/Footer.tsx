export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-12">
      <div className="max-w-4xl mx-auto px-4 py-6 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Валерий Григорьев · Flutter / Fullstack</p>
      </div>
    </footer>
  );
}

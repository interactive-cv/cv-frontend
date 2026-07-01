import { getMasterCV } from "@/lib/api";
import { OWNER_NAME, OWNER_ROLE } from "@/lib/site";

/**
 * Подвал: имя и контакты берутся из API (мастер-CV в БД),
 * роль — из env (NEXT_PUBLIC_OWNER_ROLE).
 * В public-репозитории нет захардкоженных персональных данных —
 * они появляются только при наполнении БД на конкретном деплое.
 */
export default async function Footer() {
  let cv;
  try {
    cv = await getMasterCV();
  } catch {
    cv = null;
  }
  const email = cv?.contacts?.email;
  const telegram = cv?.contacts?.telegram;

  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <p>
          © {new Date().getFullYear()} {OWNER_NAME} · {OWNER_ROLE}
        </p>
        <div className="flex gap-4">
          {email && (
            <a href={`mailto:${email}`} className="hover:text-white transition-colors">
              Email
            </a>
          )}
          {telegram && (
            <a
              href={`https://t.me/${telegram}`}
              className="hover:text-white transition-colors"
            >
              Telegram
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/chat/ChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_URL, OWNER_NAME, DEFAULT_TITLE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = DEFAULT_TITLE;
const DESCRIPTION =
  "Интерактивное резюме и портфолио. AI-ассистент ответит на ваши вопросы по CV.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${OWNER_NAME}`,
  },
  description: DESCRIPTION,
  keywords: ["резюме", "портфолио", "Next.js", "FastAPI", "Fullstack"],
  authors: [{ name: OWNER_NAME }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: `${OWNER_NAME} — портфолио`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Anti-FOUC: ставим тему ДО рендера, синхронно.
          При первом визите (нет cv-theme в localStorage) → всегда dark.
          Иначе — восстанавливаем выбор пользователя.
          Скрипт выполняется до гидратации next-themes, предотвращая мелькание.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var saved = localStorage.getItem('cv-theme');
              var theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
              document.documentElement.classList.add(theme);
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        ` }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}

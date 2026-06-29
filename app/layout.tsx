import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/chat/ChatWidget";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-gray-100">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}

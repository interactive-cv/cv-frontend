import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/chat/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://cv.libera.pro";
const TITLE = "Валерий Григорьев — Flutter / Fullstack";
const DESCRIPTION =
  "Резюме и портфолио: Flutter, Fullstack, DevOps. 11+ лет опыта. AI-ассистент ответит на ваши вопросы по CV.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Валерий Григорьев",
  },
  description: DESCRIPTION,
  keywords: [
    "Flutter", "Fullstack", "Dart", "Java", "Spring", "Next.js",
    "DevOps", "Docker", "PostgreSQL", "резюме", "портфолио",
  ],
  authors: [{ name: "Валерий Григорьев" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Валерий Григорьев — портфолио",
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

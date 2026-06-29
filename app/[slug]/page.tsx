import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getVariant, serverApiUrl } from "@/lib/api";
import CVPage from "@/components/cv/CVPage";

// Короткий код ссылки: 4-6 заглавных букв (формат админки, Задача 6).
const SHORT_CODE_RE = /^[A-Z]{4,6}$/;

/** Динамические метаданные для превью ссылки на конкретный CV-вариант. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Короткая ссылка — общее превью (slug варианта узнается только после резолва).
  if (SHORT_CODE_RE.test(slug)) {
    return {
      title: "CV Имя Фамилия",
      description: "Flutter / Fullstack разработчик. Откройте, чтобы посмотреть резюме.",
    };
  }
  // Реальный slug — пытаемся получить title варианта для персонализированного превью.
  try {
    const v = await getVariant(slug);
    const title = v.company ? `${v.title} · ${v.company}` : v.title;
    return {
      title,
      description: `Вариант резюме: ${v.title}. Flutter / Fullstack, 11+ лет опыта.`,
      openGraph: { title, type: "article" },
    };
  } catch {
    return { title: "CV не найдено" };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const API = serverApiUrl();

  // Короткая ссылка — резолвим и редиректим на реальный slug варианта.
  if (SHORT_CODE_RE.test(slug)) {
    const res = await fetch(`${API}/api/links/resolve?code=${slug}`, { cache: "no-store" });
    if (res.status === 200) {
      const { cv_variant_slug } = await res.json();
      redirect(`/${cv_variant_slug}`);
    }
    if (res.status === 410) redirect("/?expired=1");
    notFound();
  }

  try {
    const variant = await getVariant(slug);
    return <CVPage variant={variant} />;
  } catch {
    notFound();
  }
}

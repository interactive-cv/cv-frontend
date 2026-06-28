import { notFound, redirect } from "next/navigation";
import { getVariant } from "@/lib/api";
import CVPage from "@/components/cv/CVPage";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Короткий код ссылки: 4-6 заглавных букв (формат админки, Задача 6).
const SHORT_CODE_RE = /^[A-Z]{4,6}$/;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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

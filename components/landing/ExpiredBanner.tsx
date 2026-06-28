"use client";

import { useSearchParams } from "next/navigation";

export default function ExpiredBanner() {
  const params = useSearchParams();
  if (params.get("expired") !== "1") return null;
  return (
    <div className="mx-auto max-w-4xl px-4 mt-6">
      <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-200 rounded-lg px-4 py-3 text-sm">
        Срок действия ссылки истёк. Свяжитесь с автором напрямую — контакты ниже.
      </div>
    </div>
  );
}

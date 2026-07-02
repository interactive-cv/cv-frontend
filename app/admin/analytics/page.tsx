import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Аналитика — Админка",
};

/**
 * Заглушка страницы «Аналитика».
 *
 * Сводная аналитика по всем откликам (клики, уникальные, конверсия, динамика)
 * пока не реализована — см. TODO.md. Пока показываем понятное сообщение вместо
 * «Ошибка загрузки» (раньше маршрут отсутствовал → 404 → фронт падал).
 *
 * Когда аналитика будет готова: заменить на клиентский компонент с вызовом
 * /admin/analytics и дашбордом.
 */
export default function AnalyticsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">📊 Аналитика</h1>

      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">🚧</div>
        <p className="text-gray-300 font-medium mb-2">Раздел в разработке</p>
        <p className="text-gray-500 text-sm">
          Сводная аналитика по всем откликам скоро появится здесь.
        </p>
        <p className="text-gray-600 text-xs mt-4">
          Пока что клики и уникальные посетители видны по каждому отклику отдельно
          во вкладке «Аналитика».
        </p>
      </div>
    </div>
  );
}

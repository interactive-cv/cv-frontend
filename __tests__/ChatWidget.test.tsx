import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWidget from "@/components/chat/ChatWidget";

// Тестируем КОНТРАКТ виджета: открытие + POST к /api/chat с телом.
// Сам стриминг (reader-loop) проверен ручным smoke против бэкенда в Задаче 5;
// в jsdom имитация ReadableStream-reader хрупкая и нестабильная, поэтому здесь —
// уверенность, что виджет дёргает правильный эндпоинт с правильным телом.
let lastCall: { url: string; body: string } | null = null;
global.fetch = jest.fn((url: string, init?: RequestInit) => {
  lastCall = { url, body: String(init?.body ?? "") };
  const stream = new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
  return Promise.resolve(new Response(stream));
}) as jest.Mock;

test("opens widget and sends message to /api/chat", async () => {
  const user = userEvent.setup();
  render(<ChatWidget />);
  await user.click(screen.getByRole("button", { name: /спросить ai/i }));
  await user.type(screen.getByPlaceholderText(/спросите/i), "Чем занимаешься?");
  await user.click(screen.getByRole("button", { name: /отправить/i }));

  // появление user-сообщения в DOM доказывает, что send() отработал
  expect(
    await screen.findByText("Чем занимаешься?", undefined, { timeout: 2000 })
  ).toBeInTheDocument();
  expect(lastCall).not.toBeNull();
  expect(lastCall!.url).toMatch(/\/api\/chat$/);
  expect(JSON.parse(lastCall!.body)).toEqual({ message: "Чем занимаешься?" });
});

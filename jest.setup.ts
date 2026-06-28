import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// jsdom не экспонирует TextEncoder/TextDecoder глобально (нужны для stream-тестов чата).
(globalThis as unknown as Record<string, unknown>).TextEncoder = TextEncoder;
(globalThis as unknown as Record<string, unknown>).TextDecoder = TextDecoder;

// react-markdown — pure ESM, Jest/CommonJS конфликтуют + тяжёлый для unit-тестов.
// Мокаем: выводим дочерний текст как-is (контракт виджета проверяем, не markdown-рендер).
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => children,
}));

// jsdom не реализует IntersectionObserver/ResizeObserver — нужны framer-motion (whileInView).
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(globalThis as unknown as Record<string, unknown>).IntersectionObserver = IO;
(globalThis as unknown as Record<string, unknown>).ResizeObserver = IO;

// jsdom не реализует Element.scrollIntoView — нужен для авто-прокрутки чата.
Element.prototype.scrollIntoView = () => {};

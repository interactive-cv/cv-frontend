import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// jsdom не экспонирует TextEncoder/TextDecoder глобально (нужны для stream-тестов чата).
(globalThis as unknown as Record<string, unknown>).TextEncoder = TextEncoder;
(globalThis as unknown as Record<string, unknown>).TextDecoder = TextDecoder;

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

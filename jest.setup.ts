import "@testing-library/jest-dom";

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

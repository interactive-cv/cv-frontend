import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone — минимальный прод-сервер без полного node_modules (для Docker).
  output: "standalone",
};

export default nextConfig;

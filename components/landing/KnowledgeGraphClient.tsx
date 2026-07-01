"use client";

import dynamic from "next/dynamic";

// Client-обёртка: dynamic({ssr:false}) разрешён только в Client Component.
// page.tsx (server) импортирует эту обёртку, а она грузит KnowledgeGraph
// (с прямым импортом react-force-graph) только в браузере.
const KnowledgeGraph = dynamic(
  () => import("./KnowledgeGraph"),
  { ssr: false, loading: () => null }
);

export default function KnowledgeGraphClient({
  projects,
}: {
  projects: import("@/lib/types").Project[];
}) {
  return <KnowledgeGraph projects={projects} />;
}

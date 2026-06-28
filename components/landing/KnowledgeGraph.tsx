"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

// react-force-graph-2d использует canvas/HTML — только в браузере (ssr: false).
const ForceGraph = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  return (
    <section id="graph" className="py-12">
      <h2 className="text-2xl font-bold mb-4">Граф знаний</h2>
      <p className="text-sm text-gray-500 mb-3">
        Связи проектов и технологий: наведите на узел, чтобы подсветить связи.
      </p>
      <div className="h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        <ForceGraph
          graphData={{ nodes, links }}
          nodeLabel="label"
          nodeAutoColorBy="group"
          linkColor={() => "#4b5563"}
          backgroundColor="#111827"
        />
      </div>
    </section>
  );
}

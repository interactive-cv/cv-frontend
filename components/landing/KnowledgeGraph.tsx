"use client";

import { useMemo, useRef, useState } from "react";
import ForceGraph, { type ForceGraphMethods } from "react-force-graph-2d";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  // Нативный тип инстанса графа — ref пробрасывается напрямую (без dynamic-обёртки).
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [fitted, setFitted] = useState(false);
  const tickCount = useRef(0);

  return (
    <section id="graph" className="py-12">
      <h2 className="text-2xl font-bold mb-4">Граф знаний</h2>
      <p className="text-sm text-gray-500 mb-3">
        Связи проектов и технологий: наведите на узел, чтобы подсветить связи.
      </p>
      <div className="h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        <ForceGraph
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeLabel="label"
          nodeAutoColorBy="group"
          linkColor={() => "#4b5563"}
          backgroundColor="#111827"
          enableNodeDrag={false}
          cooldownTime={2000}
          // После ~60 тиков (движок разложил узлы) подгоняем камеру один раз.
          onEngineTick={() => {
            tickCount.current += 1;
            if (fitted || tickCount.current < 60) return;
            setFitted(true);
            graphRef.current?.zoomToFit(0, 40);
          }}
        />
      </div>
    </section>
  );
}

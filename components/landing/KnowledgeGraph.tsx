"use client";

import { useMemo, useRef } from "react";
import ForceGraph, { type ForceGraphMethods } from "react-force-graph-2d";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adjusted = useRef(false);

  return (
    <section id="graph" className="py-12">
      <h2 className="text-2xl font-bold mb-4">Граф знаний</h2>
      <p className="text-sm text-gray-500 mb-3">
        Связи проектов и технологий: наведите на узел, чтобы подсветить связи.
      </p>
      <div ref={containerRef} className="h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        <ForceGraph
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeLabel="label"
          nodeAutoColorBy="group"
          linkColor={() => "#4b5563"}
          backgroundColor="#111827"
          enableNodeDrag={false}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          cooldownTime={3000}
          d3AlphaDecay={0.05}
          // После остановки движка — сдвигаем canvas через CSS transform,
          // т.к. API камеры force-graph (zoomToFit/centerAt) в этом окружении
          // визуально не работает (вызывается, но не двигает).
          onEngineStop={() => {
            if (adjusted.current || !containerRef.current) return;
            adjusted.current = true;
            const canvas = containerRef.current.querySelector("canvas");
            if (canvas) {
              // force-graph рисует граф в верхнем-левом углу canvas.
              // Сдвигаем canvas в центр контейнера + зумируем до читаемости.
              canvas.style.transformOrigin = "top left";
              canvas.style.transform = "translate(50%, 50%) scale(0.6)";
            }
          }}
        />
      </div>
    </section>
  );
}

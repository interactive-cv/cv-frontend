"use client";

import { useMemo, useRef } from "react";
import ForceGraph, { type ForceGraphMethods } from "react-force-graph-2d";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

// Размер canvas графа (max-w-4xl ≈ 768px на десктопе, высота блока 400px).
// Задаём ЯВНО — иначе при dynamic-загрузке force-graph измеряет контейнер
// как 0×0 и zoomToFit центрирует относительно пустоты.
const GRAPH_WIDTH = 768;
const GRAPH_HEIGHT = 400;

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const fitted = useRef(false);

  return (
    <section id="graph" className="py-12">
      <h2 className="text-2xl font-bold mb-4">Граф знаний</h2>
      <p className="text-sm text-gray-500 mb-3">
        Связи проектов и технологий: наведите на узел, чтобы подсветить связи.
      </p>
      <div className="h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        <ForceGraph
          ref={graphRef}
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
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
          // После остановки движка подгоняем камеру под все узлы.
          // Теперь canvas имеет правильные размеры — zoomToFit сработает корректно.
          onEngineStop={() => {
            if (fitted.current) return;
            fitted.current = true;
            graphRef.current?.zoomToFit(500, 60);
          }}
        />
      </div>
    </section>
  );
}

"use client";

import { useMemo, useRef } from "react";
import ForceGraph, { type ForceGraphMethods } from "react-force-graph-2d";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

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
          graphData={{ nodes, links }}
          nodeLabel="label"
          nodeAutoColorBy="group"
          linkColor={() => "#4b5563"}
          backgroundColor="#111827"
          enableNodeDrag={false}
          cooldownTime={3000}
          d3AlphaDecay={0.05}
          // После первого тика движка — подгоняем камеру (зум + центр)
          // под фактические позиции узлов. Узлы уже раскиданы круговой раскладкой
          // в buildGraph, поэтому одного вызова достаточно.
          onEngineTick={() => {
            if (fitted.current) return;
            fitted.current = true;
            graphRef.current?.zoomToFit(500, 60);
          }}
        />
      </div>
    </section>
  );
}

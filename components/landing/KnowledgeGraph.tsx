"use client";

import { useMemo, useRef, useState } from "react";
import ForceGraph, { type ForceGraphMethods } from "react-force-graph-2d";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  // Центрируем камеру на (0,0) один раз — первый тик движка.
  const centered = useRef(false);
  const [debug, setDebug] = useState("");

  return (
    <section id="graph" className="py-12">
      <h2 className="text-2xl font-bold mb-4">Граф знаний</h2>
      <p className="text-sm text-gray-500 mb-3">
        Связи проектов и технологий: наведите на узел, чтобы подсветить связи.
      </p>
      {debug && (
        <p className="text-xs text-yellow-400 mb-2">[debug] {debug}</p>
      )}
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
          // Явная инициализация камеры: центр в (0,0), зум 1 — первый тик.
          // Граф уже раскидан в координатах с центром (0,0) в buildGraph.
          onEngineTick={() => {
            if (centered.current) return;
            centered.current = true;
            // Диагностика: реальные координаты узлов после раскладки.
            const ns = nodes as Array<{ x?: number; y?: number }>;
            const xs = ns.map((n) => n.x ?? 0);
            const ys = ns.map((n) => n.y ?? 0);
            const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
            const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
            console.log("[graph] bbox center:", cx, cy, "| nodes:", ns.length);
            setDebug(`bbox center: ${cx.toFixed(0)}, ${cy.toFixed(0)} | nodes: ${ns.length}`);
            graphRef.current?.centerAt(cx, cy, 0);
          }}
        />
      </div>
    </section>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import ForceGraph, { type ForceGraphMethods } from "react-force-graph-2d";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const fitted = useRef(false);
  const [debug, setDebug] = useState("");

  return (
    <section id="graph" className="py-12">
      <h2 className="text-2xl font-bold mb-4">Граф знаний</h2>
      <p className="text-sm text-gray-500 mb-3">
        Связи проектов и технологий: наведите на узел, чтобы подсветить связи.
      </p>
      {debug && <p className="text-xs text-yellow-400 mb-2">[debug] {debug}</p>}
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
          onEngineTick={() => {
            if (fitted.current) return;
            // Ждём ~80 тиков — узлы разложились, позиции стабильны.
            // Диагностика показала: bbox center ~(-23,-8), 122 узла.
            fitted.current = true;
            // zoomToFit вычисляет И зум, И центр по фактическим позициям.
            const ok = graphRef.current?.zoomToFit(500, 60);
            setDebug(`zoomToFit вызван, ok=${ok ? "да" : "нет (ref?)"}`);
          }}
          // Передаём tickThreshold, чтобы отложенный вызов сработал наверняка:
          // force-graph крутит движок много тиков подряд — на одном из них точно fit.
        />
      </div>
    </section>
  );
}

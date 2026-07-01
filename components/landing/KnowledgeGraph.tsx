"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

// react-force-graph-2d использует canvas/HTML — только в браузере (ssr: false).
const ForceGraph = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  // ref хранит методы инстанса графа; fit делаем один раз после стабилизации.
  const graphRef = useRef<{
    zoomToFit: (ms?: number, pad?: number) => void;
    centerAt: (x?: number, y?: number, ms?: number) => void;
    zoom: (z?: number, ms?: number) => void;
  } | null>(null);
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
          ref={graphRef as never}
          graphData={{ nodes, links }}
          nodeLabel="label"
          nodeAutoColorBy="group"
          linkColor={() => "#4b5563"}
          backgroundColor="#111827"
          enableNodeDrag={false}
          cooldownTime={2000}
          // Каждым тиком считаем; после ~60 тиков (движок разложился) делаем fit.
          onEngineTick={() => {
            tickCount.current += 1;
            if (fitted || tickCount.current < 60) return;
            setFitted(true);
            // Подгоняем камеру — граф заполнит окно с отступом и отцентрируется.
            graphRef.current?.zoomToFit(0, 40);
          }}
        />
      </div>
    </section>
  );
}

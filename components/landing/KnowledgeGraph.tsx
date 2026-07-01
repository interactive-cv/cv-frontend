"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

// react-force-graph-2d использует canvas/HTML — только в браузере (ssr: false).
const ForceGraph = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  const graphRef = useRef<{ zoomToFit: (ms?: number, pad?: number) => void } | undefined>(undefined);
  // fit делаем один раз — после остановки силового движка.
  const [didFit, setDidFit] = useState(false);

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
          // Узлами управляет силовой алгоритм, не ручное перетаскивание.
          enableNodeDrag={false}
          // Граф успокаивается за конечное число тиков и останавливается
          // (не «дёргается» бесконечно).
          cooldownTicks={100}
          // Один раз после остановки движка — подгоняем камеру под все узлы.
          onEngineStop={() => {
            if (didFit) return;
            setDidFit(true);
            graphRef.current?.zoomToFit(400, 40);
          }}
        />
      </div>
    </section>
  );
}

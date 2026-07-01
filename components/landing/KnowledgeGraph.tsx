"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { buildGraph } from "@/lib/graph";
import type { Project } from "@/lib/types";

// react-force-graph-2d использует canvas/HTML — только в браузере (ssr: false).
const ForceGraph = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function KnowledgeGraph({ projects }: { projects: Project[] }) {
  const { nodes, links } = useMemo(() => buildGraph(projects), [projects]);
  const graphRef = useRef<{ zoomToFit: (ms?: number, pad?: number) => void } | undefined>(undefined);
  const didFit = useRef(false);

  // Fit по событию остановки движка. Запасной путь — через 2.5с после монтирования,
  // чтобы гарантированно подогнать камеру даже если onEngineStop не сработал.
  useEffect(() => {
    const t = setTimeout(() => {
      if (didFit.current) return;
      didFit.current = true;
      graphRef.current?.zoomToFit(400, 40);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

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
          // cooldownTime (мс) вместо ticks — движок стабилизируется за время,
          // затем замораживается (граф не дёргается бесконечно).
          cooldownTime={2000}
          onEngineStop={() => {
            if (didFit.current) return;
            didFit.current = true;
            graphRef.current?.zoomToFit(400, 40);
          }}
        />
      </div>
    </section>
  );
}

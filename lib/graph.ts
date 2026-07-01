import type { Project } from "./types";

export interface GraphNode {
  id: string;
  group: "project" | "skill";
  label: string;
  // Предустановленные координаты: граф сразу раскидан и центрирован в (0,0),
  // не зависит от капризного zoomToFit.
  x?: number;
  y?: number;
}
export interface GraphLink {
  source: string;
  target: string;
}

/**
 * Круговая раскладка: проекты по внешнему кругу, навыки — на внутреннем.
 * Координаты центрированы в середине canvas-области графа (а не в 0,0),
 * т.к. API камеры force-graph в этом окружении не сдвигает проекцию.
 * Размер контейнера графа: ~768×400 (max-w-4xl, h-[400px]).
 */
/**
 * Круговая раскладка: проекты по внешнему кругу, навыки — на внутреннем.
 * Центр в (0,0) — zoomToFit force-graph центрирует canvas по фактическим позициям.
 */
export function buildGraph(
  projects: Project[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const seenSkill = new Set<string>();

  const projectCount = projects.length;
  const projectRadius = projectCount > 0 ? 250 : 0;

  projects.forEach((p, i) => {
    const pAngle = (i / projectCount) * 2 * Math.PI;
    nodes.push({
      id: p.title,
      group: "project",
      label: p.title,
      x: Math.cos(pAngle) * projectRadius,
      y: Math.sin(pAngle) * projectRadius,
    });
    const techs = [...p.tags, ...p.stack];
    techs.forEach((s, j) => {
      if (!seenSkill.has(s)) {
        seenSkill.add(s);
        const sAngle = ((i + (j + 1) / (techs.length + 1)) / projectCount) * 2 * Math.PI;
        const skillRadius = projectRadius * 0.45;
        nodes.push({
          id: s,
          group: "skill",
          label: s,
          x: Math.cos(sAngle) * skillRadius,
          y: Math.sin(sAngle) * skillRadius,
        });
      }
      links.push({ source: p.title, target: s });
    });
  });

  return { nodes, links };
}

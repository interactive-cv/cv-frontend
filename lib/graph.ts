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
const CANVAS_CENTER_X = 380;
const CANVAS_CENTER_Y = 200;

export function buildGraph(
  projects: Project[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const seenSkill = new Set<string>();

  const projectCount = projects.length;
  const projectRadius = projectCount > 0 ? 160 : 0;

  projects.forEach((p, i) => {
    // Проект — на внешнем круге, центр смещён в середину canvas.
    const pAngle = (i / projectCount) * 2 * Math.PI;
    nodes.push({
      id: p.title,
      group: "project",
      label: p.title,
      x: CANVAS_CENTER_X + Math.cos(pAngle) * projectRadius,
      y: CANVAS_CENTER_Y + Math.sin(pAngle) * projectRadius,
    });
    // Навыки проекта — на внутреннем круге.
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
          x: CANVAS_CENTER_X + Math.cos(sAngle) * skillRadius,
          y: CANVAS_CENTER_Y + Math.sin(sAngle) * skillRadius,
        });
      }
      links.push({ source: p.title, target: s });
    });
  });

  return { nodes, links };
}

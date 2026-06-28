import type { Project } from "./types";

export interface GraphNode {
  id: string;
  group: "project" | "skill";
  label: string;
}
export interface GraphLink {
  source: string;
  target: string;
}

export function buildGraph(
  projects: Project[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const seenSkill = new Set<string>();
  for (const p of projects) {
    nodes.push({ id: p.title, group: "project", label: p.title });
    for (const s of [...p.tags, ...p.stack]) {
      if (!seenSkill.has(s)) {
        nodes.push({ id: s, group: "skill", label: s });
        seenSkill.add(s);
      }
      links.push({ source: p.title, target: s });
    }
  }
  return { nodes, links };
}

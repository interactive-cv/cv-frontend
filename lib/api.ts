import type { CVVariant, MasterCV, Project } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const getMasterCV = (): Promise<MasterCV> => get<MasterCV>("/api/cv/master");
export const getProjects = (): Promise<Project[]> => get<Project[]>("/api/projects");
export const getVariant = (slug: string): Promise<CVVariant> =>
  get<CVVariant>(`/api/variants/${slug}`);

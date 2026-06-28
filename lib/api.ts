import type { CVVariant, MasterCV, Project } from "./types";

// NEXT_PUBLIC_API_URL инлайнится в клиентский бандл (виден браузеру) → публичный домен.
// На сервере (SSR) браузерного URL нет — там ходим к бэкенду по внутренней compose-сети
// (http://fastapi:8000), что быстрее и не идёт через nginx/интернет.
const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SERVER_API = process.env.API_URL_INTERNAL ?? CLIENT_API;
const API = typeof window === "undefined" ? SERVER_API : CLIENT_API;

/** Внутренний URL для серверных fetch (SSR) — для использования в server components. */
export const serverApiUrl = (): string => SERVER_API;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const getMasterCV = (): Promise<MasterCV> => get<MasterCV>("/api/cv/master");
export const getProjects = (): Promise<Project[]> => get<Project[]>("/api/projects");
export const getVariant = (slug: string): Promise<CVVariant> =>
  get<CVVariant>(`/api/variants/${slug}`);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface Application {
  id: string;
  company: string;
  role: string;
  slug: string;
  status: string;
  total_clicks: number;
  unique_clicks: number;
  short_link_code: string | null;
  created_at: string;
  published_at: string | null;
}

export interface ApplicationDetail extends Application {
  vacancy_text: string;
  cv_markdown: string;
  cover_letter: string;
  last_click_at: string | null;
}

/** Список откликов с inline-аналитикой. */
export async function listApplications(token: string): Promise<Application[]> {
  const res = await fetch(`${API}/api/admin/applications`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** AI-генерация CV + cover letter из вакансии. */
export async function generateCV(
  token: string,
  data: {
    company: string;
    role: string;
    vacancy_text: string;
    selected_projects: string[];
  }
): Promise<{ cv_markdown: string; cover_letter: string }> {
  const res = await fetch(`${API}/api/admin/applications/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Создать отклик (после генерации/редактирования). */
export async function createApplication(
  token: string,
  data: {
    company: string;
    role: string;
    vacancy_text: string;
    cover_letter: string;
    cv_markdown: string;
    slug: string;
    status: string;
  }
): Promise<{ id: string; slug: string }> {
  const res = await fetch(`${API}/api/admin/applications`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Детальная страница отклика. */
export async function getApplication(
  token: string,
  id: string
): Promise<ApplicationDetail> {
  const res = await fetch(`${API}/api/admin/applications/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Редактирование CV / cover letter / статуса. */
export async function updateApplication(
  token: string,
  id: string,
  data: { cover_letter?: string; cv_markdown?: string; status?: string }
): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

/** Опубликовать: создать короткую ссылку, status=active. */
export async function publishApplication(
  token: string,
  id: string
): Promise<{ code: string; url: string }> {
  const res = await fetch(`${API}/api/admin/applications/${id}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Архивировать. */
export async function archiveApplication(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${id}/archive`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

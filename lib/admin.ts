const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export type ApplicationKind = "vacancy" | "freelance";

/** Общие поля отклика (для списка и деталей). */
export interface Application {
  id: string;
  company: string;
  role: string;
  slug: string;
  status: string;
  kind: ApplicationKind;
  total_clicks: number;
  unique_clicks: number;
  short_link_code: string | null;
  source_url: string | null;
  chat_url: string | null;
  budget: string | null;
  applicant_count: number | null;
  deadline: string | null;
  expected_term: string | null;
  rating: number | null;
  created_at: string;
  published_at: string | null;
}

export interface ApplicationDetail extends Application {
  vacancy_text: string;
  cv_markdown: string;
  cover_letter: string;
  last_click_at: string | null;
}

/** Поля отклика, которые можно передать при создании. */
export interface ApplicationInput {
  company: string;
  role: string;
  vacancy_text: string;
  cover_letter: string;
  cv_markdown: string;
  slug: string;
  status: string;
  kind?: ApplicationKind;
  source_url?: string;
  chat_url?: string;
  budget?: string;
  applicant_count?: number;
  deadline?: string;
  expected_term?: string;
  rating?: number;
}

/** Поля отклика, которые можно обновить через PATCH. */
export interface ApplicationUpdate {
  cover_letter?: string;
  cv_markdown?: string;
  status?: string;
  kind?: ApplicationKind;
  source_url?: string;
  chat_url?: string;
  budget?: string;
  applicant_count?: number;
  deadline?: string;
  expected_term?: string;
  rating?: number;
}

/** Список откликов с inline-аналитикой. */
export async function listApplications(token: string): Promise<Application[]> {
  const res = await fetch(`${API}/api/admin/applications`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** AI-генерация CV + cover letter из вакансии или фриланс-заказа. */
export async function generateCV(
  token: string,
  data: {
    company: string;
    role: string;
    vacancy_text: string;
    selected_projects: string[];
    kind?: ApplicationKind;
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
  data: ApplicationInput
): Promise<{ id: string; slug: string; url?: string }> {
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
  data: ApplicationUpdate
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

// ===== Settings: редактируемые тексты (мастер-CV, README, промпты) =====

export interface ConfigText {
  key: string;
  value: string;
  updated_at: string;
}

export interface Settings {
  master_cv: ConfigText;
  readme: ConfigText;
  prompt_chat: ConfigText;
  prompt_generate: ConfigText;
  prompt_generate_freelance: ConfigText;
  prompt_cv_edit: ConfigText;
}

/** Получить все настройки (5 ключей). */
export async function getSettings(token: string): Promise<Settings> {
  const res = await fetch(`${API}/api/admin/settings`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Частичное обновление настроек. */
export async function updateSettings(
  token: string,
  data: Partial<Record<keyof Settings, string>>
): Promise<Settings> {
  const res = await fetch(`${API}/api/admin/settings`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** AI-правка мастер-CV: предпросмотр (без сохранения). */
export async function previewMasterCvEdit(
  token: string,
  instruction: string
): Promise<{ preview_markdown: string }> {
  const res = await fetch(`${API}/api/admin/settings/master-cv/preview`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ instruction }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Применить предпросмотр (или ручную правку) к мастер-CV. */
export async function applyMasterCv(
  token: string,
  markdown: string
): Promise<Settings> {
  const res = await fetch(`${API}/api/admin/settings/master-cv/apply`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ markdown }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/** Не-2xx ответ API → Error с сообщением из тела {"message": ...}.
 *  Бэкенд возвращает человекочитаемый диагноз (например, «это старый формат
 *  .doc — пересохраните»); без этого хелпера UI показывал бы только «400». */
async function httpError(res: Response): Promise<Error> {
  let msg = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (body?.message) msg = `${body.message} (HTTP ${res.status})`;
  } catch {
    // тело не JSON — остаётся код статуса
  }
  return new Error(msg);
}

/** Скачивает blob как файл (PDF-экспорт). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/[/\\]/g, "-").replace(/\s+/g, "_");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** PDF из текущего содержимого редактора CV (включая несохранённые правки). */
export async function exportPdfPreview(
  token: string,
  markdown: string,
  title?: string
): Promise<Blob> {
  const res = await fetch(`${API}/api/admin/pdf/preview`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ markdown, title }),
  });
  if (!res.ok) throw await httpError(res);
  return res.blob();
}

export type ApplicationKind = "vacancy" | "freelance" | "contest";
export type ApplicationPlatform = "fl" | "kwork" | null;

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
  budget_max: string | null;
  applicant_count: number | null;
  deadline: string | null;
  expected_term: string | null;
  rating: number | null;
  spec_text: string | null;
  estimate: string | null;
  platform: ApplicationPlatform;
  created_at: string;
  published_at: string | null;
}

export interface Interview {
  id: string;
  application_id: string;
  scheduled_at: string;
  notes_before: string | null;
  notes_after: string | null;
  created_at: string;
  application_role?: string;
  application_company?: string | null;
}

export interface Artifact {
  id: string;
  application_id: string;
  code: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number;
  download_count: number;
  download_url: string;
  created_at: string;
}

export interface ApplicationDetail extends Application {
  vacancy_text: string;
  cv_markdown: string;
  cover_letter: string;
  generated_prompt: string | null;
  extra_instruction: string | null;
  platform: ApplicationPlatform;
  interviews: Interview[];
  draft_reply?: string | null;
  artifacts: Artifact[];
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
  budget_max?: string;
  applicant_count?: number;
  deadline?: string;
  expected_term?: string;
  rating?: number;
  spec_text?: string;
  estimate?: string;
  generated_prompt?: string;
  extra_instruction?: string;
  platform?: ApplicationPlatform;
  /** Staged-загрузки (POST /uploads) — привязать к создаваемой заявке. */
  uploads?: string[];
}

/** Поля отклика, которые можно обновить через PATCH. */
export interface ApplicationUpdate {
  company?: string;
  role?: string;
  cover_letter?: string;
  cv_markdown?: string;
  status?: string;
  kind?: ApplicationKind;
  source_url?: string;
  chat_url?: string;
  budget?: string;
  budget_max?: string;
  applicant_count?: number;
  deadline?: string;
  expected_term?: string;
  rating?: number;
  spec_text?: string;
  estimate?: string;
}

/** Список откликов с inline-аналитикой. */
export async function listApplications(token: string): Promise<Application[]> {
  const res = await fetch(`${API}/api/admin/applications`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
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
    platform?: ApplicationPlatform;
    budget?: string;
    budget_max?: string;
    spec_text?: string;
    extra_instruction?: string;
    temperature?: number;
    cover_limit?: number;
  }
): Promise<{ cv_markdown: string; cover_letter: string; estimate: string | null; prompt: string }> {
  const res = await fetch(`${API}/api/admin/applications/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

/**
 * Итеративная правка отклика через чат с LLM (стриминг).
 * Возвращает ReadableStream — токены накапливаются на стороне вызывающего.
 */
export async function editChatStream(
  token: string,
  data: {
    cv_markdown: string;
    cover_letter: string;
    instruction: string;
    kind?: ApplicationKind;
    vacancy_text?: string;
    history?: { role: string; content: string }[];
    temperature?: number;
    cover_limit?: number;
    /** chat — диалог (только ответ), edit — применить правку текстов. */
    mode?: "chat" | "edit";
  }
): Promise<Response> {
  const res = await fetch(`${API}/api/admin/applications/edit-chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res;
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
  if (!res.ok) throw await httpError(res);
  return res.json();
}

/** Детальная страница отклика. */
export async function getApplication(
  token: string,
  id: string
): Promise<ApplicationDetail> {
  const res = await fetch(`${API}/api/admin/applications/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
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
  if (!res.ok) throw await httpError(res);
}

/** Опубликовать: создать короткую ссылку, status=active. */
export async function publishApplication(
  token: string,
  id: string
): Promise<{ code: string | null; url: string | null }> {
  const res = await fetch(`${API}/api/admin/applications/${id}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

/** Архивировать. */
export async function archiveApplication(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${id}/archive`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
}

/** Полное удаление отклика со всеми артефактами. */
export async function deleteApplication(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
}

/** Загрузка файлов ТЗ (PDF/DOCX) → извлечение текста на бэкенде. */
export async function uploadSpecFiles(
  token: string,
  files: File[]
): Promise<{
  spec_text: string;
  files: { filename: string; type: string; elements: number }[];
  errors: string[];
  total_chars: number;
}> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const res = await fetch(`${API}/api/admin/applications/upload-spec`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

// ===== Chats: HR-диалоги =====

export interface Visitor {
  session_id: string;
  display_name: string;
  is_admin: boolean;
  views: number;
  last_visit: string | null;
  has_chat: boolean;
}

export async function getVisitors(token: string, appId: string): Promise<Visitor[]> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/visitors`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export interface ChatSessionBrief {
  id: string;
  display_name: string;
  visitor_name: string | null;
  is_admin: boolean;
  short_link_code: string | null;
  message_count: number;
  created_at: string;
  last_active_at: string;
}

export interface ChatMessageItem {
  role: string;
  content: string;
  created_at: string;
}

export interface ChatSessionDetail {
  id: string;
  visitor_name: string | null;
  short_link_code: string | null;
  created_at: string;
  last_active_at: string;
  messages: ChatMessageItem[];
}

export async function listChats(token: string): Promise<ChatSessionBrief[]> {
  const res = await fetch(`${API}/api/admin/chats`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function getChat(token: string, id: string): Promise<ChatSessionDetail> {
  const res = await fetch(`${API}/api/admin/chats/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

// ===== Interviews: этапы собеседований =====

export async function createInterview(
  token: string,
  appId: string,
  data: { scheduled_at: string; notes_before?: string; notes_after?: string }
): Promise<Interview> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/interviews`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function updateInterview(
  token: string,
  interviewId: string,
  data: { scheduled_at?: string; notes_before?: string; notes_after?: string }
): Promise<Interview> {
  const res = await fetch(`${API}/api/admin/interviews/${interviewId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function deleteInterview(token: string, interviewId: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/interviews/${interviewId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
}

export async function getUpcoming(token: string): Promise<Interview[]> {
  const res = await fetch(`${API}/api/admin/upcoming`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

// ===== Artifacts: файлы конкурсных откликов =====

export async function uploadArtifact(token: string, appId: string, file: File): Promise<Artifact> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/api/admin/applications/${appId}/artifacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function deleteArtifact(token: string, artifactId: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/artifacts/${artifactId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
}

// ===== Instructions: лента доп. инструкций для переиспользования =====

export interface InstructionItem {
  id: string;
  application_id: string;
  role: string;
  company: string | null;
  extra_instruction: string;
  created_at: string;
}

export async function getInstructions(token: string): Promise<InstructionItem[]> {
  const res = await fetch(`${API}/api/admin/instructions`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
  return res.json();
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
  prompt_generate_contest: ConfigText;
  prompt_cv_edit: ConfigText;
}

/** Получить все настройки (5 ключей). */
export async function getSettings(token: string): Promise<Settings> {
  const res = await fetch(`${API}/api/admin/settings`, { headers: authHeaders(token) });
  if (!res.ok) throw await httpError(res);
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
  if (!res.ok) throw await httpError(res);
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
  if (!res.ok) throw await httpError(res);
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
  if (!res.ok) throw await httpError(res);
  return res.json();
}

// ===== Negotiation: переговоры с заказчиком =====

export type NegotiationRole = "customer" | "me";
export type NegotiationChannel = "fl" | "telegram" | "email";

export interface NegotiationMessage {
  id: string;
  role: NegotiationRole;
  channel: NegotiationChannel;
  content: string;
  created_at: string;
}

export async function listNegotiation(
  token: string,
  appId: string
): Promise<NegotiationMessage[]> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/negotiation`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function addNegotiationMessage(
  token: string,
  appId: string,
  data: { role: NegotiationRole; channel: NegotiationChannel; content: string }
): Promise<NegotiationMessage> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/negotiation`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function updateNegotiationMessage(
  token: string,
  messageId: string,
  data: { content?: string; channel?: NegotiationChannel }
): Promise<NegotiationMessage> {
  const res = await fetch(`${API}/api/admin/negotiation/${messageId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function deleteNegotiationMessage(
  token: string,
  messageId: string
): Promise<void> {
  const res = await fetch(`${API}/api/admin/negotiation/${messageId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
}

/** Черновик ответа заказчику — стриминг glm (контекст собирает бэкенд). */
export async function suggestReplyStream(
  token: string,
  appId: string,
  data: { instruction?: string }
): Promise<Response> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/suggest-reply`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await httpError(res);
  return res;
}

// ===== Assistant: тред владельца с LLM по отклику =====

export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  created_at: string;
}

export async function listAssistantMessages(
  token: string,
  appId: string
): Promise<AssistantMessage[]> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/assistant-messages`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

/** Сохранить ответ ассистента после завершения стрима. */
export async function saveAssistantMessage(
  token: string,
  appId: string,
  content: string
): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/assistant-messages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw await httpError(res);
}

export async function clearAssistantThread(
  token: string,
  appId: string
): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/assistant-messages`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await httpError(res);
}

/** Автосохранение черновика ответа заказчику. */
export async function saveDraftReply(
  token: string,
  appId: string,
  draft: string
): Promise<void> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/draft-reply`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ draft }),
  });
  if (!res.ok) throw await httpError(res);
}

/** Сообщение в тред ассистента — стриминг glm (контекст собирает бэкенд).
 *  Ответ может содержать ===DRAFT===...===END=== — текст для заказчика. */
export async function assistantChatStream(
  token: string,
  appId: string,
  message: string
): Promise<Response> {
  const res = await fetch(`${API}/api/admin/applications/${appId}/assistant-chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw await httpError(res);
  return res;
}

// ===== Staged uploads: файлы до создания заявки =====

export interface StagedUpload {
  id: string;
  filename: string;
  size_bytes: number;
  text: string | null;
  error: string | null;
}

/** Загрузка файлов (любых) до создания заявки: сохраняются сразу,
 *  текст извлекается best-effort (pdf/docx/txt). */
export async function uploadFiles(
  token: string,
  files: File[]
): Promise<StagedUpload[]> {
  const formData = new FormData();
  for (const f of files) formData.append("files", f);
  const res = await fetch(`${API}/api/admin/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw await httpError(res);
  return res.json();
}

export async function deleteStagedUpload(
  token: string,
  uploadId: string
): Promise<void> {
  const res = await fetch(`${API}/api/admin/uploads/${uploadId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await httpError(res);
}

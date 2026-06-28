export interface MasterCV {
  summary: string;
  contacts: {
    email?: string;
    telegram?: string;
    github?: string;
    city?: string;
    format?: string;
  };
  skills_core: Record<string, string[]>;
  skills_familiar: Record<string, string[]>;
  languages: Record<string, string>;
  format: { city?: string; format?: string };
}

export interface CVVariant {
  slug: string;
  title: string;
  company: string | null;
  content_markdown: string;
}

export interface Project {
  title: string;
  period: string;
  role: string;
  tags: string[];
  short_desc: string;
  stack: string[];
  metrics: Record<string, string | number>;
  order_idx: number;
}

import fs from "node:fs";
import path from "node:path";
import type {
  Concept,
  ConceptMeta,
  Question,
  QuestionMeta,
  Subject,
} from "./types";

const DATA_FILE = path.join(process.cwd(), "public/content-data.json");

type ContentData = {
  builtAt: string;
  questions: Question[];
  concepts: Concept[];
};

let _data: ContentData | null = null;

function loadData(): ContentData {
  if (_data) return _data;
  if (!fs.existsSync(DATA_FILE)) {
    console.error(
      "[content] public/content-data.json not found. Run `npm run content` first."
    );
    _data = { builtAt: "", questions: [], concepts: [] };
    return _data;
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  _data = JSON.parse(raw) as ContentData;
  return _data;
}

export function getAllQuestions(): Question[] {
  return loadData().questions;
}

export function getQuestion(id: string): Question | null {
  return getAllQuestions().find((q) => q.id === id) ?? null;
}

export function getQuestionMeta(): QuestionMeta[] {
  return getAllQuestions().map((q) => ({
    id: q.id,
    subject: q.subject,
    category: q.category,
    type: q.type,
    tags: q.tags,
    preview: q.question.slice(0, 80),
  }));
}

export function getAllConcepts(): Concept[] {
  return loadData().concepts;
}

export function getConcept(slug: string): Concept | null {
  return getAllConcepts().find((c) => c.slug === slug) ?? null;
}

export function getConceptMeta(): ConceptMeta[] {
  return getAllConcepts().map((c) => {
    const { body: _body, bodyHtml: _bodyHtml, ...meta } = c;
    void _body;
    void _bodyHtml;
    return meta;
  });
}

export function groupQuestionsByCategory(): Record<
  Subject,
  Record<string, QuestionMeta[]>
> {
  const meta = getQuestionMeta();
  const result: Record<Subject, Record<string, QuestionMeta[]>> = {
    1: {},
    2: {},
  };
  for (const q of meta) {
    const bucket = result[q.subject][q.category] ?? [];
    bucket.push(q);
    result[q.subject][q.category] = bucket;
  }
  return result;
}

export function groupConceptsByCategory(): Record<
  Subject,
  Record<string, ConceptMeta[]>
> {
  const meta = getConceptMeta();
  const result: Record<Subject, Record<string, ConceptMeta[]>> = {
    1: {},
    2: {},
  };
  for (const c of meta) {
    const bucket = result[c.subject][c.category] ?? [];
    bucket.push(c);
    result[c.subject][c.category] = bucket;
  }
  return result;
}

export function getCategories(subject: Subject): string[] {
  const meta = getQuestionMeta().filter((q) => q.subject === subject);
  return Array.from(new Set(meta.map((q) => q.category))).sort();
}

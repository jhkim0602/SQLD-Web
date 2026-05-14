import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  Concept,
  ConceptMeta,
  Question,
  QuestionMeta,
  Subject,
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const QUESTIONS_DIR = path.join(CONTENT_ROOT, "questions");
const CONCEPTS_DIR = path.join(CONTENT_ROOT, "concepts");

function readDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

let _questionCache: Question[] | null = null;
let _conceptCache: Concept[] | null = null;

export function getAllQuestions(): Question[] {
  if (_questionCache) return _questionCache;
  const files = readDir(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));
  const questions = files.map((f) => {
    const raw = fs.readFileSync(path.join(QUESTIONS_DIR, f), "utf-8");
    return JSON.parse(raw) as Question;
  });
  questions.sort((a, b) => a.id.localeCompare(b.id));
  _questionCache = questions;
  return questions;
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
  if (_conceptCache) return _conceptCache;
  const files = readDir(CONCEPTS_DIR).filter((f) => f.endsWith(".mdx"));
  const concepts = files.map((f) => {
    const raw = fs.readFileSync(path.join(CONCEPTS_DIR, f), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: data.slug as string,
      title: data.title as string,
      subject: data.subject as Subject,
      category: data.category as string,
      order: (data.order as number) ?? 999,
      description: data.description as string | undefined,
      relatedQuestions: (data.relatedQuestions as string[]) ?? [],
      body: content,
    } satisfies Concept;
  });
  concepts.sort(
    (a, b) => a.subject - b.subject || a.order - b.order
  );
  _conceptCache = concepts;
  return concepts;
}

export function getConcept(slug: string): Concept | null {
  return getAllConcepts().find((c) => c.slug === slug) ?? null;
}

export function getConceptMeta(): ConceptMeta[] {
  return getAllConcepts().map((c) => {
    const { body: _body, ...meta } = c;
    void _body;
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

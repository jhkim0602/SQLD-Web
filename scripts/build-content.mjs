#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUESTIONS_DIR = path.join(ROOT, "content/questions");
const CONCEPTS_DIR = path.join(ROOT, "content/concepts");
const OUT_FILE = path.join(ROOT, "public/content-index.json");

function readDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

const questions = readDir(QUESTIONS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, f), "utf-8")))
  .sort((a, b) => a.id.localeCompare(b.id));

const concepts = readDir(CONCEPTS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => {
    const { data, content } = matter(
      fs.readFileSync(path.join(CONCEPTS_DIR, f), "utf-8")
    );
    return {
      slug: data.slug,
      title: data.title,
      subject: data.subject,
      category: data.category,
      order: data.order ?? 999,
      description: data.description,
      relatedQuestions: data.relatedQuestions ?? [],
      preview: content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/[#>*_`]/g, "")
        .trim()
        .slice(0, 120),
    };
  })
  .sort((a, b) => a.subject - b.subject || a.order - b.order);

const questionMeta = questions.map((q) => ({
  id: q.id,
  subject: q.subject,
  category: q.category,
  type: q.type,
  tags: q.tags ?? [],
  preview: q.question.replace(/\s+/g, " ").slice(0, 100),
}));

const index = {
  builtAt: new Date().toISOString(),
  totalQuestions: questions.length,
  totalConcepts: concepts.length,
  questions: questionMeta,
  concepts,
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2));

console.log(
  `[content] ${questions.length} questions, ${concepts.length} concepts → ${path.relative(
    ROOT,
    OUT_FILE
  )}`
);

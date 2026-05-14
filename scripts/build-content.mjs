#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkCjk from "remark-cjk-friendly";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUESTIONS_DIR = path.join(ROOT, "content/questions");
const CONCEPTS_DIR = path.join(ROOT, "content/concepts");
const OUT_INDEX = path.join(ROOT, "public/content-index.json");
const OUT_DATA = path.join(ROOT, "public/content-data.json");

function readDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjk)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeShiki, {
    theme: "github-light",
    langs: ["sql", "plsql", "typescript", "javascript", "bash", "json"],
    fallbackLanguage: "sql",
  })
  .use(rehypeStringify);

async function md2html(md) {
  if (!md || typeof md !== "string") return "";
  try {
    const result = await processor.process(md);
    return String(result);
  } catch (e) {
    console.error("[md2html] error processing markdown:", e.message);
    return `<p>${md}</p>`;
  }
}

const questionsRaw = readDir(QUESTIONS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, f), "utf-8")))
  .sort((a, b) => a.id.localeCompare(b.id));

const conceptsRaw = readDir(CONCEPTS_DIR)
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
      body: content,
    };
  })
  .sort((a, b) => a.subject - b.subject || a.order - b.order);

const questions = await Promise.all(
  questionsRaw.map(async (q) => ({
    ...q,
    questionHtml: await md2html(q.question),
    codeBlockHtml: q.codeBlock
      ? await md2html("```sql\n" + q.codeBlock + "\n```")
      : "",
    explanationHtml: await md2html(q.explanation),
  }))
);

const concepts = await Promise.all(
  conceptsRaw.map(async (c) => ({
    ...c,
    bodyHtml: await md2html(c.body),
  }))
);

const questionMeta = questions.map((q) => ({
  id: q.id,
  subject: q.subject,
  category: q.category,
  type: q.type,
  tags: q.tags ?? [],
  preview: q.question.replace(/\s+/g, " ").slice(0, 100),
}));

const conceptMeta = concepts.map((c) => ({
  slug: c.slug,
  title: c.title,
  subject: c.subject,
  category: c.category,
  order: c.order,
  description: c.description,
  relatedQuestions: c.relatedQuestions,
  preview: c.body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`]/g, "")
    .trim()
    .slice(0, 120),
}));

const index = {
  builtAt: new Date().toISOString(),
  totalQuestions: questions.length,
  totalConcepts: concepts.length,
  questions: questionMeta,
  concepts: conceptMeta,
};

const data = {
  builtAt: new Date().toISOString(),
  questions,
  concepts,
};

fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
fs.writeFileSync(OUT_INDEX, JSON.stringify(index, null, 2));
fs.writeFileSync(OUT_DATA, JSON.stringify(data));

console.log(
  `[content] ${questions.length} questions, ${concepts.length} concepts → public/content-index.json + content-data.json`
);

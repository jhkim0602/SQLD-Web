import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllArticles,
  getArticle,
  getConcept,
  getQuestion,
} from "@/lib/content";
import { MarkdownView } from "@/components/MarkdownView";
import { ARTICLE_LEVEL_LABELS } from "@/lib/types";

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "칼럼 없음" };
  return {
    title: a.title,
    description: a.description ?? undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const all = getAllArticles();
  const idx = all.findIndex((a) => a.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const relatedConcepts =
    article.relatedConcepts
      ?.map((s) => getConcept(s))
      .filter((c): c is NonNullable<typeof c> => c !== null) ?? [];

  const relatedQuestions =
    article.relatedQuestions
      ?.map((qid) => getQuestion(qid))
      .filter((q): q is NonNullable<typeof q> => q !== null) ?? [];

  return (
    <article className="article-page prose-ko">
      <Link
        href="/articles"
        className="mb-6 inline-block font-sans text-xs text-zinc-500 hover:text-zinc-700"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        ← 칼럼 목록
      </Link>

      <div
        className="mb-6 flex flex-wrap items-center gap-2 text-xs"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <LevelBadge level={article.level} />
        <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-zinc-600">
          {article.topic}
        </span>
        <span className="text-zinc-400">·</span>
        <span className="text-zinc-500">{article.readingMinutes}분 읽기</span>
      </div>

      <h1 className="article-title mb-3">{article.title}</h1>
      {article.subtitle && (
        <p className="article-subtitle mb-10">{article.subtitle}</p>
      )}

      <div className="article-body">
        <MarkdownView html={article.bodyHtml} source={article.body} />
      </div>

      {(relatedConcepts.length > 0 || relatedQuestions.length > 0) && (
        <section
          className="mt-16 grid gap-4 border-t border-zinc-200 pt-8 md:grid-cols-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {relatedConcepts.length > 0 && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                함께 보면 좋은 개념
              </h2>
              <ul className="space-y-1">
                {relatedConcepts.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/concepts/${c.slug}`}
                      className="block rounded px-2 py-1 text-sm text-zinc-800 hover:bg-white"
                    >
                      → {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {relatedQuestions.length > 0 && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                관련 문제 ({relatedQuestions.length})
              </h2>
              <ul className="space-y-1">
                {relatedQuestions.slice(0, 8).map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/practice/${q.id}`}
                      className="flex items-baseline gap-2 rounded px-2 py-1 text-sm hover:bg-white"
                    >
                      <span className="font-mono text-xs text-zinc-400">
                        {q.id}
                      </span>
                      <span className="truncate text-zinc-800">
                        {q.question.slice(0, 60)}
                        {q.question.length > 60 ? "…" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
                {relatedQuestions.length > 8 && (
                  <li className="px-2 text-xs text-zinc-500">
                    외 {relatedQuestions.length - 8}문제
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>
      )}

      <nav
        className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-6 text-sm"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {prev ? (
          <Link
            href={`/articles/${prev.slug}`}
            className="max-w-[45%] text-zinc-600 hover:text-zinc-900"
          >
            <span className="text-xs text-zinc-400">← 이전 칼럼</span>
            <span className="block truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/articles/${next.slug}`}
            className="max-w-[45%] text-right text-zinc-600 hover:text-zinc-900"
          >
            <span className="text-xs text-zinc-400">다음 칼럼 →</span>
            <span className="block truncate">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

function LevelBadge({
  level,
}: {
  level: "beginner" | "intermediate" | "advanced";
}) {
  const map = {
    beginner: "border-emerald-200 bg-emerald-50 text-emerald-700",
    intermediate: "border-blue-200 bg-blue-50 text-blue-700",
    advanced: "border-rose-200 bg-rose-50 text-rose-700",
  } as const;
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${map[level]}`}
    >
      {ARTICLE_LEVEL_LABELS[level]}
    </span>
  );
}

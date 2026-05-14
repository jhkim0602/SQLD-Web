import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllConcepts, getConcept, getQuestion } from "@/lib/content";
import { MarkdownView } from "@/components/MarkdownView";
import { SUBJECT_LABELS } from "@/lib/types";

export async function generateStaticParams() {
  return getAllConcepts().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getConcept(slug);
  if (!c) return { title: "개념 없음" };
  return {
    title: c.title,
    description: c.description ?? undefined,
  };
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();

  const all = getAllConcepts();
  const idx = all.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const related = concept.relatedQuestions
    .map((qid) => getQuestion(qid))
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return (
    <article className="prose-ko">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-zinc-600">
          {SUBJECT_LABELS[concept.subject]}
        </span>
        <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-zinc-600">
          {concept.category}
        </span>
      </div>

      <h1 className="mb-2 text-[2rem] font-bold tracking-tight text-zinc-900">
        {concept.title}
      </h1>
      {concept.description && (
        <p className="mb-6 text-zinc-600">{concept.description}</p>
      )}

      <MarkdownView source={concept.body} />

      {related.length > 0 && (
        <section className="mt-12 rounded-md border border-zinc-200 bg-zinc-50/50 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            관련 문제 ({related.length})
          </h2>
          <ul className="space-y-2">
            {related.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/practice/${q.id}`}
                  className="flex items-baseline gap-3 rounded-md border border-zinc-200 bg-white p-3 hover:border-zinc-400"
                >
                  <span className="font-mono text-xs text-zinc-400">
                    {q.id}
                  </span>
                  <span className="text-sm text-zinc-800">
                    {q.question.slice(0, 80)}
                    {q.question.length > 80 ? "…" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6 text-sm">
        {prev ? (
          <Link
            href={`/concepts/${prev.slug}`}
            className="text-zinc-600 hover:text-zinc-900"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/concepts/${next.slug}`}
            className="text-zinc-600 hover:text-zinc-900"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

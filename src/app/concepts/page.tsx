import Link from "next/link";
import type { Metadata } from "next";
import { groupConceptsByCategory } from "@/lib/content";
import { SUBJECT_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "개념 정리",
  description: "SQLD 시험 범위의 핵심 개념을 카테고리별로 정리했습니다.",
};

export default function ConceptsPage() {
  const grouped = groupConceptsByCategory();

  return (
    <div className="prose-ko">
      <header className="mb-8">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900">
          개념 정리
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          시험 범위의 핵심 개념을 카테고리별로 정리했습니다. 문제와 양방향
          링크되어 있습니다.
        </p>
      </header>

      {([1, 2] as const).map((subject) => {
        const categories = grouped[subject];
        const sortedCategories = Object.keys(categories).sort();
        if (sortedCategories.length === 0) return null;
        return (
          <section key={subject} className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-zinc-900">
              {subject}과목 · {SUBJECT_LABELS[subject]}
            </h2>
            <div className="space-y-5">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    {category}
                  </h3>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {categories[category].map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/concepts/${c.slug}`}
                          className="block rounded-md border border-zinc-200 bg-white p-3 transition hover:border-zinc-400 hover:bg-zinc-50"
                        >
                          <div className="font-medium text-zinc-900">
                            {c.title}
                          </div>
                          {c.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">
                              {c.description}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

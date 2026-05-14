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
          <section key={subject} className="mb-12">
            <div className="mb-3 flex items-baseline gap-3 border-b border-zinc-200 pb-2">
              <span className="font-mono text-xs text-zinc-400">
                {subject.toString().padStart(2, "0")}
              </span>
              <h2 className="text-base font-semibold text-zinc-900">
                {subject}과목 · {SUBJECT_LABELS[subject]}
              </h2>
            </div>

            <ol className="divide-y divide-zinc-100">
              {sortedCategories.flatMap((category) =>
                categories[category].map((c, idxInCat, arr) => ({
                  c,
                  category,
                  isFirstInCategory: idxInCat === 0,
                  catCount: arr.length,
                }))
              ).map(({ c, category, isFirstInCategory }, idx) => (
                <li key={c.slug} className="group">
                  <Link
                    href={`/concepts/${c.slug}`}
                    className="flex items-baseline gap-4 py-2.5 transition hover:bg-zinc-50"
                  >
                    <span className="w-10 shrink-0 text-right font-mono text-xs text-zinc-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="w-24 shrink-0 text-xs text-zinc-500">
                      {isFirstInCategory ? category : ""}
                    </span>
                    <span className="flex-1 truncate text-[15px] text-zinc-900 group-hover:underline">
                      {c.title}
                    </span>
                    {c.description && (
                      <span className="hidden truncate text-xs text-zinc-500 md:block md:max-w-[40%]">
                        {c.description}
                      </span>
                    )}
                    <span className="text-xs text-zinc-300 group-hover:text-zinc-500">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { SUBJECT_LABELS, TYPE_LABELS, type Subject } from "@/lib/types";
import { PracticeFilters } from "@/components/PracticeFilters";
import { QuestionCard } from "@/components/QuestionCard";

export const metadata: Metadata = {
  title: "기출 풀이",
};

type SearchParams = {
  subject?: string;
  category?: string;
  type?: string;
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const all = getAllQuestions();

  const filtered = all.filter((q) => {
    if (params.subject && String(q.subject) !== params.subject) return false;
    if (params.category && q.category !== params.category) return false;
    if (params.type && q.type !== params.type) return false;
    return true;
  });

  const availableCategories = Array.from(
    new Set(
      all
        .filter((q) =>
          params.subject ? String(q.subject) === params.subject : true
        )
        .map((q) => q.category)
    )
  ).sort();

  return (
    <div className="prose-ko">
      <header className="mb-6">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900">
          기출 풀이
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          전체 {all.length}문제 · 현재 {filtered.length}문제
        </p>
      </header>

      <PracticeFilters
        currentSubject={params.subject ?? ""}
        currentCategory={params.category ?? ""}
        currentType={params.type ?? ""}
        availableCategories={availableCategories}
      />

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-md border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
          조건에 맞는 문제가 없습니다.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {filtered.map((q, idx) => (
            <li key={q.id}>
              <Link href={`/practice/${q.id}`}>
                <QuestionCard
                  question={q}
                  index={idx + 1}
                  subjectLabel={SUBJECT_LABELS[q.subject as Subject]}
                  typeLabel={TYPE_LABELS[q.type]}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

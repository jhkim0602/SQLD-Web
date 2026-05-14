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

      <section className="mb-6 grid gap-2 md:grid-cols-4">
        <Link
          href="/practice/random"
          className="rounded-lg border border-zinc-200 bg-white p-3 text-center transition hover:border-zinc-900 hover:bg-zinc-50"
        >
          <div className="text-2xl">🎲</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900">전체 랜덤</div>
          <div className="text-[11px] text-zinc-500">어떤 문제든 무작위</div>
        </Link>
        <Link
          href="/practice/random?mode=untried"
          className="rounded-lg border border-zinc-200 bg-white p-3 text-center transition hover:border-blue-300 hover:bg-blue-50/50"
        >
          <div className="text-2xl">📘</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900">미풀이 랜덤</div>
          <div className="text-[11px] text-zinc-500">아직 안 푼 문제</div>
        </Link>
        <Link
          href="/practice/random?mode=wrong"
          className="rounded-lg border border-zinc-200 bg-white p-3 text-center transition hover:border-rose-300 hover:bg-rose-50/50"
        >
          <div className="text-2xl">🔁</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900">오답 랜덤</div>
          <div className="text-[11px] text-zinc-500">틀린 문제 다시</div>
        </Link>
        <Link
          href="/practice/random?mode=bookmarked"
          className="rounded-lg border border-zinc-200 bg-white p-3 text-center transition hover:border-amber-300 hover:bg-amber-50/50"
        >
          <div className="text-2xl">★</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900">즐겨찾기 랜덤</div>
          <div className="text-[11px] text-zinc-500">별표 친 문제</div>
        </Link>
      </section>

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

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { MarkdownView } from "./MarkdownView";
import { SUBJECT_LABELS } from "@/lib/types";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import type { Question } from "@/lib/types";

type Props = {
  allQuestions: Question[];
};

export function ExamResult({ allQuestions }: Props) {
  const hydrated = useHydrated();
  const examHistory = useProgress((s) => s.examHistory);
  const [filter, setFilter] = useState<"all" | "wrong" | "correct">("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const questionMap = useMemo(
    () => new Map(allQuestions.map((q) => [q.id, q])),
    [allQuestions]
  );

  if (!hydrated) {
    return (
      <div className="prose-ko">
        <p>결과를 불러오는 중...</p>
      </div>
    );
  }

  const last = examHistory[0];

  if (!last) {
    return (
      <div className="prose-ko">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          시험 결과
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          아직 완료한 모의고사가 없습니다.
        </p>
        <Link
          href="/exam"
          className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          시험 시작하기 →
        </Link>
      </div>
    );
  }

  const evaluated = last.qids.map((qid, i) => {
    const q = questionMap.get(qid);
    const ans = last.answers[qid] ?? null;
    const isC = !!(q && ans !== null && ans === q.answer);
    return { qid, q, ans, isC, index: i };
  });

  const correct = evaluated.filter((e) => e.isC).length;
  const wrong = evaluated.filter((e) => e.q && !e.isC).length;
  const skipped = evaluated.filter(
    (e) => e.ans === null || e.ans === undefined
  ).length;
  const elapsedSec = last.finishedAt
    ? Math.round((last.finishedAt - last.startedAt) / 1000)
    : last.durationSec;

  const byCategory: Record<string, { total: number; correct: number }> = {};
  for (const e of evaluated) {
    if (!e.q) continue;
    const cat = `${e.q.subject}-${e.q.category}`;
    byCategory[cat] ??= { total: 0, correct: 0 };
    byCategory[cat].total++;
    if (e.isC) byCategory[cat].correct++;
  }
  const weakCategories = Object.entries(byCategory)
    .map(([k, v]) => ({
      cat: k,
      total: v.total,
      correct: v.correct,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const filtered = evaluated.filter((e) => {
    if (filter === "wrong") return e.q && !e.isC;
    if (filter === "correct") return e.isC;
    return true;
  });

  const passed = (last.score ?? 0) >= 60;

  return (
    <div className="prose-ko">
      <header className="mb-6">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          시험 결과
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {formatDate(last.startedAt)} · 응시 시간 {formatDuration(elapsedSec)}
        </p>
      </header>

      <div
        className={cn(
          "rounded-md border p-6",
          passed
            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50"
            : "border-rose-200 dark:border-rose-800 bg-rose-50/50"
        )}
      >
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              점수
            </div>
            <div
              className={cn(
                "mt-1 font-mono text-5xl font-bold",
                passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
              )}
            >
              {last.score ?? "—"}
              <span className="text-2xl text-zinc-400 dark:text-zinc-500">/100</span>
            </div>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <div>정답 {correct}</div>
            <div>오답 {wrong}</div>
            <div>미답 {skipped}</div>
          </div>
        </div>
        <div className="mt-3 text-sm">
          {passed ? (
            <span className="text-emerald-700 dark:text-emerald-300">
              ✓ 합격 기준(60점) 통과. 좋은 흐름입니다.
            </span>
          ) : (
            <span className="text-rose-700 dark:text-rose-300">
              ✗ 합격 기준(60점) 미달. 약점 카테고리 위주로 복습하세요.
            </span>
          )}
        </div>
      </div>

      {weakCategories.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">카테고리별 정답률</h2>
          <ul className="mt-3 space-y-2">
            {weakCategories.slice(0, 6).map((c) => {
              const [subj, cat] = c.cat.split("-");
              return (
                <li
                  key={c.cat}
                  className="flex items-center gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {SUBJECT_LABELS[Number(subj) as 1 | 2]} · {cat}
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          c.accuracy >= 70
                            ? "bg-emerald-500"
                            : c.accuracy >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        )}
                        style={{ width: `${c.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right font-mono text-sm">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.accuracy}%
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.correct}/{c.total}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">문제별 리뷰</h2>
          <div className="flex gap-1">
            {(["all", "wrong", "correct"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md border px-3 py-1 text-xs",
                  filter === f
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                {f === "all" ? "전체" : f === "wrong" ? "오답만" : "정답만"}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-3 space-y-2">
          {filtered.map((e) => {
            if (!e.q) return null;
            const open = openIdx === e.index;
            return (
              <li
                key={e.qid}
                className={cn(
                  "rounded-md border bg-white dark:bg-zinc-900",
                  e.isC ? "border-emerald-200 dark:border-emerald-800" : "border-rose-200 dark:border-rose-800"
                )}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : e.index)}
                  className="flex w-full items-start gap-3 p-3 text-left"
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded text-xs font-bold",
                      e.isC
                        ? "bg-emerald-100 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:text-rose-300"
                    )}
                  >
                    {e.isC ? "✓" : "✗"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {e.index + 1}. {e.q.category}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-sm text-zinc-800 dark:text-zinc-200">
                      {e.q.question}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {open ? "△" : "▽"}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-3 text-sm">
                    <Link
                      href={`/practice/${e.q.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                    >
                      문제 페이지에서 보기 →
                    </Link>
                    <div className="mt-3">
                      <MarkdownView
                        html={e.q.explanationHtml}
                        source={e.q.explanation}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-10 flex gap-2">
        <Link
          href="/exam"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          다시 응시
        </Link>
        <Link
          href="/notes"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300"
        >
          오답노트 가기
        </Link>
      </div>
    </div>
  );
}

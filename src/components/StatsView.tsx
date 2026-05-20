"use client";

import Link from "next/link";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { SUBJECT_LABELS } from "@/lib/types";
import { pct, formatDate } from "@/lib/utils";
import type { Question } from "@/lib/types";

type Props = {
  allQuestions: Question[];
};

export function StatsView({ allQuestions }: Props) {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const examHistory = useProgress((s) => s.examHistory);

  if (!hydrated) {
    return (
      <div className="prose-ko">
        <p>불러오는 중...</p>
      </div>
    );
  }

  const solvedQ = Object.keys(attempts).length;
  const correctQ = Object.values(attempts).filter(
    (a) => a.wasCorrect === true
  ).length;

  const byCategory: Record<
    string,
    {
      subject: 1 | 2;
      total: number;
      solved: number;
      correct: number;
      frequency: "high" | "medium" | "low";
      frequencyNote: string;
    }
  > = {};
  for (const q of allQuestions) {
    const key = `${q.subject}-${q.category}`;
    byCategory[key] ??= {
      subject: q.subject,
      total: 0,
      solved: 0,
      correct: 0,
      frequency: q.frequency ?? "medium",
      frequencyNote: q.frequencyNote ?? "",
    };
    byCategory[key].total++;
    const a = attempts[q.id];
    if (a) {
      byCategory[key].solved++;
      if (a.wasCorrect === true) byCategory[key].correct++;
    }
  }
  const categoryStats = Object.entries(byCategory)
    .filter(([, v]) => v.solved > 0)
    .map(([key, v]) => ({
      key,
      category: key.split("-").slice(1).join("-"),
      subject: v.subject,
      total: v.total,
      solved: v.solved,
      correct: v.correct,
      frequency: v.frequency,
      frequencyNote: v.frequencyNote,
      accuracy: pct(v.correct, v.solved),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const allCategories = Object.entries(byCategory)
    .map(([key, v]) => ({
      key,
      category: key.split("-").slice(1).join("-"),
      subject: v.subject,
      total: v.total,
      frequency: v.frequency,
      frequencyNote: v.frequencyNote,
    }))
    .sort((a, b) => {
      if (a.subject !== b.subject) return a.subject - b.subject;
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.frequency] - order[b.frequency];
    });

  return (
    <div className="prose-ko">
      <header className="mb-8">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          학습 통계
        </h1>
      </header>

      {solvedQ === 0 ? (
        <div className="rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          문제를 풀면 여기에 통계가 표시됩니다.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm">
            <Stat label="풀어본 문제" value={`${solvedQ}`} />
            <Stat label="정답률" value={`${pct(correctQ, solvedQ)}%`} hint={`${correctQ}/${solvedQ}`} />
          </div>

          {categoryStats.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                카테고리별 정답률
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">약한 카테고리부터</p>
              <ul className="mt-3 space-y-1.5">
                {categoryStats.map((c) => (
                  <li
                    key={c.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-100 dark:border-zinc-800 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {c.subject}과목
                      </span>{" "}
                      · {c.category}
                      {c.frequency === "high" && (
                        <span
                          className="ml-2 rounded border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400"
                          title={c.frequencyNote}
                        >
                          🔥 빈출
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-sm">
                      <span
                        className={
                          c.accuracy >= 70
                            ? "text-emerald-600"
                            : c.accuracy >= 40
                              ? "text-amber-600"
                              : "text-rose-600"
                        }
                      >
                        {c.accuracy}%
                      </span>
                      <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                        {c.correct}/{c.solved}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section className="mt-10 border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          출제 빈도 가이드
        </h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          최근 5년 SQLD 출제 패턴 기준. 빈출 카테고리부터 학습하세요.
        </p>
        {[1, 2].map((subj) => (
          <div key={subj} className="mb-5">
            <h3 className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {SUBJECT_LABELS[subj as 1 | 2]}
            </h3>
            <ul className="space-y-1">
              {allCategories
                .filter((c) => c.subject === subj)
                .map((c) => (
                  <li
                    key={c.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-100 dark:border-zinc-800 px-3 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FreqBadge frequency={c.frequency} />
                      <span className="text-zinc-700 dark:text-zinc-300">{c.category}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        총 {c.total}문제
                      </span>
                    </span>
                    <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
                      {c.frequencyNote}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      {examHistory.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            모의고사 이력
          </h2>
          <ul className="mt-3 space-y-1.5">
            {examHistory.slice(0, 10).map((session) => (
              <li
                key={session.sessionId}
                className="flex items-center justify-between rounded-md border border-zinc-100 dark:border-zinc-800 px-3 py-2 text-sm"
              >
                <span className="text-zinc-600 dark:text-zinc-400">
                  {formatDate(session.startedAt)}
                  <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {session.qids.length}문제
                  </span>
                </span>
                <span
                  className={`font-mono text-base font-semibold ${
                    session.score !== null && session.score >= 60
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {session.score ?? "—"}점
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/practice"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          이어서 풀기
        </Link>
        {SUBJECT_LABELS &&
          Object.values(attempts).some((a) => a.wasCorrect === false) && (
            <Link
              href="/notes"
              className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              오답노트
            </Link>
          )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <span className="text-zinc-700 dark:text-zinc-300">
      {label}:{" "}
      <strong className="font-mono text-zinc-900 dark:text-zinc-50">{value}</strong>
      {hint && (
        <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-500">({hint})</span>
      )}
    </span>
  );
}

function FreqBadge({
  frequency,
}: {
  frequency: "high" | "medium" | "low";
}) {
  const map = {
    high: { cls: "bg-rose-50 text-rose-700 border-rose-200", icon: "🔥", label: "빈출" },
    medium: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: "📌", label: "보통" },
    low: { cls: "bg-zinc-50 text-zinc-500 border-zinc-200", icon: "·", label: "드묾" },
  } as const;
  const { cls, icon, label } = map[frequency];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

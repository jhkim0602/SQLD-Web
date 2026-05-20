"use client";

import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  question: Question;
  index: number;
  subjectLabel: string;
  typeLabel: string;
};

export function QuestionCard({
  question,
  index,
  subjectLabel,
  typeLabel,
}: Props) {
  const hydrated = useHydrated();
  const attempt = useProgress((s) => s.attempts[question.id]);
  const status: "untried" | "correct" | "wrong" = !hydrated
    ? "untried"
    : attempt?.wasCorrect === true
      ? "correct"
      : attempt?.wasCorrect === false
        ? "wrong"
        : "untried";

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-md border bg-white dark:bg-zinc-900 p-4 transition hover:border-zinc-400 dark:hover:border-zinc-600",
        status === "correct" && "border-emerald-200 dark:border-emerald-800",
        status === "wrong" && "border-rose-200 dark:border-rose-800",
        status === "untried" && "border-zinc-200 dark:border-zinc-800"
      )}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{subjectLabel}</span>
          <span>·</span>
          <span>{question.category}</span>
          <span>·</span>
          <span>{typeLabel}</span>
          {question.frequency === "high" && (
            <span
              className="rounded border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400"
              title={question.frequencyNote ?? "출제 빈도 높음"}
            >
              🔥 빈출
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[15px] text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-800">
          {question.question}
        </p>
      </div>
      {hydrated && (
        <div className="flex shrink-0 items-center gap-1">
          {status === "correct" && (
            <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
              ✓
            </span>
          )}
          {status === "wrong" && (
            <span className="rounded bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs text-rose-700 dark:text-rose-300">
              ✗
            </span>
          )}
          {attempt?.bookmarked && (
            <span className="text-amber-500 dark:text-amber-400">★</span>
          )}
        </div>
      )}
    </div>
  );
}

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
        "group flex items-start gap-4 rounded-md border bg-white p-4 transition hover:border-zinc-400",
        status === "correct" && "border-emerald-200",
        status === "wrong" && "border-rose-200",
        status === "untried" && "border-zinc-200"
      )}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-zinc-50 font-mono text-xs text-zinc-500">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <span>{subjectLabel}</span>
          <span>·</span>
          <span>{question.category}</span>
          <span>·</span>
          <span>{typeLabel}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[15px] text-zinc-900 group-hover:text-zinc-800">
          {question.question}
        </p>
      </div>
      {hydrated && (
        <div className="flex shrink-0 items-center gap-1">
          {status === "correct" && (
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              ✓
            </span>
          )}
          {status === "wrong" && (
            <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700">
              ✗
            </span>
          )}
          {attempt?.bookmarked && (
            <span className="text-amber-500">★</span>
          )}
        </div>
      )}
    </div>
  );
}

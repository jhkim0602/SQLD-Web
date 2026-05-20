"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { MarkdownView } from "./MarkdownView";
import { shuffle, cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

type Props = {
  questions: Question[];
};

export function OxQuiz({ questions }: Props) {
  const hydrated = useHydrated();
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const [reshuffleToken, setReshuffleToken] = useState(0);
  const order = useMemo(
    () => shuffle(questions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, reshuffleToken]
  );
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (revealed) {
        if (e.key === "Enter" || e.key === " ") next();
        return;
      }
      if (e.key.toLowerCase() === "o") submit(true);
      if (e.key.toLowerCase() === "x") submit(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, idx, order]);

  if (order.length === 0) {
    return (
      <div className="prose-ko">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          OX 빠른 복습
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">아직 OX 문제가 없습니다.</p>
      </div>
    );
  }

  if (idx >= order.length) {
    const total = stats.correct + stats.wrong;
    return (
      <div className="prose-ko text-center">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          완료!
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {total}문제 중 {stats.correct}문제 맞춤
        </p>
        <button
          onClick={() => {
            setReshuffleToken((t) => t + 1);
            setIdx(0);
            setAnswer(null);
            setRevealed(false);
            setStats({ correct: 0, wrong: 0 });
          }}
          className="mt-6 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          다시 시작
        </button>
      </div>
    );
  }

  const current = order[idx];
  const isCorrect = answer === current.answer;

  function submit(v: boolean) {
    if (revealed) return;
    setAnswer(v);
    setRevealed(true);
    const correct = v === current.answer;
    if (hydrated) recordAttempt(current.id, v, correct);
    setStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
  }

  function next() {
    setRevealed(false);
    setAnswer(null);
    setIdx((i) => i + 1);
  }

  return (
    <div className="prose-ko">
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <div>
          {idx + 1} / {order.length}
        </div>
        <div className="flex gap-3 font-mono">
          <span className="text-emerald-600 dark:text-emerald-400">✓ {stats.correct}</span>
          <span className="text-rose-600 dark:text-rose-400">✗ {stats.wrong}</span>
        </div>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-zinc-900 transition-all"
          style={{ width: `${(idx / order.length) * 100}%` }}
        />
      </div>

      <div className="mt-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {current.subject}과목 · {current.category}
        </div>
        <h2 className="mt-3 text-lg font-bold leading-relaxed text-zinc-900 dark:text-zinc-50">
          {current.question}
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[true, false].map((v) => {
          const isThisCorrect = revealed && v === current.answer;
          const isThisWrong = revealed && v === answer && v !== current.answer;
          return (
            <button
              key={String(v)}
              onClick={() => submit(v)}
              disabled={revealed}
              className={cn(
                "rounded-md border px-4 py-8 text-2xl font-bold transition",
                !revealed && "hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                isThisCorrect &&
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
                isThisWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
                !revealed && "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
              )}
            >
              {v ? "O" : "X"}
              <div className="mt-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                <kbd>{v ? "O" : "X"}</kbd>
              </div>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5">
          <div
            className={cn(
              "mb-3 text-sm font-semibold",
              isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
            )}
          >
            {isCorrect ? "✓ 정답" : "✗ 오답"} — 정답은{" "}
            {current.answer ? "O" : "X"}
          </div>
          <MarkdownView
            html={current.explanationHtml}
            source={current.explanation}
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={next}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              다음 <kbd className="ml-1 !bg-zinc-700 !text-white">↵</kbd>
            </button>
            <Link
              href={`/practice/${current.id}`}
              className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              상세 풀이
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

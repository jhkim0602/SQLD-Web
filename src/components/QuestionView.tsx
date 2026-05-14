"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { SUBJECT_LABELS, TYPE_LABELS } from "@/lib/types";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { MarkdownView } from "./MarkdownView";
import { cn } from "@/lib/utils";

type Props = {
  question: Question;
  prevId?: string | null;
  nextId?: string | null;
};

type Selected = number | boolean | null;

export function QuestionView({ question, prevId, nextId }: Props) {
  const hydrated = useHydrated();
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const setMemo = useProgress((s) => s.setWrongNoteMemo);
  const attempt = useProgress((s) => s.attempts[question.id]);

  const [selected, setSelected] = useState<Selected>(null);
  const [submitted, setSubmitted] = useState(false);
  const [memo, setMemoLocal] = useState(attempt?.wrongNoteMemo ?? "");

  const isCorrect = selected !== null && selected === question.answer;

  function submit() {
    if (selected === null) return;
    setSubmitted(true);
    recordAttempt(question.id, selected, isCorrect);
  }

  function reset() {
    setSelected(null);
    setSubmitted(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (!submitted && question.type === "mc" && question.choices) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= question.choices.length) {
          setSelected(num - 1);
          return;
        }
      }
      if (!submitted && question.type === "ox") {
        if (e.key.toLowerCase() === "o") setSelected(true);
        if (e.key.toLowerCase() === "x") setSelected(false);
      }
      if (e.key === "Enter" && !submitted && selected !== null) {
        submit();
      }
      if (e.key === "j" && nextId)
        window.location.href = `/practice/${nextId}`;
      if (e.key === "k" && prevId)
        window.location.href = `/practice/${prevId}`;
      if (e.key === "b" && hydrated) toggleBookmark(question.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, selected, question.id, nextId, prevId, hydrated]);

  return (
    <article className="prose-ko">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <Tag>{SUBJECT_LABELS[question.subject]}</Tag>
        <Tag>{question.category}</Tag>
        <Tag>{TYPE_LABELS[question.type]}</Tag>
        <span className="ml-auto font-mono text-zinc-400">{question.id}</span>
      </div>

      <header className="mb-6 flex items-start justify-between gap-3">
        <h1 className="text-[1.4rem] font-bold leading-snug text-zinc-900">
          문제
        </h1>
        {hydrated && (
          <button
            onClick={() => toggleBookmark(question.id)}
            className={cn(
              "shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium transition",
              attempt?.bookmarked
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            )}
            aria-label="즐겨찾기 토글"
            title="단축키 B"
          >
            {attempt?.bookmarked ? "★ 즐겨찾기" : "☆ 즐겨찾기"}
          </button>
        )}
      </header>

      <div className="mb-6">
        <MarkdownView source={question.question} />
        {question.codeBlock && (
          <pre className="mt-3">
            <code>{question.codeBlock}</code>
          </pre>
        )}
      </div>

      {question.type === "mc" && question.choices && (
        <ol className="my-4 space-y-2">
          {question.choices.map((choice, i) => {
            const isThisCorrect = submitted && i === question.answer;
            const isThisSelectedWrong =
              submitted && selected === i && i !== question.answer;
            return (
              <li key={i}>
                <button
                  onClick={() => !submitted && setSelected(i)}
                  disabled={submitted}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-[15px] transition",
                    submitted
                      ? "cursor-default"
                      : "hover:border-zinc-400 hover:bg-zinc-50",
                    selected === i && !submitted
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 bg-white",
                    isThisCorrect && "!border-emerald-500 !bg-emerald-50",
                    isThisSelectedWrong && "!border-rose-500 !bg-rose-50"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                      isThisCorrect
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isThisSelectedWrong
                          ? "border-rose-500 bg-rose-500 text-white"
                          : selected === i
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-zinc-300 text-zinc-500"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{choice}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {question.type === "ox" && (
        <div className="my-4 grid grid-cols-2 gap-3">
          {[true, false].map((v) => {
            const label = v ? "O (참)" : "X (거짓)";
            const isThisCorrect = submitted && v === question.answer;
            const isThisSelectedWrong =
              submitted && selected === v && v !== question.answer;
            return (
              <button
                key={String(v)}
                onClick={() => !submitted && setSelected(v)}
                disabled={submitted}
                className={cn(
                  "rounded-md border px-4 py-6 text-lg font-bold transition",
                  submitted
                    ? "cursor-default"
                    : "hover:border-zinc-400 hover:bg-zinc-50",
                  selected === v && !submitted
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-zinc-200 bg-white text-zinc-700",
                  isThisCorrect &&
                    "!border-emerald-500 !bg-emerald-50 !text-emerald-700",
                  isThisSelectedWrong &&
                    "!border-rose-500 !bg-rose-50 !text-rose-700"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2">
        {!submitted ? (
          <button
            onClick={submit}
            disabled={selected === null}
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            제출 <kbd className="ml-1 !bg-zinc-700 !text-white">↵</kbd>
          </button>
        ) : (
          <>
            <button
              onClick={reset}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              다시 풀기
            </button>
            <div
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold",
                isCorrect
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {isCorrect ? "✓ 정답" : "✗ 오답"}
            </div>
          </>
        )}
      </div>

      {submitted && (
        <section className="mt-8 rounded-md border border-zinc-200 bg-zinc-50/50 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            해설
          </h2>
          <MarkdownView source={question.explanation} />

          {question.concepts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
              <span className="text-xs text-zinc-500">관련 개념:</span>
              {question.concepts.map((c) => (
                <Link
                  key={c}
                  href={`/concepts/${c}`}
                  className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-xs text-blue-600 hover:border-blue-300"
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {submitted && !isCorrect && hydrated && (
        <section className="mt-4">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            오답 메모 (자동 저장)
          </label>
          <textarea
            value={memo}
            onChange={(e) => {
              setMemoLocal(e.target.value);
              setMemo(question.id, e.target.value);
            }}
            placeholder="왜 틀렸는지 적어두면 나중에 보기 좋습니다."
            rows={3}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </section>
      )}

      <nav className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6 text-sm">
        {prevId ? (
          <Link
            href={`/practice/${prevId}`}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            <kbd>K</kbd> 이전
          </Link>
        ) : (
          <span />
        )}
        {nextId ? (
          <Link
            href={`/practice/${nextId}`}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            다음 <kbd>J</kbd>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-zinc-600">
      {children}
    </span>
  );
}

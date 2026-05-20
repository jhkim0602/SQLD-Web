"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Question } from "@/lib/types";
import { SUBJECT_LABELS, TYPE_LABELS, FREQUENCY_LABELS } from "@/lib/types";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { MarkdownView } from "./MarkdownView";
import { cn } from "@/lib/utils";

type Props = {
  question: Question;
  prevId?: string | null;
  nextId?: string | null;
  index?: number | null;
  total?: number | null;
};

type Selected = number | boolean | null;

export function QuestionView({
  question,
  prevId,
  nextId,
  index,
  total,
}: Props) {
  const searchParams = useSearchParams();
  const randomMode = searchParams.get("from") === "random";
  const randomModeKind = searchParams.get("mode");
  const hydrated = useHydrated();
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const setMemo = useProgress((s) => s.setWrongNoteMemo);
  const attempt = useProgress((s) => s.attempts[question.id]);

  const [selected, setSelected] = useState<Selected>(null);
  const [submitted, setSubmitted] = useState(false);
  const [memo, setMemoLocal] = useState(attempt?.wrongNoteMemo ?? "");
  const explanationRef = useRef<HTMLElement | null>(null);

  const isCorrect = selected !== null && selected === question.answer;

  function submit(forced?: Selected) {
    const value = forced ?? selected;
    if (value === null) return;
    setSelected(value);
    setSubmitted(true);
    recordAttempt(question.id, value, value === question.answer);
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function pickChoice(value: number | boolean) {
    if (submitted) return;
    submit(value);
  }

  function goNext() {
    if (randomMode) {
      const params = new URLSearchParams();
      params.set("exclude", question.id);
      if (randomModeKind) params.set("mode", randomModeKind);
      window.location.href = `/practice/random?${params.toString()}`;
      return;
    }
    if (nextId) {
      window.location.href = `/practice/${nextId}`;
    }
  }

  function goPrev() {
    if (prevId) {
      window.location.href = `/practice/${prevId}`;
    }
  }

  function goRandom() {
    window.location.href = `/practice/random?exclude=${question.id}`;
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
          pickChoice(num - 1);
          return;
        }
      }
      if (!submitted && question.type === "ox") {
        if (e.key.toLowerCase() === "o") pickChoice(true);
        if (e.key.toLowerCase() === "x") pickChoice(false);
      }
      if (e.key === "Enter") {
        if (submitted && nextId) goNext();
      }
      if (e.key === "j" || e.key === "ArrowRight") {
        if (nextId) goNext();
      }
      if (e.key === "k" || e.key === "ArrowLeft") {
        if (prevId) goPrev();
      }
      if (e.key === "b" && hydrated) toggleBookmark(question.id);
      if (e.key === "r") goRandom();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, question.id, nextId, prevId, hydrated, randomMode]);

  const progressPercent =
    typeof index === "number" && typeof total === "number" && total > 0
      ? (index / total) * 100
      : null;

  return (
    <article className="prose-ko pb-32">
      {progressPercent !== null && (
        <div className="fixed left-0 right-0 top-16 z-20 h-1 bg-zinc-100">
          <div
            className="h-full bg-zinc-900 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="mb-3 mt-2 flex flex-wrap items-center gap-2 text-xs">
        {randomMode ? (
          <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 font-mono font-semibold text-purple-700">
            🎲 랜덤{randomModeKind ? ` · ${randomModeKindLabel(randomModeKind)}` : ""}
          </span>
        ) : (
          typeof index === "number" && typeof total === "number" && (
            <span className="font-mono font-semibold text-zinc-900">
              {index} <span className="text-zinc-300">/</span>{" "}
              <span className="text-zinc-400">{total}</span>
            </span>
          )
        )}
        <Tag>{SUBJECT_LABELS[question.subject]}</Tag>
        <Tag>{question.category}</Tag>
        <Tag>{TYPE_LABELS[question.type]}</Tag>
        {question.frequency && (
          <FrequencyTag
            frequency={question.frequency}
            note={question.frequencyNote}
          />
        )}

        {hydrated && (
          <button
            onClick={() => toggleBookmark(question.id)}
            className={cn(
              "ml-auto rounded-md border px-2.5 py-1 text-xs font-medium transition",
              attempt?.bookmarked
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-700"
            )}
            title="단축키 B"
          >
            {attempt?.bookmarked ? "★" : "☆"} 즐겨찾기
          </button>
        )}
      </div>

      <div className="mb-7 mt-3">
        <div className="text-[18px] font-medium leading-[1.7] text-zinc-900 md:text-[19px]">
          <MarkdownView
            html={question.questionHtml}
            source={question.question}
          />
        </div>
        {question.codeBlockHtml ? (
          <div className="mt-4">
            <MarkdownView html={question.codeBlockHtml} />
          </div>
        ) : (
          question.codeBlock && (
            <pre className="mt-4 text-[14px]">
              <code>{question.codeBlock}</code>
            </pre>
          )
        )}
      </div>

      {question.type === "mc" && question.choices && (
        <ol className="space-y-2.5">
          {question.choices.map((choice, i) => {
            const isThisCorrect = submitted && i === question.answer;
            const isThisSelectedWrong =
              submitted && selected === i && i !== question.answer;
            return (
              <li key={i}>
                <button
                  onClick={() => pickChoice(i)}
                  disabled={submitted}
                  className={cn(
                    "flex w-full items-start gap-3.5 rounded-lg border px-4 py-4 text-left text-[16px] leading-relaxed transition active:scale-[0.99]",
                    submitted
                      ? "cursor-default"
                      : "hover:border-zinc-400 hover:bg-zinc-50",
                    !submitted && "border-zinc-200 bg-white",
                    isThisCorrect && "!border-emerald-500 !bg-emerald-50",
                    isThisSelectedWrong && "!border-rose-500 !bg-rose-50",
                    submitted &&
                      !isThisCorrect &&
                      !isThisSelectedWrong &&
                      "opacity-60"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold",
                      isThisCorrect
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isThisSelectedWrong
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-zinc-300 bg-white text-zinc-500"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{choice}</span>
                  {isThisCorrect && (
                    <span className="pt-0.5 text-emerald-600">✓</span>
                  )}
                  {isThisSelectedWrong && (
                    <span className="pt-0.5 text-rose-600">✗</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {question.type === "ox" && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => {
            const isThisCorrect = submitted && v === question.answer;
            const isThisSelectedWrong =
              submitted && selected === v && v !== question.answer;
            return (
              <button
                key={String(v)}
                onClick={() => pickChoice(v)}
                disabled={submitted}
                className={cn(
                  "rounded-lg border py-10 text-3xl font-bold transition active:scale-[0.98]",
                  submitted
                    ? "cursor-default"
                    : "hover:border-zinc-400 hover:bg-zinc-50",
                  !submitted && "border-zinc-200 bg-white text-zinc-700",
                  isThisCorrect &&
                    "!border-emerald-500 !bg-emerald-50 !text-emerald-700",
                  isThisSelectedWrong &&
                    "!border-rose-500 !bg-rose-50 !text-rose-700",
                  submitted &&
                    !isThisCorrect &&
                    !isThisSelectedWrong &&
                    "opacity-50"
                )}
              >
                {v ? "O" : "X"}
                <div className="mt-1 text-xs font-normal text-zinc-500">
                  {v ? "참" : "거짓"} <kbd>{v ? "O" : "X"}</kbd>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <section
          ref={(el) => {
            explanationRef.current = el;
          }}
          className="mt-8 rounded-lg border border-zinc-200 bg-white p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-bold",
                isCorrect
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {isCorrect ? "✓ 정답" : "✗ 오답"}
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              해설
            </h2>
          </div>
          <MarkdownView
            html={question.explanationHtml}
            source={question.explanation}
          />

          {question.concepts.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-4">
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
        <section className="mt-3">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            오답 메모 (자동 저장)
          </label>
          <textarea
            value={memo}
            onChange={(e) => {
              setMemoLocal(e.target.value);
              setMemo(question.id, e.target.value);
            }}
            placeholder="왜 틀렸는지 짧게 적어두면 나중에 다시 볼 때 도움됩니다."
            rows={2}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-2">
          <button
            onClick={goPrev}
            disabled={!prevId}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:text-zinc-900 disabled:opacity-30"
            aria-label="이전 문제"
            title="K / ←"
          >
            <span>←</span>
            <span className="hidden sm:inline">이전</span>
          </button>

          {!submitted ? (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {question.type === "mc" ? (
                <>
                  선택지를 누르거나 <kbd>1</kbd>~<kbd>{question.choices?.length}</kbd>
                </>
              ) : (
                <>
                  <kbd>O</kbd>/<kbd>X</kbd>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={goNext}
              disabled={!randomMode && !nextId}
              className="flex-1 rounded-lg bg-zinc-900 px-5 py-3 text-center text-[15px] font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:bg-zinc-300"
            >
              {randomMode ? "🎲 다음 랜덤" : "다음 문제"}{" "}
              <kbd className="ml-2 !bg-zinc-700 !text-white">↵</kbd>
            </button>
          )}

          {!submitted && (
            <div className="flex items-center gap-1">
              <button
                onClick={goRandom}
                className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition hover:border-purple-300 hover:text-purple-700"
                aria-label="랜덤 문제로"
                title="랜덤 문제로 (R)"
              >
                🎲
              </button>
              <button
                onClick={goNext}
                disabled={!nextId}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:text-zinc-900 disabled:opacity-30"
                aria-label="다음 문제"
                title="J / →"
              >
                <span className="hidden sm:inline">건너뛰기</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
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

function FrequencyTag({
  frequency,
  note,
}: {
  frequency: "high" | "medium" | "low";
  note?: string;
}) {
  const cls =
    frequency === "high"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : frequency === "medium"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-zinc-200 bg-zinc-50 text-zinc-500";
  const icon = frequency === "high" ? "🔥" : frequency === "medium" ? "📌" : "·";
  return (
    <span
      className={cn("rounded border px-1.5 py-0.5", cls)}
      title={note ?? ""}
    >
      {icon} {FREQUENCY_LABELS[frequency]}
    </span>
  );
}

function randomModeKindLabel(mode: string): string {
  switch (mode) {
    case "untried":
      return "미풀이만";
    case "wrong":
      return "오답만";
    case "bookmarked":
      return "즐겨찾기만";
    default:
      return mode;
  }
}

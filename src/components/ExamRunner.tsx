"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { MarkdownView } from "./MarkdownView";
import { formatDuration, cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

type Props = {
  allQuestions: Question[];
};

export function ExamRunner({ allQuestions }: Props) {
  const hydrated = useHydrated();
  const router = useRouter();
  const activeExam = useProgress((s) => s.activeExam);
  const saveExamAnswer = useProgress((s) => s.saveExamAnswer);
  const finishExam = useProgress((s) => s.finishExam);
  const cancelExam = useProgress((s) => s.cancelExam);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const questionMap = useMemo(
    () => new Map(allQuestions.map((q) => [q.id, q])),
    [allQuestions]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!activeExam) {
      router.replace("/exam");
      return;
    }

    function tick() {
      if (!activeExam) return;
      const elapsed = Math.floor((Date.now() - activeExam.startedAt) / 1000);
      const left = activeExam.durationSec - elapsed;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        submitFinal();
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, activeExam?.sessionId]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (activeExam) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [activeExam]);

  if (!hydrated || !activeExam) {
    return (
      <div className="prose-ko">
        <p>시험 정보를 불러오는 중...</p>
      </div>
    );
  }

  const currentQid = activeExam.qids[currentIdx];
  const currentQuestion = questionMap.get(currentQid);
  const currentAnswer = activeExam.answers[currentQid];
  const answeredCount = Object.keys(activeExam.answers).filter(
    (qid) => activeExam.answers[qid] !== null && activeExam.answers[qid] !== undefined
  ).length;

  function pickAnswer(value: number | boolean) {
    if (!currentQuestion || !activeExam) return;
    saveExamAnswer(currentQid, value);
    const isLast = currentIdx >= activeExam.qids.length - 1;
    if (isLast) {
      setTimeout(() => setShowFinishConfirm(true), 250);
    } else {
      setTimeout(() => setCurrentIdx((i) => i + 1), 180);
    }
  }

  function submitFinal() {
    let correct = 0;
    for (const qid of activeExam!.qids) {
      const q = questionMap.get(qid);
      const ans = activeExam!.answers[qid];
      if (!q || ans === undefined || ans === null) continue;
      if (ans === q.answer) correct++;
    }
    const score = Math.round((correct / activeExam!.qids.length) * 100);
    finishExam(score);
    router.push("/exam/result");
  }

  if (!currentQuestion) {
    return (
      <div className="prose-ko">
        <p>문제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isWarning = remaining < 60 * 5;
  const isCritical = remaining < 60;

  return (
    <div className="prose-ko">
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-sm font-bold",
                isCritical
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : isWarning
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-zinc-200 bg-white text-zinc-900"
              )}
            >
              ⏱ {formatDuration(remaining)}
            </div>
            <div className="text-xs text-zinc-600">
              {currentIdx + 1} / {activeExam.qids.length} · 답변{" "}
              {answeredCount}개
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              제출
            </button>
            <button
              onClick={() => {
                if (confirm("시험을 종료할까요? 진행 상황은 사라집니다.")) {
                  cancelExam();
                  router.push("/exam");
                }
              }}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
            >
              취소
            </button>
          </div>
        </div>
      </div>

      <div className="mb-2 text-xs text-zinc-500">
        문제 {currentIdx + 1} · {currentQuestion.category} ·{" "}
        {currentQuestion.subject}과목
      </div>

      <div className="mb-6">
        <MarkdownView
          html={currentQuestion.questionHtml}
          source={currentQuestion.question}
        />
        {currentQuestion.codeBlockHtml ? (
          <div className="mt-3">
            <MarkdownView html={currentQuestion.codeBlockHtml} />
          </div>
        ) : (
          currentQuestion.codeBlock && (
            <pre className="mt-3">
              <code>{currentQuestion.codeBlock}</code>
            </pre>
          )
        )}
      </div>

      {currentQuestion.type === "mc" && currentQuestion.choices && (
        <ol className="space-y-2">
          {currentQuestion.choices.map((c, i) => (
            <li key={i}>
              <button
                onClick={() => pickAnswer(i)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-[15px]",
                  currentAnswer === i
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    currentAnswer === i
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-zinc-300 text-zinc-500"
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex-1">{c}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {currentQuestion.type === "ox" && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              onClick={() => pickAnswer(v)}
              className={cn(
                "rounded-md border px-4 py-6 text-lg font-bold",
                currentAnswer === v
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              )}
            >
              {v ? "O (참)" : "X (거짓)"}
            </button>
          ))}
        </div>
      )}


      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 disabled:opacity-50"
        >
          ← 이전
        </button>
        <button
          onClick={() =>
            setCurrentIdx((i) => Math.min(activeExam.qids.length - 1, i + 1))
          }
          disabled={currentIdx === activeExam.qids.length - 1}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 disabled:opacity-50"
        >
          다음 →
        </button>
      </div>

      <div className="mt-8 rounded-md border border-zinc-200 bg-zinc-50/50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          문제 이동
        </h3>
        <div className="grid grid-cols-10 gap-1.5">
          {activeExam.qids.map((qid, i) => {
            const answered =
              activeExam.answers[qid] !== undefined &&
              activeExam.answers[qid] !== null;
            return (
              <button
                key={qid}
                onClick={() => setCurrentIdx(i)}
                className={cn(
                  "rounded border text-xs font-mono py-1.5",
                  i === currentIdx
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : answered
                      ? "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {showFinishConfirm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
          onClick={() => setShowFinishConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-zinc-900">시험을 제출할까요?</h3>
            <p className="mt-2 text-sm text-zinc-600">
              답변한 문제 {answeredCount}개 / 전체 {activeExam.qids.length}개.
              미답 문제는 오답 처리됩니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm"
              >
                계속 풀기
              </button>
              <button
                onClick={submitFinal}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

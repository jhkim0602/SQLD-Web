"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { shuffle, formatDate } from "@/lib/utils";

type Props = {
  totalCount: number;
  subject1Count: number;
  subject2Count: number;
};

type IndexedQuestion = {
  id: string;
  subject: 1 | 2;
};

export function ExamSetup({ totalCount, subject1Count, subject2Count }: Props) {
  const hydrated = useHydrated();
  const router = useRouter();
  const startExam = useProgress((s) => s.startExam);
  const activeExam = useProgress((s) => s.activeExam);
  const examHistory = useProgress((s) => s.examHistory);
  const [allMeta, setAllMeta] = useState<IndexedQuestion[]>([]);
  const [count, setCount] = useState(Math.min(50, totalCount));
  const [duration, setDuration] = useState(90);
  const [subjectMode, setSubjectMode] = useState<"mixed" | "1" | "2">("mixed");

  useEffect(() => {
    fetch("/content-index.json")
      .then((r) => r.json())
      .then((data: { questions: IndexedQuestion[] }) =>
        setAllMeta(data.questions)
      )
      .catch(() => {});
  }, []);

  const availableCount =
    subjectMode === "1"
      ? subject1Count
      : subjectMode === "2"
        ? subject2Count
        : totalCount;

  function start() {
    let pool = allMeta;
    if (subjectMode === "1") pool = pool.filter((q) => q.subject === 1);
    if (subjectMode === "2") pool = pool.filter((q) => q.subject === 2);
    const qids = shuffle(pool.map((q) => q.id)).slice(0, count);
    if (qids.length === 0) return;
    startExam(qids, duration * 60);
    router.push("/exam/active");
  }

  if (!hydrated) {
    return (
      <div className="mt-8 h-[400px] animate-pulse rounded-md border border-zinc-200 bg-zinc-50" />
    );
  }

  return (
    <div className="space-y-6">
      {activeExam && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-semibold text-amber-900">
            진행 중인 모의고사가 있습니다.
          </div>
          <p className="mt-1 text-xs text-amber-700">
            새 시험을 시작하면 현재 진행 중인 시험은 취소됩니다.
          </p>
          <Link
            href="/exam/active"
            className="mt-2 inline-block rounded bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-200"
          >
            이어 풀기 →
          </Link>
        </div>
      )}

      <div className="rounded-md border border-zinc-200 p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">설정</h2>

        <Field label="과목 범위">
          <RadioRow
            options={[
              { value: "mixed", label: `통합 (전체 ${totalCount}문제)` },
              { value: "1", label: `1과목만 (${subject1Count}문제)` },
              { value: "2", label: `2과목만 (${subject2Count}문제)` },
            ]}
            value={subjectMode}
            onChange={(v) => setSubjectMode(v as typeof subjectMode)}
          />
        </Field>

        <Field label="문제 수">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={Math.max(5, availableCount)}
              value={Math.min(count, availableCount)}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-right font-mono text-sm">
              {Math.min(count, availableCount)}문제
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            보유 문제 {availableCount}개. 실전과 같이 50문제로 설정 권장.
          </p>
        </Field>

        <Field label="제한 시간">
          <div className="flex flex-wrap gap-2">
            {[30, 60, 90, 120].map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  duration === m
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                }`}
              >
                {m}분
              </button>
            ))}
          </div>
        </Field>

        <button
          onClick={start}
          disabled={availableCount === 0 || allMeta.length === 0}
          className="mt-4 w-full rounded-md bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:bg-zinc-300"
        >
          시험 시작 →
        </button>
      </div>

      {examHistory.length > 0 && (
        <div className="rounded-md border border-zinc-200 p-5">
          <h2 className="mb-3 text-base font-semibold text-zinc-900">
            최근 응시 기록
          </h2>
          <ul className="space-y-2">
            {examHistory.slice(0, 5).map((session) => (
              <li
                key={session.sessionId}
                className="flex items-center justify-between rounded-md border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-mono text-zinc-500">
                    {formatDate(session.startedAt)}
                  </span>
                  <span className="ml-3 text-zinc-700">
                    {session.qids.length}문제 ·{" "}
                    {Math.round(session.durationSec / 60)}분
                  </span>
                </div>
                <div
                  className={`font-mono font-semibold ${
                    session.score !== null && session.score >= 60
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {session.score ?? "—"}점
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function RadioRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${
            value === o.value
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

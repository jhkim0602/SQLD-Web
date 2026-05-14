"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";
import { SUBJECT_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

type Props = {
  allQuestions: Question[];
};

export function NotesView({ allQuestions }: Props) {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const [tab, setTab] = useState<"wrong" | "bookmark">("wrong");

  if (!hydrated) {
    return (
      <div className="prose-ko">
        <p>불러오는 중...</p>
      </div>
    );
  }

  const wrongIds = Object.entries(attempts)
    .filter(([, a]) => a.wasCorrect === false)
    .map(([qid]) => qid);
  const bookmarkIds = Object.entries(attempts)
    .filter(([, a]) => a.bookmarked)
    .map(([qid]) => qid);

  const wrongs = allQuestions
    .filter((q) => wrongIds.includes(q.id))
    .sort((a, b) => {
      const ta = attempts[a.id]?.lastAnsweredAt ?? 0;
      const tb = attempts[b.id]?.lastAnsweredAt ?? 0;
      return tb - ta;
    });

  const bookmarks = allQuestions.filter((q) => bookmarkIds.includes(q.id));

  const list = tab === "wrong" ? wrongs : bookmarks;

  return (
    <div className="prose-ko">
      <header className="mb-6">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900">
          오답노트 · 즐겨찾기
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          틀린 문제와 별표 친 문제만 모아 다시 풀어보세요.
        </p>
      </header>

      <div className="flex gap-1 border-b border-zinc-200">
        <Tab active={tab === "wrong"} onClick={() => setTab("wrong")}>
          오답 ({wrongs.length})
        </Tab>
        <Tab active={tab === "bookmark"} onClick={() => setTab("bookmark")}>
          ★ 즐겨찾기 ({bookmarks.length})
        </Tab>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-md border border-zinc-200 bg-zinc-50/50 p-8 text-center text-sm text-zinc-500">
          {tab === "wrong"
            ? "아직 오답이 없습니다."
            : "아직 즐겨찾기한 문제가 없습니다."}
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((q) => {
            const a = attempts[q.id];
            return (
              <li key={q.id}>
                <Link
                  href={`/practice/${q.id}`}
                  className={cn(
                    "block rounded-md border bg-white p-4 hover:border-zinc-400",
                    tab === "wrong" ? "border-rose-100" : "border-amber-100"
                  )}
                >
                  <div className="flex items-baseline gap-2 text-xs text-zinc-500">
                    <span>{SUBJECT_LABELS[q.subject]}</span>
                    <span>·</span>
                    <span>{q.category}</span>
                    {a?.bookmarked && (
                      <span className="ml-auto text-amber-500">★</span>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[15px] text-zinc-800">
                    {q.question}
                  </div>
                  {a?.wrongNoteMemo && (
                    <div className="mt-2 rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                      📝 {a.wrongNoteMemo}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-zinc-500">
                    풀이 {a.attemptCount}회 · 정답 {a.correctCount}회
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border-b-2 px-3 py-2 text-sm font-medium transition",
        active
          ? "border-zinc-900 text-zinc-900"
          : "border-transparent text-zinc-500 hover:text-zinc-700"
      )}
    >
      {children}
    </button>
  );
}

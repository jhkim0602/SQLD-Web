"use client";

import Link from "next/link";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";

type Props = {
  totalQuestions: number;
};

export function HomeProgress({ totalQuestions: _totalQuestions }: Props) {
  void _totalQuestions;
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);

  if (!hydrated) {
    return (
      <div className="mt-8 h-[44px] animate-pulse rounded-md border border-zinc-200 bg-zinc-50" />
    );
  }

  const attemptList = Object.values(attempts);
  const solvedCount = attemptList.length;
  const wrongCount = attemptList.filter((a) => a.wasCorrect === false).length;
  const bookmarkCount = attemptList.filter((a) => a.bookmarked).length;

  if (solvedCount === 0) {
    return (
      <div className="mt-8 rounded-md border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-500">
        아직 푼 문제가 없습니다. 아래에서 시작하세요.
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-zinc-200 px-4 py-3 text-sm text-zinc-700">
      <span>
        풀어본 문제 <strong className="font-mono text-zinc-900">{solvedCount}</strong>
      </span>
      {wrongCount > 0 && (
        <Link href="/notes" className="text-rose-600 hover:underline">
          오답 {wrongCount}
        </Link>
      )}
      {bookmarkCount > 0 && (
        <Link href="/notes" className="text-amber-600 hover:underline">
          ★ 즐겨찾기 {bookmarkCount}
        </Link>
      )}
      <Link
        href="/stats"
        className="ml-auto text-xs text-zinc-500 hover:text-zinc-700"
      >
        통계 →
      </Link>
    </div>
  );
}

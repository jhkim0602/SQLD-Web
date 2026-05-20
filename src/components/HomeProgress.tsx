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
      <div className="mt-8 h-[44px] animate-pulse rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
    );
  }

  const attemptList = Object.values(attempts);
  const solvedCount = attemptList.length;
  const wrongCount = attemptList.filter((a) => a.wasCorrect === false).length;
  const bookmarkCount = attemptList.filter((a) => a.bookmarked).length;

  if (solvedCount === 0) {
    return (
      <div className="mt-8 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
        아직 푼 문제가 없습니다. 아래에서 시작하세요.
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
      <span>
        풀어본 문제 <strong className="font-mono text-zinc-900 dark:text-zinc-50">{solvedCount}</strong>
      </span>
      {wrongCount > 0 && (
        <Link href="/notes" className="text-rose-600 dark:text-rose-400 hover:underline">
          오답 {wrongCount}
        </Link>
      )}
      {bookmarkCount > 0 && (
        <Link href="/notes" className="text-amber-600 dark:text-amber-400 hover:underline">
          ★ 즐겨찾기 {bookmarkCount}
        </Link>
      )}
      <Link
        href="/stats"
        className="ml-auto text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        통계 →
      </Link>
    </div>
  );
}

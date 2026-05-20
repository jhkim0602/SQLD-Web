"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProgress } from "@/lib/store";

type Props = {
  ids: string[];
};

export function RandomRedirect({ ids }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attempts = useProgress((s) => s.attempts);
  const calledOnce = useRef(false);

  useEffect(() => {
    if (calledOnce.current) return;
    calledOnce.current = true;

    const mode = searchParams.get("mode") ?? "all";
    const exclude = searchParams.get("exclude")?.split(",") ?? [];

    let pool = ids;

    if (mode === "untried") {
      const solvedIds = new Set(Object.keys(attempts));
      pool = ids.filter((id) => !solvedIds.has(id));
      if (pool.length === 0) pool = ids;
    } else if (mode === "wrong") {
      pool = ids.filter((id) => attempts[id]?.wasCorrect === false);
      if (pool.length === 0) pool = ids;
    } else if (mode === "bookmarked") {
      pool = ids.filter((id) => attempts[id]?.bookmarked === true);
      if (pool.length === 0) pool = ids;
    }

    if (exclude.length > 0) {
      const excludeSet = new Set(exclude);
      const filtered = pool.filter((id) => !excludeSet.has(id));
      if (filtered.length > 0) pool = filtered;
    }

    if (pool.length === 0) {
      router.replace("/practice");
      return;
    }

    const next = pool[Math.floor(Math.random() * pool.length)];
    const params = new URLSearchParams();
    params.set("from", "random");
    if (mode !== "all") params.set("mode", mode);
    router.replace(`/practice/${next}?${params.toString()}`);
  }, [ids, attempts, router, searchParams]);

  return (
    <div className="prose-ko flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="text-4xl">🎲</div>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">랜덤 문제로 이동 중...</p>
    </div>
  );
}

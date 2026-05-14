import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { RandomRedirect } from "@/components/RandomRedirect";

export const metadata: Metadata = {
  title: "랜덤 풀이",
  robots: { index: false, follow: false },
};

export default function RandomPracticePage() {
  const ids = getAllQuestions().map((q) => q.id);
  return (
    <Suspense fallback={
      <div className="prose-ko flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="text-4xl">🎲</div>
        <p className="mt-3 text-sm text-zinc-500">랜덤 문제로 이동 중...</p>
      </div>
    }>
      <RandomRedirect ids={ids} />
    </Suspense>
  );
}

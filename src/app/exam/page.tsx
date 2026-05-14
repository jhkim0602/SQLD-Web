import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { ExamSetup } from "@/components/ExamSetup";

export const metadata: Metadata = {
  title: "모의고사",
  description: "SQLD 모의고사. 50문제 90분 시뮬레이션.",
};

export default function ExamPage() {
  const questions = getAllQuestions();
  const total = questions.length;
  const subject1 = questions.filter((q) => q.subject === 1).length;
  const subject2 = questions.filter((q) => q.subject === 2).length;

  return (
    <div className="prose-ko">
      <header className="mb-6">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900">
          모의고사
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          실전 SQLD는 1과목 10문제(20점) + 2과목 40문제(80점) = 50문제 90분,
          60점 이상 + 과목별 40% 이상이면 합격입니다.
        </p>
      </header>

      <ExamSetup totalCount={total} subject1Count={subject1} subject2Count={subject2} />
    </div>
  );
}

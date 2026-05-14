import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { ExamRunner } from "@/components/ExamRunner";

export const metadata: Metadata = {
  title: "시험 진행",
  robots: { index: false, follow: false },
};

export default function ExamActivePage() {
  const allQuestions = getAllQuestions();
  return <ExamRunner allQuestions={allQuestions} />;
}

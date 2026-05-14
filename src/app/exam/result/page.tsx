import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { ExamResult } from "@/components/ExamResult";

export const metadata: Metadata = {
  title: "시험 결과",
  robots: { index: false, follow: false },
};

export default function ExamResultPage() {
  return <ExamResult allQuestions={getAllQuestions()} />;
}

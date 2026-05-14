import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { OxQuiz } from "@/components/OxQuiz";

export const metadata: Metadata = {
  title: "OX 빠른 복습",
};

export default function OxPage() {
  const oxQuestions = getAllQuestions().filter((q) => q.type === "ox");
  return <OxQuiz questions={oxQuestions} />;
}

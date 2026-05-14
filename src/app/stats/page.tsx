import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { StatsView } from "@/components/StatsView";

export const metadata: Metadata = {
  title: "학습 통계",
};

export default function StatsPage() {
  return <StatsView allQuestions={getAllQuestions()} />;
}

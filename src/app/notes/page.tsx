import type { Metadata } from "next";
import { getAllQuestions } from "@/lib/content";
import { NotesView } from "@/components/NotesView";

export const metadata: Metadata = {
  title: "오답노트 · 즐겨찾기",
};

export default function NotesPage() {
  return <NotesView allQuestions={getAllQuestions()} />;
}

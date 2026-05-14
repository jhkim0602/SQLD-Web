import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllQuestions, getQuestion } from "@/lib/content";
import { QuestionView } from "@/components/QuestionView";

export async function generateStaticParams() {
  return getAllQuestions().map((q) => ({ id: q.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const q = getQuestion(id);
  if (!q) return { title: "문제 없음" };
  return {
    title: q.question.slice(0, 40),
    robots: { index: false, follow: false },
  };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getQuestion(id);
  if (!question) notFound();

  const all = getAllQuestions();
  const idx = all.findIndex((q) => q.id === id);
  const prevId = idx > 0 ? all[idx - 1].id : null;
  const nextId = idx < all.length - 1 ? all[idx + 1].id : null;

  return (
    <Suspense fallback={null}>
      <QuestionView
        key={question.id}
        question={question}
        prevId={prevId}
        nextId={nextId}
        index={idx + 1}
        total={all.length}
      />
    </Suspense>
  );
}

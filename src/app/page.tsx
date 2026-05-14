import Link from "next/link";
import { getAllQuestions, getAllConcepts } from "@/lib/content";
import { SUBJECT_LABELS, SUBJECT_QUESTION_COUNTS, SUBJECT_POINTS } from "@/lib/types";
import { HomeProgress } from "@/components/HomeProgress";

export default function HomePage() {
  const questions = getAllQuestions();
  const concepts = getAllConcepts();

  const bySubject = {
    1: questions.filter((q) => q.subject === 1).length,
    2: questions.filter((q) => q.subject === 2).length,
  };

  return (
    <div className="prose-ko">
      <h1 className="text-[2rem] font-bold tracking-tight text-zinc-900">
        SQLD 학습
      </h1>
      <p className="mt-2 max-w-[60ch] text-zinc-600">
        SQL 개발자 자격증을 한 곳에서. 문제 풀이, 개념 정리, 모의고사,
        오답노트를 깔끔한 인터페이스로.
      </p>

      <HomeProgress totalQuestions={questions.length} />

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Link
          href="/practice"
          className="block rounded-md border border-zinc-200 p-6 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-blue-600">
            기출 풀이
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">
            과목·카테고리별로 문제 풀기
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600">
            현재 {questions.length}문제. 필터로 약점만 골라 풀거나 무작위로
            돌아가며 풀 수 있습니다.
          </p>
        </Link>

        <Link
          href="/concepts"
          className="block rounded-md border border-zinc-200 p-6 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            개념 정리
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">
            이론으로 다지기
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600">
            {concepts.length}개 개념 노트. 문제와 양방향으로 연결되어 있어 약한
            부분을 바로 보강할 수 있습니다.
          </p>
        </Link>

        <Link
          href="/exam"
          className="block rounded-md border border-zinc-200 p-6 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            모의고사
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">
            50문제 / 90분 시뮬레이션
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600">
            실전과 동일한 분량과 시간으로 풀어보고 자동 채점·취약점 분석을 받아
            보세요.
          </p>
        </Link>

        <Link
          href="/quiz/ox"
          className="block rounded-md border border-zinc-200 p-6 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            OX 빠른 복습
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">
            짧은 시간에 핵심만
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600">
            한 손가락으로 O/X만 누르며 핵심 개념을 빠르게 정리합니다.
          </p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-zinc-900">출제 범위</h2>
        <p className="mt-1 text-sm text-zinc-500">
          총 50문제 · 100점 만점 · 60점 이상 합격 (과목별 40% 과락)
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {([1, 2] as const).map((s) => (
            <div key={s} className="rounded-md border border-zinc-200 p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-zinc-900">
                  {s}과목 · {SUBJECT_LABELS[s]}
                </h3>
                <span className="text-xs text-zinc-500">
                  {SUBJECT_QUESTION_COUNTS[s]}문제 / {SUBJECT_POINTS[s]}점
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                현재 {bySubject[s]}문제 수록
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-md border border-zinc-200 bg-zinc-50/50 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">단축키</h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-700 md:grid-cols-3">
          <li>
            <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> 검색
          </li>
          <li>
            <kbd>1</kbd>~<kbd>4</kbd> 선택지 고르기
          </li>
          <li>
            <kbd>O</kbd>/<kbd>X</kbd> OX 정답
          </li>
          <li>
            <kbd>↵</kbd> 제출
          </li>
          <li>
            <kbd>J</kbd>/<kbd>K</kbd> 다음/이전
          </li>
          <li>
            <kbd>B</kbd> 즐겨찾기
          </li>
        </ul>
      </section>
    </div>
  );
}

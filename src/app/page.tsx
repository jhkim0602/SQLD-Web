import Link from "next/link";
import {
  getAllQuestions,
  getAllConcepts,
  getArticleMeta,
} from "@/lib/content";
import { SUBJECT_LABELS, SUBJECT_QUESTION_COUNTS, SUBJECT_POINTS } from "@/lib/types";
import { HomeProgress } from "@/components/HomeProgress";

export default function HomePage() {
  const questions = getAllQuestions();
  const concepts = getAllConcepts();
  const articles = getArticleMeta();

  const bySubject = {
    1: questions.filter((q) => q.subject === 1).length,
    2: questions.filter((q) => q.subject === 2).length,
  };

  return (
    <div className="prose-ko">
      <h1 className="text-[2rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        SQLD 학습
      </h1>
      <p className="mt-2 max-w-[60ch] text-zinc-600 dark:text-zinc-400">
        SQL 개발자 자격증을 한 곳에서. 문제 풀이, 개념 정리, 모의고사,
        오답노트를 깔끔한 인터페이스로.
      </p>

      <HomeProgress totalQuestions={questions.length} />

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Link
          href="/practice/random"
          className="block rounded-md border-2 border-zinc-900 bg-zinc-900 p-6 text-white transition hover:bg-zinc-800"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-300 dark:text-zinc-600">
            🎲 랜덤 풀이
          </div>
          <h2 className="mt-2 text-lg font-bold">
            지금 바로 시작
          </h2>
          <p className="mt-1.5 text-sm text-zinc-300 dark:text-zinc-600">
            무작위 문제로 한 손에 풀이. R 키로 빠르게 다음 랜덤.
          </p>
        </Link>

        <Link
          href="/practice"
          className="block rounded-md border border-zinc-200 dark:border-zinc-800 p-6 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
            기출 풀이
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            과목·카테고리별로 문제 풀기
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            현재 {questions.length}문제. 필터로 약점만 풀거나 미풀이/오답만
            랜덤 모드도 제공.
          </p>
        </Link>

        <Link
          href="/concepts"
          className="block rounded-md border border-zinc-200 dark:border-zinc-800 p-6 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            개념 정리
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            이론으로 다지기
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            {concepts.length}개 개념 노트. 문제와 양방향으로 연결되어 있어 약한
            부분을 바로 보강할 수 있습니다.
          </p>
        </Link>

        <Link
          href="/exam"
          className="block rounded-md border border-zinc-200 dark:border-zinc-800 p-6 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            모의고사
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            50문제 / 90분 시뮬레이션
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            실전과 동일한 분량과 시간으로 풀어보고 자동 채점·취약점 분석을 받아
            보세요.
          </p>
        </Link>

        <Link
          href="/quiz/ox"
          className="block rounded-md border border-zinc-200 dark:border-zinc-800 p-6 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            OX 빠른 복습
          </div>
          <h2 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            짧은 시간에 핵심만
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            한 손가락으로 O/X만 누르며 핵심 개념을 빠르게 정리합니다.
          </p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">출제 범위</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          총 50문제 · 100점 만점 · 60점 이상 합격 (과목별 40% 과락)
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {([1, 2] as const).map((s) => (
            <div key={s} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {s}과목 · {SUBJECT_LABELS[s]}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {SUBJECT_QUESTION_COUNTS[s]}문제 / {SUBJECT_POINTS[s]}점
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                현재 {bySubject[s]}문제 수록
              </p>
            </div>
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">📖 칼럼</h2>
            <Link
              href="/articles"
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              전체 보기 →
            </Link>
          </div>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            위키처럼 쭉 읽는 긴 글. 어려운 개념의 배경부터 풀어줍니다.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {articles.slice(0, 4).map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="block rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/40"
              >
                <div className="mb-1 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5">
                    {a.topic}
                  </span>
                  <span>·</span>
                  <span>{a.readingMinutes}분</span>
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                  {a.title}
                </h3>
                {a.subtitle && (
                  <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{a.subtitle}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">단축키</h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300 md:grid-cols-3">
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

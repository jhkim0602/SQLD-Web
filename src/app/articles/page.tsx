import Link from "next/link";
import type { Metadata } from "next";
import { getArticleMeta } from "@/lib/content";
import { ARTICLE_LEVEL_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "칼럼",
  description:
    "위키처럼 쭉 읽는 긴 글. 어려운 개념의 배경과 직관을 천천히 풀어줍니다.",
};

export default function ArticlesPage() {
  const articles = getArticleMeta();

  return (
    <div className="prose-ko">
      <header className="mb-8">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900">
          칼럼
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          위키처럼 쭉 읽는 긴 글. 어려운 개념의 <strong>배경</strong>과{" "}
          <strong>직관</strong>을 천천히 풀어줍니다. 시험 직전보다는 처음 공부할
          때 권합니다.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-sm text-zinc-500">아직 작성된 칼럼이 없습니다.</p>
      ) : (
        <ol className="space-y-3">
          {articles.map((a, i) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="group block rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:bg-zinc-50/40"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="font-mono text-zinc-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <LevelBadge level={a.level} />
                  <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-zinc-600">
                    {a.topic}
                  </span>
                  <span className="text-zinc-400">·</span>
                  <span>{a.readingMinutes}분</span>
                </div>
                <h2 className="text-[18px] font-semibold text-zinc-900 group-hover:underline">
                  {a.title}
                </h2>
                {a.subtitle && (
                  <p className="mt-0.5 text-sm text-zinc-600">{a.subtitle}</p>
                )}
                {a.description && (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    {a.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function LevelBadge({
  level,
}: {
  level: "beginner" | "intermediate" | "advanced";
}) {
  const map = {
    beginner: "border-emerald-200 bg-emerald-50 text-emerald-700",
    intermediate: "border-blue-200 bg-blue-50 text-blue-700",
    advanced: "border-rose-200 bg-rose-50 text-rose-700",
  } as const;
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${map[level]}`}
    >
      {ARTICLE_LEVEL_LABELS[level]}
    </span>
  );
}

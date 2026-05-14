"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { SUBJECT_LABELS, TYPE_LABELS } from "@/lib/types";

type Indexed = {
  type: "question" | "concept" | "page";
  id: string;
  title: string;
  subject?: 1 | 2;
  category?: string;
  href: string;
  hint?: string;
};

const STATIC_PAGES: Indexed[] = [
  { type: "page", id: "home", title: "홈", href: "/" },
  { type: "page", id: "random", title: "🎲 랜덤 풀이", href: "/practice/random" },
  { type: "page", id: "random-untried", title: "🎲 미풀이 랜덤", href: "/practice/random?mode=untried" },
  { type: "page", id: "random-wrong", title: "🎲 오답 랜덤", href: "/practice/random?mode=wrong" },
  { type: "page", id: "random-bookmarked", title: "🎲 즐겨찾기 랜덤", href: "/practice/random?mode=bookmarked" },
  { type: "page", id: "practice", title: "기출 풀이", href: "/practice" },
  { type: "page", id: "concepts", title: "개념 정리", href: "/concepts" },
  { type: "page", id: "exam", title: "모의고사", href: "/exam" },
  { type: "page", id: "ox", title: "OX 빠른 복습", href: "/quiz/ox" },
  { type: "page", id: "notes", title: "오답노트 / 즐겨찾기", href: "/notes" },
  { type: "page", id: "stats", title: "학습 통계", href: "/stats" },
  { type: "page", id: "settings", title: "설정 · 백업", href: "/settings" },
];

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [indexed, setIndexed] = useState<Indexed[]>(STATIC_PAGES);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/content-index.json")
      .then((r) => r.json())
      .then((data: {
        questions: Array<{
          id: string;
          subject: 1 | 2;
          category: string;
          type: "mc" | "ox";
          preview: string;
        }>;
        concepts: Array<{
          slug: string;
          title: string;
          subject: 1 | 2;
          category: string;
        }>;
      }) => {
        const qs: Indexed[] = data.questions.map((q) => ({
          type: "question",
          id: q.id,
          title: q.preview,
          subject: q.subject,
          category: q.category,
          href: `/practice/${q.id}`,
          hint: `${q.id} · ${TYPE_LABELS[q.type]}`,
        }));
        const cs: Indexed[] = data.concepts.map((c) => ({
          type: "concept",
          id: c.slug,
          title: c.title,
          subject: c.subject,
          category: c.category,
          href: `/concepts/${c.slug}`,
        }));
        setIndexed([...STATIC_PAGES, ...cs, ...qs]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function openMenu() {
      setOpen(true);
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((wasOpen) => {
          if (wasOpen) return false;
          setQuery("");
          setActiveIdx(0);
          setTimeout(() => inputRef.current?.focus(), 0);
          return true;
        });
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-menu", openMenu);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-menu", openMenu);
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(indexed, {
        keys: ["title", "category", "id"],
        threshold: 0.4,
        includeScore: true,
      }),
    [indexed]
  );

  const results = useMemo(() => {
    if (!query.trim()) return indexed.slice(0, 20);
    return fuse.search(query).slice(0, 25).map((r) => r.item);
  }, [query, indexed, fuse]);

  function navigate(item: Indexed) {
    router.push(item.href);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIdx];
      if (item) navigate(item);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[10vh]"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4">
          <span className="text-zinc-400">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="문제, 개념, 페이지 검색..."
            className="flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-zinc-400"
            aria-label="검색"
          />
          <kbd>ESC</kbd>
        </div>
        <ul className="max-h-[400px] overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-zinc-500">
              일치 결과 없음
            </li>
          )}
          {results.map((item, i) => (
            <li key={`${item.type}-${item.id}`}>
              <button
                onClick={() => navigate(item)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                  i === activeIdx ? "bg-zinc-100" : ""
                }`}
              >
                <Badge type={item.type} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-zinc-900">{item.title}</div>
                  {(item.subject || item.category || item.hint) && (
                    <div className="mt-0.5 truncate text-xs text-zinc-500">
                      {item.subject && (
                        <span>{SUBJECT_LABELS[item.subject]}</span>
                      )}
                      {item.category && (
                        <>
                          {item.subject && <span> · </span>}
                          <span>{item.category}</span>
                        </>
                      )}
                      {item.hint && (
                        <>
                          {(item.subject || item.category) && <span> · </span>}
                          <span>{item.hint}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-[11px] text-zinc-500">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 이동
          </span>
          <span>
            <kbd>↵</kbd> 선택
          </span>
          <span>
            <kbd>ESC</kbd> 닫기
          </span>
        </div>
      </div>
    </div>
  );
}

function Badge({ type }: { type: Indexed["type"] }) {
  const label =
    type === "question" ? "문제" : type === "concept" ? "개념" : "페이지";
  const cls =
    type === "question"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : type === "concept"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-zinc-100 text-zinc-700 border-zinc-200";
  return (
    <span
      className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SUBJECT_LABELS, TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  currentSubject: string;
  currentCategory: string;
  currentType: string;
  availableCategories: string[];
};

export function PracticeFilters({
  currentSubject,
  currentCategory,
  currentType,
  availableCategories,
}: Props) {
  const router = useRouter();
  const [expandedMobile, setExpandedMobile] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
      const set = (k: string, v: string) => {
        if (v) params.set(k, v);
      };
      set("subject", currentSubject);
      set("category", currentCategory);
      set("type", currentType);

      if (value) params.set(key, value);
      else params.delete(key);

      if (key === "subject") params.delete("category");

      const qs = params.toString();
      router.push(`/practice${qs ? `?${qs}` : ""}`);
    },
    [currentSubject, currentCategory, currentType, router]
  );

  function clear() {
    router.push("/practice");
  }

  const activeCount =
    (currentSubject ? 1 : 0) +
    (currentCategory ? 1 : 0) +
    (currentType ? 1 : 0);
  const hasAny = activeCount > 0;

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* 항상 보이는 상단 바: 과목 선택 + 모바일 토글 */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5 md:px-4">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <button
            onClick={() => setExpandedMobile((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            <span>필터</span>
            {hasAny && (
              <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-white">
                {activeCount}
              </span>
            )}
            <span
              className={cn(
                "text-xs text-zinc-400 dark:text-zinc-500 transition-transform",
                expandedMobile && "rotate-180"
              )}
            >
              ▼
            </span>
          </button>
          {hasAny && (
            <button
              onClick={clear}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              초기화
            </button>
          )}
        </div>

        <FilterRow label="과목">
          <Chip
            active={!currentSubject}
            onClick={() => updateParam("subject", "")}
          >
            전체
          </Chip>
          {(["1", "2"] as const).map((s) => (
            <Chip
              key={s}
              active={currentSubject === s}
              onClick={() => updateParam("subject", s)}
            >
              {s}과목
              <span className="ml-1 hidden text-[10px] opacity-70 sm:inline">
                · {SUBJECT_LABELS[Number(s) as 1 | 2]}
              </span>
            </Chip>
          ))}
        </FilterRow>
      </div>

      {/* 카테고리/유형: 모바일은 접힘, 데스크탑은 항상 표시 */}
      <div
        className={cn(
          "px-3 py-3 md:px-4 md:py-3 md:block",
          expandedMobile ? "block" : "hidden md:block"
        )}
      >
        <FilterRow label="카테고리">
          <Chip
            active={!currentCategory}
            onClick={() => updateParam("category", "")}
          >
            전체
          </Chip>
          {availableCategories.map((c) => (
            <Chip
              key={c}
              active={currentCategory === c}
              onClick={() => updateParam("category", c)}
            >
              {c}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="유형" last>
          <Chip
            active={!currentType}
            onClick={() => updateParam("type", "")}
          >
            전체
          </Chip>
          {(["mc", "ox"] as const).map((t) => (
            <Chip
              key={t}
              active={currentType === t}
              onClick={() => updateParam("type", t)}
            >
              {TYPE_LABELS[t]}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {hasAny && (
        <div className="hidden border-t border-zinc-100 dark:border-zinc-800 px-4 py-2 md:block">
          <button
            onClick={clear}
            className="text-xs text-zinc-500 dark:text-zinc-400 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn(last ? "" : "mb-3")}>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs transition whitespace-nowrap",
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
      )}
    >
      {children}
    </button>
  );
}

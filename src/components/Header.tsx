"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

export function Header() {
  return (
    <header className="fixed top-0 z-30 flex h-16 w-full items-center border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-zinc-900"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-white text-[11px] font-bold">
            SQL
          </span>
          <span className="text-[15px] tracking-tight">SQLD 학습</span>
        </Link>

        <SearchTrigger />
      </div>
    </header>
  );
}

function SearchTrigger() {
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
    () => true
  );

  function open() {
    window.dispatchEvent(new CustomEvent("open-command-menu"));
  }

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
      aria-label="검색 열기"
    >
      <SearchIcon />
      <span className="hidden md:inline">검색</span>
      <kbd className="hidden md:inline">{isMac ? "⌘" : "Ctrl"}+K</kbd>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

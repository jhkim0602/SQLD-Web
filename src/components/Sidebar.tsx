"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  description?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    title: "학습",
    items: [
      { href: "/", label: "홈" },
      { href: "/practice", label: "기출 풀이" },
      { href: "/concepts", label: "개념 정리" },
      { href: "/quiz/ox", label: "OX 빠른 복습" },
    ],
  },
  {
    title: "시험",
    items: [
      { href: "/exam", label: "모의고사" },
      { href: "/notes", label: "오답노트 / 즐겨찾기" },
      { href: "/stats", label: "학습 통계" },
    ],
  },
  {
    title: "기타",
    items: [{ href: "/settings", label: "설정 · 진도 백업" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpenMobile(true)}
        className="fixed left-3 top-3 z-40 grid h-10 w-10 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-700 md:hidden"
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {openMobile && (
        <div
          onClick={() => setOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 border-r border-zinc-200 bg-white px-4 py-6 transition-transform md:sticky md:top-16 md:z-auto md:block md:translate-x-0 md:self-start md:border-r-0 md:px-0 md:py-8",
          openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <button
          onClick={() => setOpenMobile(false)}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 md:hidden"
          aria-label="메뉴 닫기"
        >
          ✕
        </button>

        <nav className="md:sticky md:top-24">
          {NAV.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {group.title}
              </h3>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-zinc-100 font-medium text-zinc-900"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="prose-ko text-center">
      <h1 className="text-[2rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">404</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
      >
        홈으로
      </Link>
    </div>
  );
}

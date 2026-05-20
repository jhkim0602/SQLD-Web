import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CommandMenu } from "@/components/CommandMenu";
import { StoreHydration } from "@/components/StoreHydration";
import { ThemeProvider } from "@/components/ThemeProvider";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SQLD 학습 — 기출과 개념을 한 곳에서",
    template: "%s | SQLD 학습",
  },
  description:
    "SQLD(SQL 개발자) 자격증 대비 학습 사이트. 문제 풀이, 개념 정리, 모의고사, 오답노트까지.",
  metadataBase: new URL("https://sqld.local"),
  openGraph: {
    title: "SQLD 학습",
    description: "기출 풀이 · 개념 정리 · 모의고사 · 오답노트",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${nanumMyeongjo.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          <StoreHydration />
          <Header />
          <div className="mx-auto flex w-full max-w-[1200px] gap-8 px-4 pt-16 md:px-6">
            <Sidebar />
            <main className="min-w-0 flex-1 py-8 md:py-12">{children}</main>
          </div>
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}

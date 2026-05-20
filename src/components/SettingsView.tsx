"use client";

import { useRef, useState } from "react";
import { useProgress } from "@/lib/store";
import { useHydrated } from "./StoreHydration";

export function SettingsView() {
  const hydrated = useHydrated();
  const exportState = useProgress((s) => s.exportState);
  const importState = useProgress((s) => s.importState);
  const resetAll = useProgress((s) => s.resetAll);
  const settings = useProgress((s) => s.settings);
  const updateSettings = useProgress((s) => s.updateSettings);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  function exportToFile() {
    const data = exportState();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sqld-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("진도 파일을 내보냈습니다.");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importState(reader.result as string);
      showMessage(
        success ? "진도를 복원했습니다." : "잘못된 파일입니다."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div className="prose-ko">
      <header className="mb-6">
        <h1 className="text-[1.875rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          설정 · 백업
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          진도 데이터는 브라우저에 저장됩니다. 기기 이동 또는 백업을 위해
          내보내기/불러오기를 사용하세요.
        </p>
      </header>

      {message && (
        <div className="mb-4 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          {message}
        </div>
      )}

      <section className="mt-6 rounded-md border border-zinc-200 dark:border-zinc-800 p-5">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">진도 백업</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          JSON 파일로 저장하거나 복원합니다.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={exportToFile}
            disabled={!hydrated}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            내보내기
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!hydrated}
            className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-50"
          >
            불러오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </section>

      {hydrated && (
        <section className="mt-6 rounded-md border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">기본 동작</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings.showExplanationAfterAnswer}
                onChange={(e) =>
                  updateSettings({
                    showExplanationAfterAnswer: e.target.checked,
                  })
                }
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  제출 후 해설 즉시 표시
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  체크 해제 시 해설을 별도 버튼으로 토글합니다.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings.shuffleChoices}
                onChange={(e) =>
                  updateSettings({ shuffleChoices: e.target.checked })
                }
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  선택지 무작위 배열
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  객관식 문제의 선택지 순서를 매번 섞습니다.
                </div>
              </div>
            </label>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50/30 p-5">
        <h2 className="text-base font-semibold text-rose-900">데이터 초기화</h2>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          모든 진도, 오답노트, 즐겨찾기, 시험 이력을 삭제합니다. 되돌릴 수
          없습니다.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={!hydrated}
            className="mt-4 rounded-md border border-rose-300 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 disabled:opacity-50"
          >
            모든 데이터 초기화
          </button>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                showMessage("모든 데이터가 초기화되었습니다.");
              }}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              정말 초기화
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm"
            >
              취소
            </button>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 text-sm text-zinc-600 dark:text-zinc-400">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">키보드 단축키</h3>
        <ul className="mt-2 grid gap-1.5 md:grid-cols-2">
          <li>
            <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> 검색
          </li>
          <li>
            <kbd>1</kbd>~<kbd>4</kbd> 객관식 선택
          </li>
          <li>
            <kbd>O</kbd>/<kbd>X</kbd> OX 답 선택
          </li>
          <li>
            <kbd>↵</kbd> 제출 / 다음
          </li>
          <li>
            <kbd>J</kbd> 다음 문제
          </li>
          <li>
            <kbd>K</kbd> 이전 문제
          </li>
          <li>
            <kbd>B</kbd> 즐겨찾기 토글
          </li>
          <li>
            <kbd>ESC</kbd> 모달 닫기
          </li>
        </ul>
      </section>
    </div>
  );
}

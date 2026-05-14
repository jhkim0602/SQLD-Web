"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AttemptRecord = {
  correctCount: number;
  attemptCount: number;
  lastAnsweredAt: number;
  lastChoice: number | boolean | null;
  wasCorrect: boolean | null;
  bookmarked: boolean;
  wrongNoteMemo: string;
};

export type ExamSession = {
  sessionId: string;
  startedAt: number;
  durationSec: number;
  finishedAt: number | null;
  score: number | null;
  qids: string[];
  answers: Record<string, number | boolean | null | undefined>;
};

export type Settings = {
  showExplanationAfterAnswer: boolean;
  shuffleChoices: boolean;
  accentColor: "blue" | "emerald";
};

type ProgressState = {
  schemaVersion: 1;
  attempts: Record<string, AttemptRecord>;
  examHistory: ExamSession[];
  activeExam: ExamSession | null;
  settings: Settings;

  recordAttempt: (
    qid: string,
    choice: number | boolean | null,
    isCorrect: boolean
  ) => void;
  toggleBookmark: (qid: string) => void;
  setWrongNoteMemo: (qid: string, memo: string) => void;
  startExam: (qids: string[], durationSec: number) => string;
  saveExamAnswer: (
    qid: string,
    choice: number | boolean | null
  ) => void;
  finishExam: (score: number) => void;
  cancelExam: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  importState: (raw: unknown) => boolean;
  exportState: () => string;
};

const DEFAULT_ATTEMPT: AttemptRecord = {
  correctCount: 0,
  attemptCount: 0,
  lastAnsweredAt: 0,
  lastChoice: null,
  wasCorrect: null,
  bookmarked: false,
  wrongNoteMemo: "",
};

function generateSessionId(): string {
  return `exam-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      schemaVersion: 1,
      attempts: {},
      examHistory: [],
      activeExam: null,
      settings: {
        showExplanationAfterAnswer: true,
        shuffleChoices: false,
        accentColor: "blue",
      },

      recordAttempt: (qid, choice, isCorrect) => {
        const prev = get().attempts[qid] ?? DEFAULT_ATTEMPT;
        set({
          attempts: {
            ...get().attempts,
            [qid]: {
              ...prev,
              correctCount: prev.correctCount + (isCorrect ? 1 : 0),
              attemptCount: prev.attemptCount + 1,
              lastAnsweredAt: Date.now(),
              lastChoice: choice,
              wasCorrect: isCorrect,
            },
          },
        });
      },

      toggleBookmark: (qid) => {
        const prev = get().attempts[qid] ?? DEFAULT_ATTEMPT;
        set({
          attempts: {
            ...get().attempts,
            [qid]: { ...prev, bookmarked: !prev.bookmarked },
          },
        });
      },

      setWrongNoteMemo: (qid, memo) => {
        const prev = get().attempts[qid] ?? DEFAULT_ATTEMPT;
        set({
          attempts: {
            ...get().attempts,
            [qid]: { ...prev, wrongNoteMemo: memo },
          },
        });
      },

      startExam: (qids, durationSec) => {
        const sessionId = generateSessionId();
        set({
          activeExam: {
            sessionId,
            startedAt: Date.now(),
            durationSec,
            finishedAt: null,
            score: null,
            qids,
            answers: {},
          },
        });
        return sessionId;
      },

      saveExamAnswer: (qid, choice) => {
        const exam = get().activeExam;
        if (!exam) return;
        set({
          activeExam: {
            ...exam,
            answers: { ...exam.answers, [qid]: choice },
          },
        });
      },

      finishExam: (score) => {
        const exam = get().activeExam;
        if (!exam) return;
        const completed: ExamSession = {
          ...exam,
          finishedAt: Date.now(),
          score,
        };
        set({
          activeExam: null,
          examHistory: [completed, ...get().examHistory].slice(0, 50),
        });
      },

      cancelExam: () => set({ activeExam: null }),

      updateSettings: (patch) =>
        set({ settings: { ...get().settings, ...patch } }),

      resetAll: () =>
        set({
          attempts: {},
          examHistory: [],
          activeExam: null,
        }),

      importState: (raw) => {
        try {
          const parsed =
            typeof raw === "string" ? JSON.parse(raw) : (raw as unknown);
          if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("schemaVersion" in parsed)
          ) {
            return false;
          }
          const state = parsed as Partial<ProgressState>;
          set({
            schemaVersion: 1,
            attempts: state.attempts ?? {},
            examHistory: state.examHistory ?? [],
            activeExam: state.activeExam ?? null,
            settings: { ...get().settings, ...(state.settings ?? {}) },
          });
          return true;
        } catch {
          return false;
        }
      },

      exportState: () => {
        const { schemaVersion, attempts, examHistory, settings } = get();
        return JSON.stringify(
          { schemaVersion, attempts, examHistory, settings },
          null,
          2
        );
      },
    }),
    {
      name: "sqld:progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        attempts: state.attempts,
        examHistory: state.examHistory,
        activeExam: state.activeExam,
        settings: state.settings,
      }),
    }
  )
);

export function attemptOf(
  attempts: Record<string, AttemptRecord>,
  qid: string
): AttemptRecord {
  return attempts[qid] ?? DEFAULT_ATTEMPT;
}

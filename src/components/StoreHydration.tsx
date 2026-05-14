"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useProgress } from "@/lib/store";

function subscribeHydration(callback: () => void): () => void {
  return useProgress.persist.onFinishHydration(callback);
}

function getHydratedSnapshot(): boolean {
  return useProgress.persist.hasHydrated();
}

function getServerSnapshot(): boolean {
  return false;
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerSnapshot
  );
}

export function StoreHydration() {
  useEffect(() => {
    if (!useProgress.persist.hasHydrated()) {
      void useProgress.persist.rehydrate();
    }
  }, []);
  return null;
}

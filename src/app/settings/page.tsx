import type { Metadata } from "next";
import { SettingsView } from "@/components/SettingsView";

export const metadata: Metadata = {
  title: "설정 · 백업",
};

export default function SettingsPage() {
  return <SettingsView />;
}

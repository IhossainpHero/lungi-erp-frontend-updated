import { clsx } from "clsx";
import type { TabType } from "./shared";

const tabs: { key: TabType; label: string }[] = [
  { key: "ledger", label: "লেজার" },
  { key: "collections", label: "কালেকশন" },
  { key: "damage", label: "ড্যামেজ ক্লেইম" },
  { key: "payments", label: "পেমেন্ট" },
];

export default function TabBar({
  tab,
  setTab,
}: {
  tab: TabType;
  setTab: (t: TabType) => void;
}) {
  return (
    <div className="flex gap-0 border-b border-[#ede4d0] overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={clsx(
            "px-4 sm:px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap",
            tab === t.key
              ? "border-[#e08600] text-[#e08600]"
              : "border-transparent text-[#7a5730]/60 hover:text-[#7a5730] hover:border-[#ede4d0]",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

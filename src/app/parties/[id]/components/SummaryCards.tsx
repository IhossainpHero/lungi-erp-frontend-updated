import type { ILedgerSummary } from "@/types";

export default function SummaryCards({ ledger }: { ledger: ILedgerSummary }) {
  const stats = [
    { label: "মোট চার্জ", value: ledger.totalCharge, color: "text-blue-600" },
    { label: "পেমেন্ট", value: ledger.totalPaid, color: "text-green-600" },
    {
      label: "ড্যামেজ",
      value: ledger.totalDamageCredit,
      color: "text-orange-500",
    },
    { label: "বকেয়া", value: ledger.totalDue, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-3.5 sm:p-4">
          <p className="text-xs text-[#7a5730]/70 mb-1">{s.label}</p>
          <p className={`text-lg sm:text-xl font-bold ${s.color}`}>
            ৳{s.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

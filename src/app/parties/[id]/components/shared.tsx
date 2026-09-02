import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

export const ITEMS_PER_PAGE = 10;

export const typeIcon: Record<string, React.ElementType> = {
  collection: TrendingUp,
  payment: Wallet,
  damage: AlertTriangle,
};

export const typeColor: Record<string, string> = {
  collection: "text-blue-600",
  payment: "text-green-600",
  damage: "text-red-500",
};

export const statusConfig = {
  pending: {
    label: "অপেক্ষমান",
    icon: Clock,
    cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  approved: {
    label: "অনুমোদিত",
    icon: CheckCircle,
    cls: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "প্রত্যাখ্যাত",
    icon: XCircle,
    cls: "bg-red-50 text-red-600 border-red-200",
  },
};

export const paymentTypeLabel: Record<string, string> = {
  partial: "আংশিক",
  full: "পূর্ণ",
  halkhat: "হালখাতা",
};

// বাংলাদেশের পরিচিত হাট-বাজারের নাম (suggestion list)
export const hatSuggestions = [
  "শাহজাদপুর হাট",
  "সিরাজগঞ্জ হাট",
  "বেলকুচি হাট",
  "এনায়েতপুর হাট",
];

export type TabType = "ledger" | "collections" | "damage" | "payments";

import type { IParty } from "@/types";
import { AlertTriangle, MapPin, Pencil, Phone, Plus } from "lucide-react";
import Link from "next/link";

export default function PartyHeaderCard({
  party,
  partyId,
  isPartyUser = false, // ✅ নতুন prop
}: {
  party: IParty;
  partyId: string;
  isPartyUser?: boolean; // ✅ নতুন
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center text-white font-bold text-lg sm:text-xl">
            {party.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#1a1208] truncate">
              {party.name}
            </h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-[#7a5730]/70 mt-1">
              {party.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {party.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {party.hatName}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ পার্টি ইউজার হলে পুরো বাটন গ্রুপটাই hidden */}
        {!isPartyUser && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/damage/new?partyId=${partyId}&partyName=${encodeURIComponent(party.name)}`}
              className="text-xs sm:text-sm px-3 py-1.5 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> ড্যামেজ ক্লেইম
            </Link>
            <Link
              href={`/payments/new?partyId=${partyId}&partyName=${encodeURIComponent(party.name)}`}
              className="text-xs sm:text-sm px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> পেমেন্ট
            </Link>
            <Link
              href={`/parties/${partyId}/edit`}
              className="text-xs sm:text-sm px-3 py-1.5 border border-[#ede4d0] rounded-lg hover:bg-[#fdf4e7] flex items-center gap-1 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

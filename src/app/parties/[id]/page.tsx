"use client";

import { useAuthStore } from "@/context/auth.store";
import api from "@/lib/api";
import type {
  ICollection,
  IDamageClaim,
  ILedgerSummary,
  IParty,
  IPayment,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import CollectionEditModal from "./components/Collectioneditmodal";
import CollectionsTab from "./components/Collectionstab";
import DamageEditModal from "./components/DamageEditModal";
import DamageTab from "./components/Damagetab";
import LedgerTab from "./components/LedgerTab";
import PartyHeaderCard from "./components/Partyheadercard";
import PaymentEditModal from "./components/PaymentEditModal";
import PaymentsTab from "./components/Paymentstab";
import { ITEMS_PER_PAGE, TabType } from "./components/shared";
import SummaryCards from "./components/SummaryCards";
import TabBar from "./components/TabBar";

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabType>("ledger");

  // Ledger date filter
  const [selectedDate, setSelectedDate] = useState("");
  const [mode, setMode] = useState<"all" | "date">("all");

  // Collections pagination + date range
  const [colPage, setColPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Payments date range
  const [payFromDate, setPayFromDate] = useState("");
  const [payToDate, setPayToDate] = useState("");

  // ── Party ──────────────────────────────────────────
  const { data: party, isLoading: partyLoading } = useQuery({
    queryKey: ["party", id],
    queryFn: () =>
      api.get<{ data: IParty }>(`/parties/${id}`).then((r) => r.data.data),
  });

  // ── Ledger (always fetched for summary cards) ──────
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["ledger", id, selectedDate, mode],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (mode === "date" && selectedDate) params.date = selectedDate;
      const res = await api.get<{ data: ILedgerSummary }>(
        `/parties/${id}/ledger`,
        { params },
      );
      return res.data.data;
    },
  });

  // ── Collections ────────────────────────────────────
  const { data: collectionsData, isLoading: colLoading } = useQuery({
    queryKey: ["party-collections", id, colPage, fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        partyId: id,
        page: colPage,
        limit: ITEMS_PER_PAGE,
      };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await api.get<{
        data: { collections: ICollection[]; total: number };
      }>("/collections", { params });
      return res.data.data;
    },
    enabled: tab === "collections",
  });

  // ── Damage claims ──────────────────────────────────
  const { data: damages, isLoading: damageLoading } = useQuery({
    queryKey: ["party-damage", id],
    queryFn: () =>
      api
        .get<{ data: IDamageClaim[] }>(`/damage?partyId=${id}`)
        .then((r) => r.data.data),
    enabled: tab === "damage",
  });

  // ── Payments ───────────────────────────────────────
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["party-payments", id, payFromDate, payToDate],
    queryFn: async () => {
      const params: Record<string, string> = { partyId: String(id) };
      if (payFromDate) params.from = payFromDate;
      if (payToDate) params.to = payToDate;
      const res = await api.get<{ data: IPayment[] }>("/payments", { params });
      return res.data.data;
    },
    enabled: tab === "payments",
  });

  // ── Damage status mutation ─────────────────────────
  const updateStatus = useMutation({
    mutationFn: ({
      dmgId,
      status,
    }: {
      dmgId: string;
      status: "approved" | "rejected";
    }) => api.patch(`/damage/${dmgId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-damage", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট ব্যর্থ হয়েছে"),
  });

  // ── RBAC helpers ────────────────────────────────────
  const isAdmin = user?.role === "admin";
  const canModerate = user?.role === "admin" || user?.role === "moderator";
  const isPartyUser = user?.role === "party"; // ✅ নতুন

  // ── Modal state ─────────────────────────────────────
  const [editingCollection, setEditingCollection] =
    useState<ICollection | null>(null);
  const [editingDamage, setEditingDamage] = useState<IDamageClaim | null>(null);
  const [editingPayment, setEditingPayment] = useState<IPayment | null>(null);

  // ── Collection: update / delete-request mutations ───
  const updateCollectionMut = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      api.put(`/collections/${payload.id}`, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-collections", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      setEditingCollection(null);
      toast.success("কালেকশন আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট ব্যর্থ হয়েছে"),
  });

  const requestCollectionDeleteMut = useMutation({
    mutationFn: (colId: string) =>
      api.post(`/collections/${colId}/request-delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-collections", id] });
      toast.success(
        "ডিলিট রিকোয়েস্ট পাঠানো হয়েছে — অ্যাডমিন অনুমোদনের অপেক্ষায়",
      );
    },
    onError: () => toast.error("রিকোয়েস্ট ব্যর্থ হয়েছে"),
  });

  const resolveCollectionDeleteMut = useMutation({
    mutationFn: ({
      colId,
      action,
    }: {
      colId: string;
      action: "approve" | "reject";
    }) => api.patch(`/collections/${colId}/delete-request`, { action }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["party-collections", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      toast.success(
        vars.action === "approve"
          ? "কালেকশন মুছে ফেলা হয়েছে"
          : "রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে",
      );
    },
    onError: () => toast.error("অ্যাকশন ব্যর্থ হয়েছে"),
  });

  const deleteCollectionDirectMut = useMutation({
    mutationFn: (colId: string) => api.delete(`/collections/${colId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-collections", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      toast.success("কালেকশন মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("ডিলিট ব্যর্থ হয়েছে"),
  });

  // ── Damage: update / delete-request mutations ───────
  const updateDamageMut = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      api.put(`/damage/${payload.id}`, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-damage", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      setEditingDamage(null);
      toast.success("ড্যামেজ ক্লেইম আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট ব্যর্থ হয়েছে"),
  });

  const requestDamageDeleteMut = useMutation({
    mutationFn: (dmgId: string) => api.post(`/damage/${dmgId}/request-delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-damage", id] });
      toast.success(
        "ডিলিট রিকোয়েস্ট পাঠানো হয়েছে — অ্যাডমিন অনুমোদনের অপেক্ষায়",
      );
    },
    onError: () => toast.error("রিকোয়েস্ট ব্যর্থ হয়েছে"),
  });

  const rejectDamageDeleteMut = useMutation({
    mutationFn: (dmgId: string) =>
      api.patch(`/damage/${dmgId}/delete-request`, { action: "reject" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-damage", id] });
      toast.success("রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে");
    },
    onError: () => toast.error("অ্যাকশন ব্যর্থ হয়েছে"),
  });

  const deleteDamageDirectMut = useMutation({
    mutationFn: (dmgId: string) => api.delete(`/damage/${dmgId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-damage", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      toast.success("ড্যামেজ ক্লেইম মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("ডিলিট ব্যর্থ হয়েছে"),
  });

  // ── Payment: update / delete mutations ─────────────
  const updatePaymentMut = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      api.put(`/payments/${payload.id}`, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-payments", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setEditingPayment(null);
      toast.success("পেমেন্ট আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট ব্যর্থ হয়েছে"),
  });

  const deletePaymentDirectMut = useMutation({
    mutationFn: (payId: string) => api.delete(`/payments/${payId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-payments", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("পেমেন্ট মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("ডিলিট ব্যর্থ হয়েছে"),
  });

  if (partyLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!party)
    return (
      <p className="text-center py-20 text-[#7a5730]">পার্টি পাওয়া যায়নি</p>
    );

  return (
    <div className="space-y-4 sm:space-y-5 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Back — party role-এর জন্য hidden, কারণ /parties (সব পার্টির লিস্ট) তার অ্যাক্সেসেই নেই */}
      {!isPartyUser && (
        <Link
          href="/parties"
          className="inline-flex items-center gap-1.5 text-sm text-[#7a5730] hover:text-[#e08600]"
        >
          <ArrowLeft className="w-4 h-4" /> পার্টি তালিকায় ফিরে যান
        </Link>
      )}

      <PartyHeaderCard
        party={party}
        partyId={String(id)}
        isPartyUser={isPartyUser}
      />

      {ledger && <SummaryCards ledger={ledger} />}

      <TabBar tab={tab} setTab={setTab} />

      {tab === "ledger" && (
        <LedgerTab
          ledger={ledger}
          ledgerLoading={ledgerLoading}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          mode={mode}
          setMode={setMode}
        />
      )}

      {tab === "collections" && (
        <CollectionsTab
          collectionsData={collectionsData}
          colLoading={colLoading}
          colPage={colPage}
          setColPage={setColPage}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          isAdmin={isAdmin}
          canModerate={canModerate}
          onEdit={setEditingCollection}
          onDeleteDirect={(colId) => deleteCollectionDirectMut.mutate(colId)}
          onRequestDelete={(colId) => requestCollectionDeleteMut.mutate(colId)}
          onResolveDelete={(colId, action) =>
            resolveCollectionDeleteMut.mutate({ colId, action })
          }
        />
      )}

      {tab === "damage" && (
        <DamageTab
          party={party}
          partyId={String(id)}
          damages={damages}
          damageLoading={damageLoading}
          isAdmin={isAdmin}
          canModerate={canModerate}
          isPartyUser={isPartyUser}
          onUpdateStatus={(dmgId, status) =>
            updateStatus.mutate({ dmgId, status })
          }
          onEdit={setEditingDamage}
          onDeleteDirect={(dmgId) => deleteDamageDirectMut.mutate(dmgId)}
          onRequestDelete={(dmgId) => requestDamageDeleteMut.mutate(dmgId)}
          onRejectDelete={(dmgId) => rejectDamageDeleteMut.mutate(dmgId)}
        />
      )}

      {tab === "payments" && (
        <PaymentsTab
          party={party}
          partyId={String(id)}
          payments={payments}
          paymentsLoading={paymentsLoading}
          payFromDate={payFromDate}
          setPayFromDate={setPayFromDate}
          payToDate={payToDate}
          setPayToDate={setPayToDate}
          isAdmin={isAdmin}
          canModerate={canModerate}
          isPartyUser={isPartyUser}
          onEdit={setEditingPayment}
          onDeleteDirect={(payId) => deletePaymentDirectMut.mutate(payId)}
        />
      )}

      {/* ══════ Edit Modals ══════ */}
      {editingCollection && (
        <CollectionEditModal
          collection={editingCollection}
          isSaving={updateCollectionMut.isPending}
          onClose={() => setEditingCollection(null)}
          onSave={(body) =>
            updateCollectionMut.mutate({ id: editingCollection._id, body })
          }
        />
      )}
      {editingDamage && (
        <DamageEditModal
          damage={editingDamage}
          isSaving={updateDamageMut.isPending}
          onClose={() => setEditingDamage(null)}
          onSave={(body) =>
            updateDamageMut.mutate({ id: editingDamage._id, body })
          }
        />
      )}
      {editingPayment && (
        <PaymentEditModal
          payment={editingPayment}
          isSaving={updatePaymentMut.isPending}
          onClose={() => setEditingPayment(null)}
          onSave={(body) =>
            updatePaymentMut.mutate({ id: editingPayment._id, body })
          }
        />
      )}
    </div>
  );
}

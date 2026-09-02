// src/types/index.ts — mirrors backend src/types/index.ts

export type UserRole = "admin" | "moderator" | "staff" | "party";
export type PartyStatus = "active" | "inactive";
export type PaymentMethod = "cash" | "bkash" | "bank";
export type PaymentType = "partial" | "full" | "halkhat";
export type DamageStatus = "pending" | "approved" | "rejected";
export type ServiceCategory = "marchraise" | "wash" | "tana";
export type ServiceLocation = "shahajadpur" | "dhaka";
export type ServiceVariant = "normal" | "vip";

export interface IService {
  _id: string;
  serviceId: string;
  label: string;
  category: ServiceCategory;
  location: ServiceLocation;
  variant?: ServiceVariant;
  ratePerThan: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPartyDeleteRequest {
  requestedBy?: string | { _id: string; name: string };
  requestedAt?: string;
  status?: "pending" | "approved" | "rejected";
}

export interface IParty {
  _id: string;
  name: string;
  phone?: string;
  hatName: string;
  address?: string;
  status: PartyStatus;
  deleteRequest?: IPartyDeleteRequest;
  createdAt: string;
  updatedAt: string;
}

export interface ILineItem {
  _id?: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  foldingNumber?: number;
  ratePerThan: number;
  amount: number;
}

export interface ICollection {
  _id: string;
  partyId: string | IParty;
  collectionDate: string;
  hatName: string;
  lineItems: ILineItem[];
  totalThan: number;
  totalFolding: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  deleteRequested?: boolean;
  deleteRequestedBy?: string | { _id: string; name: string };
  deleteRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  _id: string;
  partyId: string | IParty;
  date: string;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDamageClaim {
  _id: string;
  partyId: string | IParty;
  collectionRef?: string;
  claimDate: string;
  damagedPieces: number;
  pricePerPiece: number;
  totalClaim: number;
  status: DamageStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  deleteRequested?: boolean;
  deleteRequestedBy?: string | { _id: string; name: string };
  deleteRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  role: UserRole;
  partyId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ILedgerEntry {
  date: string;
  type: "collection" | "payment" | "damage";
  description: string;
  debit: number;
  credit: number;
  balance: number;
  refId: string;
}

export interface ILedgerSummary {
  partyId: string;
  partyName: string;
  totalCharge: number;
  totalPaid: number;
  totalDamageCredit: number;
  totalDue: number;
  entries: ILedgerEntry[];
}

export interface IPartyDue {
  party: IParty;
  totalDue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// Auth
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

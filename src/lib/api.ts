// src/lib/api.ts
import type { ApiResponse } from "@/types";
import axios, { AxiosError } from "axios";

// ── Axios API instance ───────────────────────────────────────────
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const baseURL = /\/api\/?$/.test(rawBase)
  ? rawBase.replace(/\/$/, "")
  : `${rawBase.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor: attach token ────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lungi_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ── Response interceptor: handle 401 ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("lungi_token");
        localStorage.removeItem("lungi_user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// ── Export Axios instance ───────────────────────────────────────
export default api;

// ── Helper to extract error message ──────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<null> | undefined;

    return data?.message || error.message || "কিছু একটা ভুল হয়েছে";
  }

  return "কিছু একটা ভুল হয়েছে";
}

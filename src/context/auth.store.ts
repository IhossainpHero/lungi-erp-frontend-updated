// src/context/auth.store.ts
import api from "@/lib/api";
import type { IUser } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ... login:
      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", { phone, password });
          const { token, user } = res.data.data;
          localStorage.setItem("lungi_token", token);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ... register:
      register: async (name, phone, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/register", {
            name,
            phone,
            password,
          });
          const { token, user } = res.data.data;
          localStorage.setItem("lungi_token", token);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("lungi_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      loadUser: async () => {
        const token = localStorage.getItem("lungi_token");
        if (!token) return;
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data.data, isAuthenticated: true, token });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "lungi-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

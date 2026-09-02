# লুঙ্গি ERP — Frontend (Next.js 14)

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript** — backend types-এর সাথে exact match
- **Tailwind CSS** — Bengali-themed custom design system
- **TanStack Query** — server state management
- **Zustand** — auth global state (persisted)
- **React Hook Form** — form validation
- **Axios** — HTTP client with interceptors
- **react-hot-toast** — notifications

---

## Setup

```bash
# 1. Clone & install
npm install

# 2. Environment
cp .env.local.example .env.local
# .env.local তে backend URL সেট করুন:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 3. Dev server
npm run dev
```

App চালু হবে: http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/      → Login page (no sidebar)
│   ├── dashboard/         → ড্যাশবোর্ড
│   ├── parties/           → পার্টি তালিকা + [id] detail
│   ├── collections/       → কালেকশন
│   ├── payments/          → পেমেন্ট
│   ├── damage/            → ড্যামেজ ক্লেইম
│   └── services/          → সার্ভিস (admin only)
├── components/
│   ├── Sidebar.tsx        → Dark sidebar with nav
│   ├── Topbar.tsx         → Header with page title
│   ├── DashboardShell.tsx → Layout wrapper
│   └── ProtectedLayout.tsx→ Auth guard wrapper
├── context/
│   └── auth.store.ts      → Zustand auth store
├── hooks/
│   └── useAuth.ts         → Auth guards
├── lib/
│   └── api.ts             → Axios instance
└── types/
    └── index.ts           → TypeScript types (mirrors backend)
```

---

## API Endpoints Used

| Route | Endpoint |
|-------|----------|
| Login | `POST /api/auth/login` |
| Me | `GET /api/auth/me` |
| Parties | `GET /api/parties` |
| Party Detail | `GET /api/parties/:id` |
| Party Ledger | `GET /api/parties/:id/ledger` |
| Parties Dues | `GET /api/parties/dues` |
| Collections | `GET /api/collections` |
| Payments | `GET /api/payments` |
| Damage | `GET /api/damage` |
| Damage Status | `PATCH /api/damage/:id/status` |
| Services | `GET /api/services` |
| Service Rate | `PUT /api/services/:id` |

---

## Auth Flow
1. `/login` → Phone + Password → JWT token
2. Token stored in `localStorage` (key: `lungi_token`)
3. Zustand `persist` middleware → state survives refresh
4. Axios interceptor → auto-attach `Bearer` token
5. 401 response → auto logout + redirect to `/login`
6. `useRequireAuth()` hook → protects all dashboard routes

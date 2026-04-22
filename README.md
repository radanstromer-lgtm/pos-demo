# Lumière Skin & Beauty POS — Next.js

Mobile-first POS untuk klinik kecantikan dengan 3 cabang. Versi standalone Next.js 14 (App Router) dari aplikasi POS Lumière.

## Fitur

- **Beranda** — ringkasan harian, grafik tren penjualan, item terpopuler, transaksi terakhir
- **Kasir (POS)** — pilih layanan/produk, keranjang, checkout (Tunai/QRIS/Kartu), animasi sukses
- **Riwayat Transaksi** + struk detail
- **Janji Temu** — filter status, ubah status, tambah janji baru
- **Pelanggan** — pencarian, profil, riwayat medis, poin loyalti
- **Inventaris** — per cabang dengan peringatan stok menipis
- Pemilih cabang persisten (localStorage), Bahasa Indonesia, format Rupiah (id-ID)

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS 3 + shadcn/ui (Radix)
- TanStack Query v5
- Drizzle ORM + PostgreSQL (`pg`)
- framer-motion, recharts, date-fns (locale `id`), sonner, zod

## Struktur

```
app/
  api/                 # Route handlers (REST API)
    branches/
    customers/[id]/
    items/
    inventory/low-stock/
    appointments/[id]/status/
    transactions/[id]/
    dashboard/{summary,sales-trend,top-items}/
  page.tsx             # Dashboard
  pos/
  transactions/[id]/
  appointments/
  customers/[id]/
  inventory/
  layout.tsx           # Root layout + Providers
  providers.tsx        # QueryClient + BranchProvider + Layout shell
  globals.css

components/
  layout.tsx           # Header + BottomNav (mobile)
  ui/                  # shadcn/ui (55 komponen)

lib/
  api.ts               # fetch + React Query hooks
  branch-store.tsx     # context cabang + localStorage
  utils.ts             # cn, formatCurrency, formatDate
  validators.ts        # zod schemas

db/
  index.ts             # Drizzle client (pg Pool)
  schema.ts            # tabel & enum
  seed.ts              # data demo

drizzle.config.ts
tailwind.config.ts
```

## Cara menjalankan

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set DATABASE_URL** di `.env.local`:
   ```
   DATABASE_URL=postgres://user:password@localhost:5432/lumiere
   ```

3. **Push skema ke database**
   ```bash
   npm run db:push
   ```

4. **Seed data demo** (opsional)
   ```bash
   npm run db:seed
   ```

5. **Jalankan dev server**
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000

## Build production

```bash
npm run build
npm start
```

## Catatan migrasi dari versi React+Vite

- Routing `wouter` → `next/link` + `next/navigation` (`usePathname`, `useParams`)
- Backend Express terpisah → Next.js Route Handlers (`app/api/**/route.ts`)
- Codegen Orval → fetch wrappers manual di `lib/api.ts` (signature hook tetap mirip)
- Tailwind v4 (`@import "tailwindcss"`) → Tailwind v3 (`@tailwind base/components/utilities`)
- Semua komponen shadcn/ui dipertahankan apa adanya

## Endpoint API

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/branches` | Daftar cabang |
| GET/POST | `/api/customers` | Daftar / tambah pelanggan |
| GET | `/api/customers/:id` | Detail pelanggan |
| GET | `/api/items?category=service\|product` | Daftar item |
| GET | `/api/inventory?branchId=` | Stok per cabang |
| GET | `/api/inventory/low-stock?branchId=` | Stok menipis |
| GET/POST | `/api/appointments` | Janji temu |
| PATCH | `/api/appointments/:id/status` | Ubah status |
| GET/POST | `/api/transactions` | Transaksi |
| GET | `/api/transactions/:id` | Detail transaksi |
| GET | `/api/dashboard/summary` | Statistik harian |
| GET | `/api/dashboard/sales-trend?days=7` | Grafik penjualan |
| GET | `/api/dashboard/top-items?limit=5` | Item terlaris |
# pos-demo

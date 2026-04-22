"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

function qs(params: Record<string, any>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  const s = usp.toString();
  return s ? `?${s}` : "";
}

/* ---------- Types ---------- */
export type Branch = { id: string; name: string; address: string | null; phone: string | null };
export type Customer = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  medicalHistory: string | null;
  points: number;
  createdAt: string | null;
};
export type Item = {
  id: string;
  name: string;
  category: "service" | "product";
  price: number;
  sku: string | null;
  isAvailable: boolean;
  imageUrl: string | null;
  description: string | null;
  durationMinutes: number | null;
};
export type InventoryRow = {
  id: string;
  branchId: string;
  itemId: string;
  stockQuantity: number;
  lowStockThreshold: number;
  item: Item;
};
export type Appointment = {
  id: string;
  customerId: string;
  branchId: string;
  serviceId: string;
  staffId: string | null;
  scheduledAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  customerName: string | null;
  serviceName: string | null;
  branchName: string | null;
  staffName: string | null;
};
export type Transaction = {
  id: string;
  branchId: string;
  branchName: string | null;
  customerId: string | null;
  customerName: string | null;
  cashierId: string | null;
  cashierName: string | null;
  totalAmount: number;
  paymentMethod: string | null;
  createdAt: string;
  itemCount: number;
  items?: Array<{
    id: string;
    itemId: string;
    itemName: string | null;
    quantity: number;
    priceAtSale: number;
  }>;
};

export const ItemCategory = { service: "service", product: "product" } as const;

/* ---------- Query keys ---------- */
export const getListBranchesQueryKey = () => ["/api/branches"];
export const getListCustomersQueryKey = (p: { search?: string } = {}) =>
  ["/api/customers", p];
export const getGetCustomerQueryKey = (id: string) => ["/api/customers", id];
export const getListItemsQueryKey = (p: { category?: string } = {}) =>
  ["/api/items", p];
export const getListInventoryQueryKey = (p: { branchId?: string | null }) =>
  ["/api/inventory", p];
export const getListLowStockQueryKey = (p: { branchId?: string | null }) =>
  ["/api/inventory/low-stock", p];
export const getListAppointmentsQueryKey = (p: any = {}) => ["/api/appointments", p];
export const getListTransactionsQueryKey = (p: any = {}) => ["/api/transactions", p];
export const getGetTransactionQueryKey = (id: string) => ["/api/transactions", id];
export const getGetDashboardSummaryQueryKey = (p: any = {}) =>
  ["/api/dashboard/summary", p];
export const getGetSalesTrendQueryKey = (p: any = {}) =>
  ["/api/dashboard/sales-trend", p];
export const getGetTopItemsQueryKey = (p: any = {}) =>
  ["/api/dashboard/top-items", p];

/* ---------- Hooks ---------- */
export function useListBranches() {
  return useQuery({
    queryKey: getListBranchesQueryKey(),
    queryFn: () => request<Branch[]>("/api/branches"),
  });
}

export function useListCustomers(
  params: { search?: string } = {},
  options: { query?: Partial<UseQueryOptions<Customer[]>> } = {},
) {
  return useQuery<Customer[]>({
    queryKey: getListCustomersQueryKey(params),
    queryFn: () => request(`/api/customers${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export function useGetCustomer(
  id: string | undefined,
  options: { query?: Partial<UseQueryOptions<Customer>> } = {},
) {
  return useQuery<Customer>({
    queryKey: getGetCustomerQueryKey(id ?? ""),
    queryFn: () => request(`/api/customers/${id}`),
    enabled: !!id,
    ...(options.query ?? {}),
  });
}

export function useCreateCustomer() {
  return useMutation({
    mutationFn: (body: {
      fullName: string;
      phone?: string | null;
      email?: string | null;
      medicalHistory?: string | null;
    }) =>
      request<Customer>("/api/customers", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useListItems(
  params: { category?: string } = {},
  options: { query?: Partial<UseQueryOptions<Item[]>> } = {},
) {
  return useQuery<Item[]>({
    queryKey: getListItemsQueryKey(params),
    queryFn: () => request(`/api/items${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export function useListInventory(
  params: { branchId?: string | null },
  options: { query?: Partial<UseQueryOptions<InventoryRow[]>> } = {},
) {
  return useQuery<InventoryRow[]>({
    queryKey: getListInventoryQueryKey(params),
    queryFn: () => request(`/api/inventory${qs(params)}`),
    enabled: !!params.branchId,
    ...(options.query ?? {}),
  });
}

export function useListLowStock(
  params: { branchId?: string | null },
  options: { query?: Partial<UseQueryOptions<InventoryRow[]>> } = {},
) {
  return useQuery<InventoryRow[]>({
    queryKey: getListLowStockQueryKey(params),
    queryFn: () => request(`/api/inventory/low-stock${qs(params)}`),
    enabled: !!params.branchId,
    ...(options.query ?? {}),
  });
}

export function useListAppointments(
  params: { branchId?: string | null; status?: string } = {},
  options: { query?: Partial<UseQueryOptions<Appointment[]>> } = {},
) {
  return useQuery<Appointment[]>({
    queryKey: getListAppointmentsQueryKey(params),
    queryFn: () => request(`/api/appointments${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export function useCreateAppointment() {
  return useMutation({
    mutationFn: (body: {
      customerId: string;
      branchId: string;
      serviceId: string;
      staffId?: string | null;
      scheduledAt: string;
    }) =>
      request<Appointment>("/api/appointments", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useUpdateAppointmentStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      request<Appointment>(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  });
}

export function useListTransactions(
  params: { branchId?: string | null; limit?: number } = {},
  options: { query?: Partial<UseQueryOptions<Transaction[]>> } = {},
) {
  return useQuery<Transaction[]>({
    queryKey: getListTransactionsQueryKey(params),
    queryFn: () => request(`/api/transactions${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export function useGetTransaction(
  id: string | undefined,
  options: { query?: Partial<UseQueryOptions<Transaction>> } = {},
) {
  return useQuery<Transaction>({
    queryKey: getGetTransactionQueryKey(id ?? ""),
    queryFn: () => request(`/api/transactions/${id}`),
    enabled: !!id,
    ...(options.query ?? {}),
  });
}

export function useCreateTransaction() {
  return useMutation({
    mutationFn: (body: {
      branchId: string;
      customerId?: string | null;
      cashierId?: string | null;
      totalAmount: number;
      paymentMethod?: string | null;
      items: Array<{ itemId: string; quantity: number; priceAtSale: number }>;
    }) =>
      request<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useGetDashboardSummary(
  params: { branchId?: string | null } = {},
  options: { query?: Partial<UseQueryOptions<any>> } = {},
) {
  return useQuery({
    queryKey: getGetDashboardSummaryQueryKey(params),
    queryFn: () => request(`/api/dashboard/summary${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export function useGetSalesTrend(
  params: { branchId?: string | null; days?: number } = {},
  options: { query?: Partial<UseQueryOptions<any>> } = {},
) {
  return useQuery({
    queryKey: getGetSalesTrendQueryKey(params),
    queryFn: () => request(`/api/dashboard/sales-trend${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export function useGetTopItems(
  params: { branchId?: string | null; limit?: number } = {},
  options: { query?: Partial<UseQueryOptions<any>> } = {},
) {
  return useQuery({
    queryKey: getGetTopItemsQueryKey(params),
    queryFn: () => request(`/api/dashboard/top-items${qs(params)}`),
    ...(options.query ?? {}),
  });
}

export { useQueryClient };

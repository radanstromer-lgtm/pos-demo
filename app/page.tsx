"use client";

import Link from "next/link";
import { useBranch } from "@/lib/branch-store";
import {
  useGetDashboardSummary,
  useGetSalesTrend,
  useGetTopItems,
  useListTransactions,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | React.ReactNode;
  icon: any;
  loading?: boolean;
}) {
  return (
    <Card className="transition-shadow overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-[0.03] pointer-events-none">
        <Icon className="w-24 h-24" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-7 w-20" /> : <div className="text-xl font-bold tracking-tight">{value}</div>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { branchId, isReady } = useBranch();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary(
    { branchId },
    { query: { enabled: !!branchId } },
  );
  const { data: trend, isLoading: trendLoading } = useGetSalesTrend(
    { branchId, days: 7 },
    { query: { enabled: !!branchId } },
  );
  const { data: topItems, isLoading: topItemsLoading } = useGetTopItems(
    { branchId, limit: 5 },
    { query: { enabled: !!branchId } },
  );
  const { data: transactions, isLoading: transactionsLoading } = useListTransactions(
    { branchId, limit: 5 },
    { query: { enabled: !!branchId } },
  );

  if (!isReady || !branchId) {
    return (
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-6 pb-8">
      <div>
        <h2 className="font-serif text-2xl font-bold">Halo, Selamat Datang</h2>
        <p className="text-sm text-muted-foreground">Ringkasan klinik hari ini.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Pendapatan" value={formatCurrency(summary?.todayRevenue || 0)} icon={DollarSign} loading={summaryLoading} />
        <StatCard title="Transaksi" value={summary?.todayTransactions || 0} icon={CreditCard} loading={summaryLoading} />
        <StatCard title="Janji Temu" value={summary?.todayAppointments || 0} icon={Calendar} loading={summaryLoading} />
        <StatCard
          title="Stok Menipis"
          value={
            <span className={(summary?.lowStockCount || 0) > 0 ? "text-destructive flex items-center gap-1" : ""}>
              {summary?.lowStockCount || 0}
              {(summary?.lowStockCount || 0) > 0 && <AlertCircle className="w-3 h-3" />}
            </span>
          }
          icon={Package}
          loading={summaryLoading}
        />
      </div>

      <div className="flex gap-3">
        <Button asChild className="flex-1">
          <Link href="/pos">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Buka Kasir
          </Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <Link href="/appointments">
            <Calendar className="w-4 h-4 mr-2" />
            Tambah Janji
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold">Tren Penjualan</h3>
        <Card className="p-4 pt-6">
          {trendLoading ? (
            <Skeleton className="h-[150px] w-full" />
          ) : (
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                    labelFormatter={(label) => formatDate(label as string, "d MMM")}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold">Item Terpopuler</h3>
        <div className="space-y-2">
          {topItemsLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            : topItems?.length === 0
            ? <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl">Belum ada data</div>
            : topItems?.map((item: any, i: number) => (
                <Card key={i} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
                    <div>
                      <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.totalQuantity} terjual</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">{formatCurrency(item.totalRevenue)}</p>
                </Card>
              ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">Transaksi Terakhir</h3>
          <Link href="/transactions" className="text-xs text-primary font-medium">Lihat Semua</Link>
        </div>
        <div className="space-y-2">
          {transactionsLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            : transactions?.length === 0
            ? <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl">Belum ada transaksi</div>
            : transactions?.map((tx) => (
                <Link key={tx.id} href={`/transactions/${tx.id}`}>
                  <Card className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tx.customerName || "Walk-in"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt, "HH:mm")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatCurrency(tx.totalAmount)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{tx.paymentMethod}</p>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}

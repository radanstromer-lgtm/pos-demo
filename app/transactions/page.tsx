"use client";

import Link from "next/link";
import { useBranch } from "@/lib/branch-store";
import { useListTransactions } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const { branchId, isReady } = useBranch();
  const { data: transactions, isLoading } = useListTransactions(
    { branchId },
    { query: { enabled: !!branchId } },
  );

  if (!isReady || !branchId) {
    return <div className="p-4"><Skeleton className="h-10 w-full mb-4" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 px-4 pb-2 border-b">
        <h2 className="font-serif text-2xl font-bold">Riwayat Transaksi</h2>
        <p className="text-sm text-muted-foreground">Semua transaksi di cabang ini</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : transactions?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <FileText className="w-12 h-12 mb-3 text-muted-foreground/50" />
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          transactions?.map((tx) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <Card className="p-4 flex items-center justify-between cursor-pointer transition-colors active:bg-muted/50">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary-foreground">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{tx.customerName || "Walk-in Customer"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatDate(tx.createdAt, "d MMM, HH:mm")}</span>
                      <span>•</span>
                      <span>{tx.itemCount} item</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-bold text-primary">{formatCurrency(tx.totalAmount)}</p>
                  <Badge variant="outline" className="text-[10px] uppercase">{tx.paymentMethod}</Badge>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

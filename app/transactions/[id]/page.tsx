"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetTransaction } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: tx, isLoading } = useGetTransaction(id);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!tx) return <div className="p-4 text-center mt-10">Transaksi tidak ditemukan.</div>;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
            <Link href="/transactions"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="font-serif text-lg font-bold">Detail Transaksi</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><Share2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><Printer className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-card border shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="text-center mb-6 border-b pb-6 border-dashed">
            <h1 className="font-serif text-2xl font-bold text-primary mb-1">Lumière</h1>
            <p className="text-sm font-medium">{tx.branchName}</p>
            <p className="text-xs text-muted-foreground mt-2">{formatDate(tx.createdAt)}</p>
            <p className="text-xs text-muted-foreground">ID: {tx.id.split("-")[0].toUpperCase()}</p>
          </div>

          <div className="space-y-4 mb-6 border-b pb-6 border-dashed">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pelanggan</span><span className="font-medium text-right">{tx.customerName || "Walk-in"}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Kasir</span><span className="font-medium text-right">{tx.cashierName || "-"}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Metode Pembayaran</span><span className="font-medium text-right uppercase">{tx.paymentMethod}</span></div>
          </div>

          <div className="space-y-4 mb-6 border-b pb-6 border-dashed">
            <h3 className="font-bold text-sm mb-3">Item Pembelian</h3>
            {tx.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm items-start">
                <div className="flex-1 pr-4">
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.priceAtSale)}</p>
                </div>
                <div className="font-bold">{formatCurrency(item.quantity * item.priceAtSale)}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">{formatCurrency(tx.totalAmount)}</span>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useBranch } from "@/lib/branch-store";
import { useListInventory, ItemCategory } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PackageOpen, AlertCircle, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function InventoryPage() {
  const { branchId, isReady } = useBranch();
  const [category, setCategory] = useState<"product" | "service">("product");
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  const { data: inventory, isLoading } = useListInventory(
    { branchId },
    { query: { enabled: !!branchId } },
  );

  const filtered = inventory?.filter((inv) => {
    const matchesSearch =
      inv.item.name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.item.sku && inv.item.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = inv.item.category === category;
    const matchesLow = showLowStock ? inv.stockQuantity <= inv.lowStockThreshold : true;
    return matchesSearch && matchesCategory && matchesLow;
  });

  if (!isReady || !branchId) {
    return <div className="p-4"><Skeleton className="h-10 w-full mb-4" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 px-4 pb-3 border-b space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-bold">Inventaris</h2>
          <p className="text-sm text-muted-foreground">Pantau stok barang</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama barang atau SKU..." className="pl-9 bg-muted/50 border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Tabs value={category} onValueChange={(v) => setCategory(v as any)} className="w-48">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={ItemCategory.product}>Produk</TabsTrigger>
              <TabsTrigger value={ItemCategory.service}>Bahan</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center space-x-2">
            <Switch id="low-stock" checked={showLowStock} onCheckedChange={setShowLowStock} />
            <Label htmlFor="low-stock" className="text-xs flex items-center gap-1 cursor-pointer">
              <TrendingDown className="w-3 h-3 text-destructive" />Menipis
            </Label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
            <PackageOpen className="w-16 h-16 mb-4 text-muted-foreground/30" />
            <p className="font-medium text-lg">Kosong</p>
            <p className="text-sm">Tidak ada data inventaris yang sesuai.</p>
          </div>
        ) : (
          filtered?.map((inv) => {
            const isLow = inv.stockQuantity <= inv.lowStockThreshold;
            return (
              <Card key={inv.id} className={`p-4 flex items-center justify-between transition-colors ${isLow ? "border-destructive/30 bg-destructive/5" : ""}`}>
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded bg-muted flex items-center justify-center font-bold text-lg ${isLow ? "text-destructive bg-destructive/10" : "text-muted-foreground"}`}>
                    {inv.item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold line-clamp-1">{inv.item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">SKU: {inv.item.sku || "-"}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${isLow ? "text-destructive" : ""}`}>{inv.stockQuantity}</span>
                    <span className="text-xs text-muted-foreground">/ {inv.lowStockThreshold}</span>
                  </div>
                  {isLow && (
                    <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 h-5 flex items-center">
                      <AlertCircle className="w-3 h-3" />Menipis
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

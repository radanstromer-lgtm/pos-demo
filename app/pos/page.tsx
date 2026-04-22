"use client";

import { useState } from "react";
import { useBranch } from "@/lib/branch-store";
import {
  useListItems,
  useCreateTransaction,
  getListTransactionsQueryKey,
  useListCustomers,
  ItemCategory,
  type Item,
  useQueryClient,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  CheckCircle2,
  User,
  Package,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CartItem extends Item {
  quantity: number;
}

export default function POSPage() {
  const { branchId, isReady } = useBranch();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<"service" | "product">("service");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Tunai");

  const { data: items, isLoading: itemsLoading } = useListItems({ category });
  const { data: customers } = useListCustomers();
  const createTransaction = useCreateTransaction();

  const filteredItems = items?.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) && i.isAvailable,
  );

  const addToCart = (item: Item) =>
    setCart((prev) => {
      const e = prev.find((i) => i.id === item.id);
      if (e) return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...item, quantity: 1 }];
    });

  const updateQuantity = (id: string, delta: number) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)),
    );

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    if (!branchId || cart.length === 0) return;
    createTransaction.mutate(
      {
        branchId,
        customerId: selectedCustomerId,
        totalAmount,
        paymentMethod,
        items: cart.map((it) => ({ itemId: it.id, quantity: it.quantity, priceAtSale: it.price })),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
          setIsSuccessOpen(true);
        },
      },
    );
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedCustomerId(null);
    setPaymentMethod("Tunai");
    setIsSuccessOpen(false);
  };

  if (!isReady || !branchId) {
    return <div className="p-4"><Skeleton className="h-10 w-full" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 px-4 pb-2 space-y-4">
        <h2 className="font-serif text-2xl font-bold">Kasir</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk atau layanan..."
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={category} onValueChange={(v) => setCategory(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={ItemCategory.service}>Layanan</TabsTrigger>
            <TabsTrigger value={ItemCategory.product}>Produk</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {itemsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : filteredItems?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <Package className="w-12 h-12 mb-3 text-muted-foreground/50" />
            <p>Tidak ada item ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems?.map((item) => (
              <motion.div key={item.id} whileTap={{ scale: 0.96 }}>
                <Card className="overflow-hidden cursor-pointer h-full flex flex-col" onClick={() => addToCart(item)}>
                  <div className="aspect-square bg-muted/30 relative flex items-center justify-center text-primary/40">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-4xl font-bold opacity-50">{item.name.charAt(0)}</span>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <p className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{item.name}</p>
                    <p className="text-primary font-bold text-sm">{formatCurrency(item.price)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <div className="max-w-md mx-auto">
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full bg-primary text-primary-foreground shadow-lg rounded-full py-3 px-5 flex items-center justify-between font-semibold"
              onClick={() => setIsCartOpen(true)}
            >
              <div className="flex items-center gap-2">
                <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-xs">{totalItems}</div>
                <span>Item</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(totalAmount)}</span>
                <ShoppingCart className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        </div>
      )}

      <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>Keranjang ({totalItems})</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                  <p className="text-primary font-bold text-xs">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-1 py-1">
                  <button className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-sm" onClick={() => updateQuantity(item.id, -1)}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-sm" onClick={() => updateQuantity(item.id, 1)}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button className="text-muted-foreground p-1" onClick={() => removeFromCart(item.id)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <DrawerFooter className="border-t bg-background">
            <div className="flex justify-between font-bold text-lg mb-2">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
            <Button size="lg" className="w-full font-bold text-md" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
              Lanjut ke Pembayaran
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle>Pembayaran</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-muted-foreground">Pelanggan (Opsional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  className="w-full h-10 pl-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedCustomerId || ""}
                  onChange={(e) => setSelectedCustomerId(e.target.value || null)}
                >
                  <option value="">Walk-in Customer</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} - {c.phone || "-"}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Metode Pembayaran</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-2">
                {["Tunai", "QRIS", "Kartu"].map((method) => (
                  <div key={method}>
                    <RadioGroupItem value={method} id={method} className="peer sr-only" />
                    <Label
                      htmlFor={method}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-center cursor-pointer"
                    >
                      {method}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Total Tagihan</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <DrawerFooter className="border-t bg-background">
            <Button size="lg" className="w-full font-bold text-md" onClick={handleCheckout} disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Memproses..." : "Konfirmasi Pembayaran"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {isSuccessOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <h2 className="font-serif text-3xl font-bold mb-2">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground mb-8">Transaksi telah disimpan ke sistem.</p>
            <div className="bg-muted/30 w-full max-w-sm p-6 rounded-2xl mb-8 space-y-2">
              <p className="text-sm text-muted-foreground">Total Pembayaran</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
              <p className="text-sm font-medium mt-4">{paymentMethod}</p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <Button size="lg" variant="outline" className="w-full font-bold">Cetak Struk</Button>
              <Button size="lg" className="w-full font-bold" onClick={resetPOS}>Transaksi Baru</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

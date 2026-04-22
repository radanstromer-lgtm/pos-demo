"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useListCustomers,
  getListCustomersQueryKey,
  useCreateCustomer,
  useQueryClient,
} from "@/lib/api";
import { Search, UserPlus, Phone, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newHistory, setNewHistory] = useState("");

  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomer();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data: customers, isLoading } = useListCustomers(
    { search: debouncedSearch || undefined },
  );

  const handleCreate = () => {
    if (!newName) return;
    createCustomer.mutate(
      {
        fullName: newName,
        phone: newPhone || undefined,
        email: newEmail || undefined,
        medicalHistory: newHistory || undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          toast.success("Pelanggan berhasil ditambahkan");
          setIsCreateOpen(false);
          setNewName(""); setNewPhone(""); setNewEmail(""); setNewHistory("");
        },
        onError: () => toast.error("Gagal menambahkan pelanggan"),
      },
    );
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 px-4 pb-2 border-b">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">Pelanggan</h2>
            <p className="text-sm text-muted-foreground">Kelola database pasien</p>
          </div>
          <Button size="icon" className="rounded-full shadow-md w-10 h-10 shrink-0" onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, email, atau telepon..." className="pl-9 bg-muted/50 border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : customers?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-lg">Tidak ada pelanggan</p>
            <p className="text-sm">Coba kata kunci lain atau tambah baru.</p>
          </div>
        ) : (
          customers?.map((customer) => {
            const initials = customer.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
            return (
              <Link key={customer.id} href={`/customers/${customer.id}`}>
                <Card className="p-3 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">{initials}</div>
                    <div>
                      <p className="font-bold">{customer.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" /><span>{customer.phone || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold">
                    <Star className="w-3 h-3 fill-secondary-foreground" />{customer.points}
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Tambah Pelanggan Baru</DrawerTitle></DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2"><Label>Nama Lengkap *</Label><Input placeholder="Misal: Jane Doe" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Nomor Telepon</Label><Input placeholder="Misal: 08123456789" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input placeholder="Misal: jane@example.com" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label>Riwayat Medis / Alergi</Label><Textarea placeholder="Catatan riwayat medis atau alergi pelanggan..." value={newHistory} onChange={(e) => setNewHistory(e.target.value)} /></div>
          </div>
          <DrawerFooter>
            <Button onClick={handleCreate} disabled={createCustomer.isPending || !newName}>
              {createCustomer.isPending ? "Menyimpan..." : "Simpan Pelanggan"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

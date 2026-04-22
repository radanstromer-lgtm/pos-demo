"use client";

import { useState } from "react";
import { useBranch } from "@/lib/branch-store";
import {
  useListAppointments,
  getListAppointmentsQueryKey,
  useUpdateAppointmentStatus,
  useCreateAppointment,
  useListCustomers,
  useListItems,
  ItemCategory,
  useQueryClient,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock, User, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};
const statusLabels: Record<string, string> = {
  pending: "Menunggu", confirmed: "Dikonfirmasi", completed: "Selesai", cancelled: "Batal",
};

export default function AppointmentsPage() {
  const { branchId, isReady } = useBranch();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<string>("all");
  const [selectedApt, setSelectedApt] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAptCustomer, setNewAptCustomer] = useState("");
  const [newAptService, setNewAptService] = useState("");
  const [newAptDate, setNewAptDate] = useState("");

  const params = { branchId, ...(filter !== "all" ? { status: filter } : {}) };
  const { data: appointments, isLoading } = useListAppointments(params, {
    query: { enabled: !!branchId },
  });
  const { data: customers } = useListCustomers();
  const { data: services } = useListItems({ category: ItemCategory.service });

  const updateStatus = useUpdateAppointmentStatus();
  const createAppointment = useCreateAppointment();

  const handleCreate = () => {
    if (!branchId || !newAptCustomer || !newAptService || !newAptDate) return;
    createAppointment.mutate(
      {
        branchId,
        customerId: newAptCustomer,
        serviceId: newAptService,
        scheduledAt: new Date(newAptDate).toISOString(),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          toast.success("Janji temu berhasil dibuat");
          setIsCreateOpen(false);
          setNewAptCustomer(""); setNewAptService(""); setNewAptDate("");
        },
        onError: () => toast.error("Gagal membuat janji temu"),
      },
    );
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast.success(`Status janji temu diperbarui menjadi ${statusLabels[status]}`);
        setIsDrawerOpen(false);
      },
      onError: () => toast.error("Gagal memperbarui status"),
    });
  };

  const filters = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Menunggu" },
    { value: "confirmed", label: "Dikonfirmasi" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Batal" },
  ];

  if (!isReady || !branchId) {
    return <div className="p-4"><Skeleton className="h-10 w-full mb-4" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 pb-2 border-b">
        <div className="px-4 mb-3 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold">Janji Temu</h2>
            <p className="text-sm text-muted-foreground">Kelola jadwal perawatan</p>
          </div>
          <Button size="icon" className="rounded-full shadow-md w-10 h-10 shrink-0" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 px-4 pb-3">
            {filters.map((f) => (
              <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : appointments?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
            <CalendarIcon className="w-16 h-16 mb-4 text-muted-foreground/30" />
            <p className="font-medium text-lg">Tidak ada jadwal</p>
            <p className="text-sm">Belum ada janji temu untuk filter ini.</p>
          </div>
        ) : (
          appointments?.map((apt, index) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card
                className="overflow-hidden cursor-pointer border-l-4"
                style={{ borderLeftColor: apt.status === "completed" ? "hsl(150,50%,50%)" : apt.status === "cancelled" ? "hsl(0,60%,50%)" : "hsl(var(--primary))" }}
                onClick={() => { setSelectedApt(apt); setIsDrawerOpen(true); }}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-base line-clamp-1">{apt.customerName}</p>
                        <p className="text-sm text-primary font-medium">{apt.serviceName}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[apt.status]}>{statusLabels[apt.status]}</Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                      <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>{formatDate(apt.scheduledAt)}</span></div>
                      {apt.staffName && (
                        <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /><span>Terapis: {apt.staffName}</span></div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground self-center opacity-50" />
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Detail Janji Temu</DrawerTitle></DrawerHeader>
          {selectedApt && (
            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <div><p className="text-sm text-muted-foreground">Pelanggan</p><p className="font-bold text-lg">{selectedApt.customerName}</p></div>
                <div><p className="text-sm text-muted-foreground">Layanan</p><p className="font-medium text-primary">{selectedApt.serviceName}</p></div>
                <div><p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-medium flex items-center gap-2 mt-1"><CalendarIcon className="w-4 h-4 text-muted-foreground" />{formatDate(selectedApt.scheduledAt)}</p>
                </div>
                <div><p className="text-sm text-muted-foreground">Status Saat Ini</p>
                  <Badge variant="outline" className={`mt-1 ${statusColors[selectedApt.status]}`}>{statusLabels[selectedApt.status]}</Badge>
                </div>
              </div>
              <div className="space-y-3 border-t pt-6">
                <p className="text-sm font-bold">Ubah Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50" onClick={() => handleUpdateStatus(selectedApt.id, "confirmed")} disabled={selectedApt.status === "confirmed" || updateStatus.isPending}>Konfirmasi</Button>
                  <Button variant="outline" className="border-green-200 text-green-700 bg-green-50" onClick={() => handleUpdateStatus(selectedApt.id, "completed")} disabled={selectedApt.status === "completed" || updateStatus.isPending}>Selesai</Button>
                  <Button variant="outline" className="col-span-2 border-red-200 text-red-700 bg-red-50" onClick={() => handleUpdateStatus(selectedApt.id, "cancelled")} disabled={selectedApt.status === "cancelled" || updateStatus.isPending}>Batalkan</Button>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Tambah Janji Temu</DrawerTitle></DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Pelanggan</Label>
              <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={newAptCustomer} onChange={(e) => setNewAptCustomer(e.target.value)}>
                <option value="" disabled>Pilih Pelanggan</option>
                {customers?.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Layanan</Label>
              <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={newAptService} onChange={(e) => setNewAptService(e.target.value)}>
                <option value="" disabled>Pilih Layanan</option>
                {services?.map((s) => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Waktu</Label>
              <Input type="datetime-local" value={newAptDate} onChange={(e) => setNewAptDate(e.target.value)} />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleCreate} disabled={createAppointment.isPending || !newAptCustomer || !newAptService || !newAptDate}>
              {createAppointment.isPending ? "Menyimpan..." : "Simpan Janji Temu"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

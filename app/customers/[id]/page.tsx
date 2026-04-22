"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetCustomer } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, Clock, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: customer, isLoading } = useGetCustomer(id);

  if (isLoading) {
    return <div className="p-4 space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64 w-full rounded-2xl" /></div>;
  }
  if (!customer) return <div className="p-4 text-center mt-10">Pelanggan tidak ditemukan.</div>;

  const initials = customer.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
            <Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="font-serif text-lg font-bold">Profil Pelanggan</h2>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs h-8">Edit</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card border rounded-3xl p-6 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-secondary/20" />
          <div className="w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center text-primary font-serif text-3xl font-bold shadow-sm z-10 mt-4 mb-4">{initials}</div>
          <h1 className="font-serif text-2xl font-bold mb-1 z-10">{customer.fullName}</h1>
          <p className="text-sm text-muted-foreground mb-4 z-10 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />Member sejak {customer.createdAt ? formatDate(customer.createdAt, "MMM yyyy") : "-"}
          </p>
          <div className="bg-secondary/10 text-secondary-foreground px-4 py-2 rounded-full inline-flex items-center gap-2 font-bold mb-2">
            <Star className="w-4 h-4 fill-secondary-foreground" />{customer.points} Poin Reward
          </div>
        </div>

        <div className="grid gap-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Kontak</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-xs text-muted-foreground">Nomor Telepon</p><p className="font-medium">{customer.phone || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{customer.email || "-"}</p></div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-primary flex items-center gap-2"><FileText className="w-4 h-4" /> Riwayat Medis & Catatan</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{customer.medicalHistory || "Tidak ada catatan medis."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

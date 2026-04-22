"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Calendar, Users, Package, Store } from "lucide-react";
import { useBranch } from "@/lib/branch-store";
import { useListBranches } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function BottomNav() {
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: "Beranda", icon: LayoutDashboard },
    { href: "/pos", label: "Kasir", icon: ShoppingBag },
    { href: "/appointments", label: "Jadwal", icon: Calendar },
    { href: "/customers", label: "Pelanggan", icon: Users },
    { href: "/inventory", label: "Stok", icon: Package },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors cursor-pointer",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Header() {
  const { branchId, setBranchId } = useBranch();
  const { data: branches, isLoading } = useListBranches();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border h-14 flex items-center px-4">
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold tracking-tight text-primary">Lumière</h1>
        <Select value={branchId || ""} onValueChange={setBranchId} disabled={isLoading}>
          <SelectTrigger className="w-[140px] h-8 text-xs border-none bg-muted/50 focus:ring-0 focus:ring-offset-0">
            <Store className="w-3 h-3 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Pilih Cabang" />
          </SelectTrigger>
          <SelectContent>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id} className="text-xs">
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full max-w-md mx-auto pb-20 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}

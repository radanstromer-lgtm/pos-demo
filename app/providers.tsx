"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BranchProvider } from "@/lib/branch-store";
import { Layout } from "@/components/layout";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <BranchProvider>
          <Layout>{children}</Layout>
          <Toaster position="top-center" richColors />
        </BranchProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

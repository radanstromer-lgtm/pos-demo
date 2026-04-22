"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useListBranches } from "@/lib/api";

interface BranchContextType {
  branchId: string | null;
  setBranchId: (id: string) => void;
  isReady: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branchId, setBranchState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { data: branches } = useListBranches();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("lumiere_branch_id") : null;
    if (stored) setBranchState(stored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && !branchId && branches && branches.length > 0) {
      const id = branches[0].id;
      setBranchState(id);
      localStorage.setItem("lumiere_branch_id", id);
    }
  }, [isReady, branchId, branches]);

  const setBranchId = (id: string) => {
    setBranchState(id);
    localStorage.setItem("lumiere_branch_id", id);
  };

  return (
    <BranchContext.Provider value={{ branchId, setBranchId, isReady }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used within a BranchProvider");
  return ctx;
}

"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, Check, Plus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  is24_7: boolean;
}

const DEMO_BRANCHES: Branch[] = [
  {
    id: "central",
    name: "Hospital Matriz Central 24/7",
    code: "M001",
    city: "San Salvador",
    is24_7: true,
  },
  {
    id: "escalon",
    name: "Clínica Satélite Escalón",
    code: "M002",
    city: "San Salvador Poniente",
    is24_7: false,
  },
  {
    id: "santa-tecla",
    name: "Puesto de Choque & Urgencias",
    code: "M003",
    city: "Santa Tecla",
    is24_7: true,
  },
];

export function BranchSwitcher({ currentBranchId = "central" }: { currentBranchId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(
    DEMO_BRANCHES.find((b) => b.id === currentBranchId) || DEMO_BRANCHES[0]
  );

  const handleSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-left text-xs font-medium text-slate-200 shadow-sm hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white truncate max-w-[150px]">
            {selectedBranch.name}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-emerald-400" />
            {selectedBranch.city} • MH {selectedBranch.code}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200 ml-1",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 z-50 w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sedes Disponibles de la Red
            </div>
            <div className="space-y-1">
              {DEMO_BRANCHES.map((branch) => {
                const isSelected = branch.id === selectedBranch.id;
                return (
                  <button
                    key={branch.id}
                    onClick={() => handleSelect(branch)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                        : "text-slate-300 hover:bg-slate-800"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{branch.name}</span>
                        {branch.is24_7 && (
                          <span className="rounded bg-rose-500/20 text-rose-300 px-1 py-0.2 text-[9px] font-bold">
                            24/7
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {branch.city} | Código MH: {branch.code}
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

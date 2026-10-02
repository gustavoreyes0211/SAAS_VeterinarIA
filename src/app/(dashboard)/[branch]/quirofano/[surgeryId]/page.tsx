import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurgeryById } from "@/lib/actions/surgery";
import { serializeData } from "@/lib/utils";
import { AnesthesiaMonitor } from "@/components/surgery/AnesthesiaMonitor";
import { ChevronLeft, Scissors } from "lucide-react";

interface SurgeryDetailPageProps {
  params: Promise<{
    branch: string;
    surgeryId: string;
  }>;
}

export default async function SurgeryDetailPage({ params }: SurgeryDetailPageProps) {
  const { branch, surgeryId } = await params;
  const surgery = await getSurgeryById(surgeryId);

  if (!surgery) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── BREADCRUMB / REGRESO AL CENTRO QUIRÚRGICO ── */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${branch}/quirofano`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a Centro Quirúrgico
        </Link>

        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
          <Scissors className="h-3.5 w-3.5" />
          <span>QUI-MONITOR</span>
          <span>•</span>
          <span>{(surgery as any).room?.name || "Pabellón Principal"}</span>
        </div>
      </div>

      {/* ── CONSOLA MULTIPARAMÉTRICA Y HOJA DE ANESTESIA EN VIVO ── */}
      <AnesthesiaMonitor
        branchCode={branch}
        surgery={serializeData(surgery) as any}
      />
    </div>
  );
}

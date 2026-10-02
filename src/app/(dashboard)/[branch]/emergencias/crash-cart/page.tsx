import React from "react";
import Link from "next/link";
import { CrashCartCalculator } from "@/components/emergencies/CrashCartCalculator";
import { ArrowLeft, Zap, ShieldAlert, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CrashCartPageProps {
  params: Promise<{
    branch: string;
  }>;
  searchParams: Promise<{
    weight?: string;
    name?: string;
    species?: "CANINE" | "FELINE";
  }>;
}

export default async function CrashCartPage({
  params,
  searchParams,
}: CrashCartPageProps) {
  const { branch } = await params;
  const { weight, name, species } = await searchParams;

  const parsedWeight = weight ? Number(weight) : 12;
  const patientName = name || "Paciente en Reanimación";
  const patientSpecies = species === "FELINE" ? "FELINE" : "CANINE";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── NAVEGACIÓN Y ALERTA SUPERIOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/${branch}/emergencias`}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Semáforo de Triaje VECCS
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md shadow-rose-600/40">
              <Zap className="h-4 w-4 fill-white" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Carrito Rojo (Paro Cardio-Respiratorio CPR RECOVER)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${branch}/uci`}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Ir a Pizarra UCI 24/7
            </Button>
          </Link>
        </div>
      </div>

      {/* ── CALCULADORA Y METRÓNOMO MAESTRO ── */}
      <CrashCartCalculator
        initialWeightKg={parsedWeight}
        patientName={patientName}
        species={patientSpecies}
      />
    </div>
  );
}

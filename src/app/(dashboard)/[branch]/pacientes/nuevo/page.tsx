import React from "react";
import Link from "next/link";
import { getClients } from "@/lib/actions/clients";
import { getBreeds } from "@/lib/actions/patients";
import { PatientForm } from "@/components/patients/PatientForm";
import { ArrowLeft, PawPrint, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NuevoPacientePageProps {
  params: Promise<{
    branch: string;
  }>;
  searchParams: Promise<{
    clientId?: string;
  }>;
}

export default async function NuevoPacientePage({
  params,
  searchParams,
}: NuevoPacientePageProps) {
  const { branch } = await params;
  const { clientId } = await searchParams;

  const clients = await getClients({ branchCode: branch });
  const breeds = await getBreeds();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── BOTÓN VOLVER ── */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-slate-400 hover:text-white gap-1.5"
        >
          <Link href={`/${branch}/pacientes`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al Directorio de Pacientes
          </Link>
        </Button>
      </div>

      {/* ── CABECERA ── */}
      <div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
          <Building2 className="h-3.5 w-3.5" />
          <span>CLÍNICA & ATENCIÓN</span>
          <span>•</span>
          <span className="text-slate-400 uppercase tracking-wider">Alta de Paciente</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-emerald-400" />
          Registrar Nueva Mascota
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Apertura de ficha médica, alertas de seguridad de vida, registro de peso y vinculación legal.
        </p>
      </div>

      {/* ── FORMULARIO CLIENTE ── */}
      <PatientForm
        branchCode={branch}
        clients={clients as any}
        breeds={breeds as any}
        initialClientId={clientId}
      />
    </div>
  );
}

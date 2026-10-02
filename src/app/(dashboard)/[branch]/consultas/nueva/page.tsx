import React from "react";
import Link from "next/link";
import { getPatients } from "@/lib/actions/patients";
import { SoapForm } from "@/components/clinical/SoapForm";
import { serializeData } from "@/lib/utils";
import { ArrowLeft, Stethoscope, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NuevaConsultaPageProps {
  params: Promise<{
    branch: string;
  }>;
  searchParams: Promise<{
    patientId?: string;
  }>;
}

export default async function NuevaConsultaPage({
  params,
  searchParams,
}: NuevaConsultaPageProps) {
  const { branch } = await params;
  const { patientId } = await searchParams;

  const patients = await getPatients({ branchCode: branch });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>CLÍNICA & ATENCIÓN</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">Acto Médico</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-emerald-400" />
            Nueva Consulta Médica (SOAP AAHA)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Examen sistemático de 10 órganos, constantes biológicas, cuatro cuadrantes clínicos y prescripción farmacológica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${branch}/consultas`}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Ver Consultas
            </Button>
          </Link>
        </div>
      </div>

      {/* ── ESTADO SI NO HAY PACIENTES ── */}
      {patients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-400">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">
            No hay pacientes registrados en esta sede
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Para iniciar una consulta médica SOAP, primero debe registrar una mascota en el padrón biológico.
          </p>
          <div className="mt-6">
            <Link href={`/${branch}/pacientes/nuevo`}>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
                Registrar Primer Paciente
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <SoapForm
          branchCode={branch}
          patients={serializeData(patients)}
          initialPatientId={patientId}
        />
      )}
    </div>
  );
}

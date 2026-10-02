"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Search,
  Calendar,
  Lock,
  Activity,
  Pill,
  ChevronRight,
  User,
  Filter,
  FileSignature,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConsultationItem {
  id: string;
  consultationDate: Date | string;
  consultationType: string;
  assessmentDiagnosis: string;
  anamnesisReason: string;
  weightKg: any;
  isClosed: boolean;
  patient: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    breedRelation?: { name: string } | null;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      phoneE164?: string;
    };
  };
  veterinarian: {
    id: string;
    fullName: string;
    professionalLicense: string | null;
  } | null;
  prescriptions: any[];
  addendums: any[];
}

interface ConsultationTableProps {
  branchCode: string;
  initialConsultations: ConsultationItem[];
}

export function ConsultationTable({
  branchCode,
  initialConsultations,
}: ConsultationTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = initialConsultations.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.assessmentDiagnosis.toLowerCase().includes(q) ||
      c.anamnesisReason.toLowerCase().includes(q) ||
      c.patient.name.toLowerCase().includes(q) ||
      c.patient.client.firstName.toLowerCase().includes(q) ||
      c.patient.client.lastName.toLowerCase().includes(q) ||
      (c.veterinarian?.fullName && c.veterinarian.fullName.toLowerCase().includes(q));

    const matchesType = typeFilter === "ALL" || c.consultationType === typeFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CLOSED" && c.isClosed) ||
      (statusFilter === "OPEN" && !c.isClosed);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por diagnóstico, motivo, paciente, tutor o veterinario..."
            className="pl-10 border-slate-800 bg-slate-900/60 text-xs text-white placeholder-slate-500 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="GENERAL">General</option>
            <option value="EMERGENCY">Urgencia</option>
            <option value="FOLLOW_UP">Control / Seguimiento</option>
            <option value="SPECIALTY">Especialidad</option>
            <option value="VACCINATION">Vacunación</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="CLOSED">Cerradas (Inmutables)</option>
            <option value="OPEN">En Proceso (Abiertas)</option>
          </select>
        </div>
      </div>

      {/* ── TABLA DE RESULTADOS ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Fecha & Tipo</th>
                <th className="px-4 py-3">Paciente & Tutor</th>
                <th className="px-4 py-3">Diagnóstico SOAP</th>
                <th className="px-4 py-3">Médico Veterinario</th>
                <th className="px-4 py-3">Prescripción</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Stethoscope className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    No se encontraron consultas médicas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Fecha & Tipo */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(c.consultationDate).toLocaleDateString("es-SV", {
                          dateStyle: "medium",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(c.consultationDate).toLocaleTimeString("es-SV", {
                          timeStyle: "short",
                        })} • {c.consultationType}
                      </div>
                    </td>

                    {/* Paciente & Tutor */}
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/${branchCode}/pacientes/${c.patient.id}`}
                        className="font-bold text-white hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{c.patient.species === "CANINE" ? "🐶" : "🐱"}</span>
                        {c.patient.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        Tutor: {c.patient.client.firstName} {c.patient.client.lastName}
                      </div>
                    </td>

                    {/* Diagnóstico SOAP */}
                    <td className="px-4 py-3.5 max-w-[260px]">
                      <div className="font-semibold text-emerald-400 truncate">
                        {c.assessmentDiagnosis}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Motivo: {c.anamnesisReason}
                      </div>
                    </td>

                    {/* Médico Veterinario */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-slate-200 font-medium flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {c.veterinarian?.fullName || "No asignado"}
                      </div>
                      {c.veterinarian?.professionalLicense && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          JVPMV: {c.veterinarian.professionalLicense}
                        </div>
                      )}
                    </td>

                    {/* Prescripción */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {c.prescriptions && c.prescriptions.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-800/60 bg-emerald-950/40 text-emerald-300 text-[10px] flex items-center gap-1 w-fit"
                        >
                          <Pill className="h-3 w-3" />
                          {c.prescriptions[0].items?.length || 1} fármacos
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-500">Sin receta</span>
                      )}
                      {c.addendums && c.addendums.length > 0 && (
                        <div className="text-[10px] text-indigo-400 flex items-center gap-1 mt-1">
                          <FileSignature className="h-3 w-3" />
                          {c.addendums.length} adenda(s)
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          c.isClosed
                            ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
                            : "border-amber-800/80 bg-amber-950/50 text-amber-300 font-semibold"
                        }`}
                      >
                        {c.isClosed ? "Cerrada" : "Abierta"}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link href={`/${branchCode}/consultas/${c.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800 group-hover:bg-slate-800"
                        >
                          Ver Acto SOAP
                          <ChevronRight className="ml-1 h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

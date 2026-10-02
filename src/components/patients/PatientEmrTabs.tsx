"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Syringe,
  Bug,
  Scale,
  Pill,
  Calendar,
  Clock,
  User,
  Plus,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordVaccine, recordDeworming, recordWeight } from "@/lib/actions/preventive";

interface PatientEmrTabsProps {
  patient: any;
  branchCode: string;
}

export function PatientEmrTabs({ patient, branchCode }: PatientEmrTabsProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "preventive" | "weight" | "tutors">(
    "timeline"
  );

  // Modales
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({
    name: "Rabia Anual",
    lot: "LOT-2026-A",
    date: new Date().toISOString().split("T")[0],
    nextDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [isSavingVaccine, setIsSavingVaccine] = useState(false);

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || Number(newWeight) <= 0) return;
    setIsSavingWeight(true);
    await recordWeight({ patientId: patient.id, weightKg: Number(newWeight) }, branchCode);
    setIsSavingWeight(false);
    setWeightModalOpen(false);
    setNewWeight("");
  };

  const handleSaveVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVaccine(true);
    await recordVaccine(
      {
        patientId: patient.id,
        vaccineName: vaccineForm.name,
        lotNumber: vaccineForm.lot,
        administeredAt: vaccineForm.date,
        nextDueDate: vaccineForm.nextDate,
      },
      branchCode
    );
    setIsSavingVaccine(false);
    setVaccineModalOpen(false);
  };

  // Construir feed unificado para el Timeline 360°
  const timelineEvents: any[] = [];

  // Agregar Consultas
  patient.consultations?.forEach((c: any) => {
    timelineEvents.push({
      id: c.id,
      type: "CONSULTATION",
      date: new Date(c.consultationDate),
      title: `Consulta Médica SOAP • ${c.consultationType}`,
      doctor: c.veterinarian?.fullName || "Médico de Guardia",
      doctorLicense: c.veterinarian?.professionalLicense || "",
      preview: c.assessmentDiagnosis,
      subjective: c.subjective,
      objective: c.objective,
      isClosed: c.isClosed,
      addendumsCount: c.addendums?.length || 0,
      link: `/${branchCode}/consultas/${c.id}`,
    });
  });

  // Agregar Vacunas
  patient.vaccinations?.forEach((v: any) => {
    timelineEvents.push({
      id: v.id,
      type: "VACCINE",
      date: new Date(v.administeredAt),
      title: `Vacunación: ${v.vaccineName}`,
      lot: v.lotNumber,
      nextDueDate: new Date(v.nextDueDate),
      status: v.status,
    });
  });

  // Agregar Desparasitaciones
  patient.dewormings?.forEach((d: any) => {
    timelineEvents.push({
      id: d.id,
      type: "DEWORMING",
      date: new Date(d.administeredAt),
      title: `Desparasitación: ${d.productName}`,
      dosage: d.dosageAdministered,
      weight: d.weightAtAdministrationKg,
      nextDueDate: new Date(d.nextDueDate),
    });
  });

  // Ordenar cronológicamente descendente
  timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      {/* ── BARRA DE PESTAÑAS Y ACCIONES RÁPIDAS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "timeline"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Timeline EMR 360° ({timelineEvents.length})
          </button>

          <button
            onClick={() => setActiveTab("preventive")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "preventive"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Syringe className="h-3.5 w-3.5" />
            Carnet Preventivo ({patient.vaccinations?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("weight")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "weight"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            Curva de Peso ({patient.weightHistories?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("tutors")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "tutors"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Filiación & Co-Tutores
          </button>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          {/* Modal Peso */}
          <Dialog open={weightModalOpen} onOpenChange={setWeightModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-200 gap-1.5"
              >
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                + Peso
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">Registrar Peso Actual</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveWeight} className="space-y-3 pt-2">
                <Input
                  type="number"
                  step="0.01"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Peso en kilogramos (ej. 14.80)"
                  className="bg-slate-950 border-slate-800 text-white font-mono"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isSavingWeight}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs h-9"
                >
                  {isSavingWeight ? "Guardando..." : "Registrar en Historial"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Vacuna */}
          <Dialog open={vaccineModalOpen} onOpenChange={setVaccineModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-200 gap-1.5"
              >
                <Syringe className="h-3.5 w-3.5 text-teal-400" />
                + Vacuna
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">Registrar Vacuna en Carnet</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveVaccine} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Biológico / Vacuna</label>
                  <select
                    value={vaccineForm.name}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="Rabia Anual">Rabia Anual</option>
                    <option value="Séxtuple Canina (DHPPiL)">Séxtuple Canina (DHPPiL)</option>
                    <option value="Puppy DP">Puppy DP (Parvo + Distemper)</option>
                    <option value="Bordetella (Tos de las Perreras)">Bordetella</option>
                    <option value="Triple Felina (FVRCP)">Triple Felina (FVRCP)</option>
                    <option value="Leucemia Viral Felina (FeLV)">Leucemia Viral Felina (FeLV)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Lote</label>
                    <Input
                      value={vaccineForm.lot}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, lot: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Fecha Aplicada</label>
                    <Input
                      type="date"
                      value={vaccineForm.date}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Próxima Revacunación</label>
                  <Input
                    type="date"
                    value={vaccineForm.nextDate}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, nextDate: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSavingVaccine}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs h-9 mt-2"
                >
                  {isSavingVaccine ? "Guardando..." : "Asentar en Carnet"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            asChild
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Link href={`/${branchCode}/consultas/nueva?patientId=${patient.id}`}>
              <Stethoscope className="h-3.5 w-3.5" />
              Nueva Consulta SOAP
            </Link>
          </Button>
        </div>
      </div>

      {/* ── CONTENIDO PESTAÑA 1: TIMELINE EMR 360° ── */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {timelineEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-300">
                El paciente aún no cuenta con eventos clínicos registrados
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Inicia la primera consulta médica SOAP o asienta sus vacunas previas.
              </p>
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9"
              >
                <Link href={`/${branchCode}/consultas/nueva?patientId=${patient.id}`}>
                  <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
                  Iniciar Primera Consulta SOAP
                </Link>
              </Button>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6 py-2">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Punto en la línea de tiempo */}
                  <div
                    className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-slate-950 ${
                      evt.type === "CONSULTATION"
                        ? "bg-emerald-400 ring-4 ring-emerald-500/20"
                        : evt.type === "VACCINE"
                        ? "bg-teal-400 ring-4 ring-teal-500/20"
                        : "bg-cyan-400 ring-4 ring-cyan-500/20"
                    }`}
                  />

                  {/* Tarjeta del Evento */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-emerald-500/40 transition-all shadow-md space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {evt.type === "CONSULTATION" ? (
                          <Stethoscope className="h-4 w-4 text-emerald-400" />
                        ) : evt.type === "VACCINE" ? (
                          <Syringe className="h-4 w-4 text-teal-400" />
                        ) : (
                          <Bug className="h-4 w-4 text-cyan-400" />
                        )}
                        <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        {evt.date.toLocaleDateString("es-SV", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Detalle si es Consulta SOAP */}
                    {evt.type === "CONSULTATION" && (
                      <div className="space-y-2 text-xs">
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="text-slate-400">
                            <strong className="text-emerald-400 font-semibold">
                              Diagnóstico (Assessment):
                            </strong>{" "}
                            <span className="text-slate-200">{evt.preview}</span>
                          </div>
                          {evt.subjective && (
                            <div className="text-slate-400 text-[11px]">
                              <span className="text-slate-500">Motivo:</span> {evt.subjective}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                          <div>
                            Médico: <strong className="text-white">{evt.doctor}</strong>{" "}
                            {evt.doctorLicense && `(${evt.doctorLicense})`}
                          </div>

                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                          >
                            <Link href={evt.link}>
                              Ver SOAP Completo
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Detalle si es Vacuna */}
                    {evt.type === "VACCINE" && (
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Lote: {evt.lot || "N/A"}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span>Próxima dosis:</span>
                          <span className="text-emerald-400 font-bold">
                            {evt.nextDueDate.toLocaleDateString("es-SV")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTENIDO PESTAÑA 2: CARNET PREVENTIVO ── */}
      {activeTab === "preventive" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Syringe className="h-4 w-4 text-emerald-400" />
                Vacunas Aplicadas ({patient.vaccinations?.length || 0})
              </h3>
            </div>

            {patient.vaccinations?.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Sin registros de vacunación aún.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {patient.vaccinations.map((v: any) => {
                  const isExpired = new Date(v.nextDueDate) < new Date();
                  return (
                    <div
                      key={v.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{v.vaccineName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Aplicada: {new Date(v.administeredAt).toLocaleDateString("es-SV")} • Lote:{" "}
                          {v.lotNumber || "S/L"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Próxima Dosis</div>
                        <div className="font-mono font-bold text-xs text-white">
                          {new Date(v.nextDueDate).toLocaleDateString("es-SV")}
                        </div>
                        {isExpired ? (
                          <Badge variant="destructive" className="text-[9px] mt-1">
                            Vencida
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] mt-1">
                            Vigente
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Bug className="h-4 w-4 text-cyan-400" />
              Desparasitaciones Internas y Externas ({patient.dewormings?.length || 0})
            </h3>

            {patient.dewormings?.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Sin registros de desparasitación aún.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {patient.dewormings.map((d: any) => (
                  <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{d.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Dosis: {d.dosageAdministered} • Peso: {Number(d.weightAtAdministrationKg).toFixed(2)} kg
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-400 text-[10px] block">Próxima Fecha</span>
                      <span className="text-emerald-400 font-bold">
                        {new Date(d.nextDueDate).toLocaleDateString("es-SV")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTENIDO PESTAÑA 3: CURVA DE PESO ── */}
      {activeTab === "weight" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-400" />
                Historial Cronológico de Peso
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Base obligatoria para el cálculo farmacológico en $mg/kg$ y fluidoterapia.
              </p>
            </div>
          </div>

          {patient.weightHistories?.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              No hay registros de peso para este paciente.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {patient.weightHistories.map((w: any, idx: number) => {
                const prev = patient.weightHistories[idx + 1];
                const diff = prev ? Number(w.weightKg) - Number(prev.weightKg) : null;
                return (
                  <div
                    key={w.id}
                    className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs">
                        #{patient.weightHistories.length - idx}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-white text-sm">
                          {Number(w.weightKg).toFixed(2)} kg
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(w.recordedAt).toLocaleDateString("es-SV", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {diff !== null && (
                      <div
                        className={`font-mono text-xs font-bold ${
                          diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-400"
                        }`}
                      >
                        {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} kg
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CONTENIDO PESTAÑA 4: FILIACIÓN Y CO-TUTORES ── */}
      {activeTab === "tutors" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              Tutor Principal (Responsable Legal)
            </span>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
              <div>
                <Link
                  href={`/${branchCode}/clientes/${patient.client.id}`}
                  className="font-bold text-white text-base hover:text-emerald-400 transition-colors"
                >
                  {patient.client.firstName} {patient.client.lastName}
                </Link>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {patient.client.phoneE164} • {patient.client.email}
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <Link href={`/${branchCode}/clientes/${patient.client.id}`}>
                  Ver Ficha de Tutor
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Co-Propietarios Autorizados para Consentimientos Quirúrgicos ({patient.coOwners?.length || 0})
            </span>
            {patient.coOwners?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No hay co-propietarios ni apoderados registrados para este paciente.
              </p>
            ) : (
              <div className="space-y-2">
                {patient.coOwners.map((co: any) => (
                  <div
                    key={co.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-white font-bold">
                        {co.client.firstName} {co.client.lastName}
                      </span>
                      <span className="text-slate-400 ml-2">({co.relationshipType})</span>
                    </div>
                    {co.isAuthorizedToSignConsent && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                        Autorizado para Firmas
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Clock,
  Plus,
  Play,
  CheckCircle,
  FileText,
  AlertOctagon,
  Syringe,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
} from "lucide-react";
import { addAnesthesiaLog, updateSurgeryStatus, updateSurgicalReport } from "@/lib/actions/surgery";
import { SurgeryChecklistModal } from "./SurgeryChecklistModal";

interface AnesthesiaLogItem {
  id: string;
  recordedAt: string | Date;
  heartRateBpm: number | null;
  respiratoryRateBpm: number | null;
  spo2Percent: number | string | null;
  etco2Mmhg: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  meanBp: number | null;
  tempCelsius: number | string | null;
  vaporizerPct: number | string | null;
  fluidRateMlHr: number | string | null;
  administeredBolus: string | null;
  notes: string | null;
}

interface AnesthesiaMonitorProps {
  branchCode: string;
  surgery: {
    id: string;
    surgeryName: string;
    asaGrade: string;
    status: string;
    preOpWeightKg: number | string;
    preMedicationProtocol: string | null;
    inductionAgent: string | null;
    maintenanceAgent: string | null;
    surgeryStartTime: string | Date | null;
    surgeryEndTime: string | Date | null;
    surgicalFindingsReport: string | null;
    checklistSignInPassed: boolean;
    checklistTimeOutPassed: boolean;
    checklistSignOutPassed: boolean;
    patient: {
      id: string;
      name: string;
      species: string;
      breed: string;
      client?: {
        firstName: string;
        lastName: string;
        phoneE164: string;
      };
    };
    leadSurgeon: {
      fullName: string;
      professionalLicense: string | null;
    };
    anesthesiologist?: {
      fullName: string;
      professionalLicense: string | null;
    } | null;
    room?: {
      name: string;
    } | null;
    anesthesiaLogs: AnesthesiaLogItem[];
  };
}

export function AnesthesiaMonitor({ branchCode, surgery }: AnesthesiaMonitorProps) {
  const [logs, setLogs] = useState<AnesthesiaLogItem[]>(surgery.anesthesiaLogs || []);
  const [currentStatus, setCurrentStatus] = useState(surgery.status);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState(surgery.surgicalFindingsReport || "");
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Signos vitales actuales (del último log o predeterminados)
  const latestLog = logs[logs.length - 1];

  const [formHr, setFormHr] = useState<number>(latestLog?.heartRateBpm ?? 110);
  const [formRr, setFormRr] = useState<number>(latestLog?.respiratoryRateBpm ?? 18);
  const [formSpo2, setFormSpo2] = useState<number>(Number(latestLog?.spo2Percent) || 98);
  const [formEtco2, setFormEtco2] = useState<number>(latestLog?.etco2Mmhg ?? 38);
  const [formSysBp, setFormSysBp] = useState<number>(latestLog?.systolicBp ?? 115);
  const [formDiaBp, setFormDiaBp] = useState<number>(latestLog?.diastolicBp ?? 70);
  const [formTemp, setFormTemp] = useState<number>(Number(latestLog?.tempCelsius) || 37.8);
  const [formVap, setFormVap] = useState<number>(Number(latestLog?.vaporizerPct) || 1.5);
  const [formFluid, setFormFluid] = useState<number>(
    Number(latestLog?.fluidRateMlHr) || Math.round(Number(surgery.preOpWeightKg) * 7)
  );
  const [formBolus, setFormBolus] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  // Contador de tiempo de cirugía
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!surgery.surgeryStartTime || currentStatus !== "IN_SURGERY") return;

    const calculateElapsed = () => {
      const start = new Date(surgery.surgeryStartTime!).getTime();
      const now = Date.now();
      setElapsedMinutes(Math.max(0, Math.floor((now - start) / 60000)));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000);
    return () => clearInterval(interval);
  }, [surgery.surgeryStartTime, currentStatus]);

  // Alertas fisiológicas críticas
  const currentMap = latestLog?.meanBp ?? Math.round(formDiaBp + (formSysBp - formDiaBp) / 3);
  const isHypotensive = currentMap < 60;
  const isHypoxic = (Number(latestLog?.spo2Percent) || formSpo2) < 94;
  const isHypocapnic = (latestLog?.etco2Mmhg ?? formEtco2) < 32;
  const isHypercapnic = (latestLog?.etco2Mmhg ?? formEtco2) > 48;
  const isHypothermic = (Number(latestLog?.tempCelsius) || formTemp) < 36.5;

  const handleRecordLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecording(true);
    try {
      const calculatedMap = Math.round(formDiaBp + (formSysBp - formDiaBp) / 3);
      const res = await addAnesthesiaLog(surgery.id, branchCode, {
        heartRateBpm: formHr,
        respiratoryRateBpm: formRr,
        spo2Percent: formSpo2,
        etco2Mmhg: formEtco2,
        systolicBp: formSysBp,
        diastolicBp: formDiaBp,
        meanBp: calculatedMap,
        tempCelsius: formTemp,
        vaporizerPct: formVap,
        fluidRateMlHr: formFluid,
        administeredBolus: formBolus ? formBolus : undefined,
        notes: formNotes ? formNotes : undefined,
      });

      const newLogItem: AnesthesiaLogItem = {
        id: res.id,
        recordedAt: new Date(),
        heartRateBpm: formHr,
        respiratoryRateBpm: formRr,
        spo2Percent: formSpo2,
        etco2Mmhg: formEtco2,
        systolicBp: formSysBp,
        diastolicBp: formDiaBp,
        meanBp: calculatedMap,
        tempCelsius: formTemp,
        vaporizerPct: formVap,
        fluidRateMlHr: formFluid,
        administeredBolus: formBolus || null,
        notes: formNotes || null,
      };

      setLogs((prev) => [...prev, newLogItem]);
      setFormBolus("");
      setFormNotes("");
    } catch (err) {
      console.error(err);
      alert("Error al registrar signos vitales.");
    } finally {
      setIsRecording(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    try {
      await updateSurgeryStatus(surgery.id, branchCode, newStatus);
      setCurrentStatus(newStatus);
    } catch (err) {
      console.error(err);
      alert("Error al cambiar fase quirúrgica.");
    }
  };

  const handleSaveReport = async () => {
    setIsSavingReport(true);
    try {
      await updateSurgicalReport(surgery.id, branchCode, reportText);
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar protocolo operatorio.");
    } finally {
      setIsSavingReport(false);
    }
  };

  const asaColors: Record<string, string> = {
    ASA_I: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ASA_II: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    ASA_III: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    ASA_IV: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    ASA_V: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ASA_E: "bg-red-600 text-white border-red-500 animate-pulse",
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER DE CIRUGÍA & PACIENTE ── */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  asaColors[surgery.asaGrade] || "bg-slate-800 text-slate-300"
                }`}
              >
                {surgery.asaGrade.replace("_", " ")}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {surgery.room?.name || "Pabellón Principal"}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                Cirujano: <strong className="text-white">{surgery.leadSurgeon.fullName}</strong>
              </span>
              {surgery.anesthesiologist && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    Anestesista: <strong className="text-white">{surgery.anesthesiologist.fullName}</strong>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {surgery.surgeryName}
              </h1>
            </div>

            <p className="text-sm text-slate-300 flex items-center gap-2">
              <span className="font-bold text-white">{surgery.patient.name}</span>
              <span className="text-slate-500">|</span>
              <span>{surgery.patient.species === "CANINE" ? "Canino" : "Felino"} ({surgery.patient.breed})</span>
              <span className="text-slate-500">|</span>
              <span className="text-indigo-400 font-semibold">{Number(surgery.preOpWeightKg)} kg</span>
              {surgery.patient.client && (
                <>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Tutor: {surgery.patient.client.firstName} {surgery.patient.client.lastName} ({surgery.patient.client.phoneE164})</span>
                </>
              )}
            </p>
          </div>

          {/* Estado quirúrgico y acciones */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Checklist OMS Button */}
            <button
              onClick={() => setShowChecklist(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ShieldAlert className="h-4 w-4" />
              Checklist OMS
              <div className="flex gap-1 ml-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    surgery.checklistSignInPassed ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                  title="Sign In"
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    surgery.checklistTimeOutPassed ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                  title="Time Out"
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    surgery.checklistSignOutPassed ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                  title="Sign Out"
                />
              </div>
            </button>

            {/* Protocolo Operatorio Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              Protocolo Operatorio
            </button>

            {/* Transición de fases */}
            {currentStatus === "SCHEDULED" && (
              <button
                onClick={() => handleStatusChange("PRE_OP")}
                className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all"
              >
                <Clock className="h-4 w-4" />
                Ingresar a Pre-Quirófano
              </button>
            )}

            {currentStatus === "PRE_OP" && (
              <button
                onClick={() => handleStatusChange("IN_SURGERY")}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                <Play className="h-4 w-4 fill-white" />
                Iniciar Cirugía (Pabellón)
              </button>
            )}

            {currentStatus === "IN_SURGERY" && (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  EN PABELLÓN ({elapsedMinutes} min)
                </div>
                <button
                  onClick={() => handleStatusChange("RECOVERY")}
                  className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Pase a Recuperación
                </button>
              </div>
            )}

            {currentStatus === "RECOVERY" && (
              <button
                onClick={() => handleStatusChange("COMPLETED")}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                Finalizar Cirugía
              </button>
            )}

            {currentStatus === "COMPLETED" && (
              <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                CIRUGÍA COMPLETADA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── BARRAS DE ALERTA CLÍNICA INTRAOPERATORIA ── */}
      {(isHypotensive || isHypoxic || isHypocapnic || isHypercapnic || isHypothermic) && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex flex-wrap items-center gap-4 animate-pulse">
          <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
          <div className="text-xs font-semibold flex flex-wrap items-center gap-3">
            <span className="font-bold text-rose-200">ALERTA ANESTÉSICA:</span>
            {isHypotensive && (
              <span className="bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-full text-rose-200">
                ⚠️ Hipotensión: PAM ({currentMap} mmHg) &lt; 60 mmHg (Riesgo de hipoperfusión renal)
              </span>
            )}
            {isHypoxic && (
              <span className="bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-full text-rose-200">
                ⚠️ Hipoxia: SpO2 ({Number(latestLog?.spo2Percent) || formSpo2}%) &lt; 94%
              </span>
            )}
            {isHypocapnic && (
              <span className="bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-full text-rose-200">
                ⚠️ Hipocapnia: EtCO2 ({latestLog?.etco2Mmhg ?? formEtco2} mmHg) &lt; 32 (Hiperventilación)
              </span>
            )}
            {isHypercapnic && (
              <span className="bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-full text-rose-200">
                ⚠️ Hipercapnia: EtCO2 ({latestLog?.etco2Mmhg ?? formEtco2} mmHg) &gt; 48 (Hipoventilación)
              </span>
            )}
            {isHypothermic && (
              <span className="bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-full text-rose-200">
                ⚠️ Hipotermia: Temp ({Number(latestLog?.tempCelsius) || formTemp} °C) &lt; 36.5 °C
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CONSOLA MULTIPARAMÉTRICA EN VIVO (ESTILO MONITOR MÉDICO) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Frecuencia Cardíaca */}
        <div className="rounded-3xl border border-rose-500/30 bg-slate-950/80 p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold tracking-wider">FC / BPM</span>
            <Heart className="h-4 w-4 animate-bounce text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black text-rose-400 font-mono tracking-tight">
              {latestLog?.heartRateBpm ?? "--"}
            </span>
            <span className="text-xs text-rose-400/70 font-mono">lpm</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Normal: 70 - 140 lpm</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-transparent" />
        </div>

        {/* Frecuencia Respiratoria */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold tracking-wider">FR / RESP</span>
            <Wind className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black text-cyan-400 font-mono tracking-tight">
              {latestLog?.respiratoryRateBpm ?? "--"}
            </span>
            <span className="text-xs text-cyan-400/70 font-mono">rpm</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Normal: 10 - 25 rpm</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-transparent" />
        </div>

        {/* SpO2 Oximetría */}
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-950/80 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold tracking-wider">SpO2</span>
            <span className="text-xs font-mono font-bold text-emerald-500">%</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
              {latestLog?.spo2Percent ? Number(latestLog.spo2Percent) : "--"}
            </span>
            <span className="text-xs text-emerald-400/70 font-mono">%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Meta: &ge; 95%</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
        </div>

        {/* EtCO2 Capnografía */}
        <div className="rounded-3xl border border-amber-500/30 bg-slate-950/80 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold tracking-wider">EtCO2</span>
            <span className="text-[10px] text-amber-400/70 font-mono">mmHg</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">
              {latestLog?.etco2Mmhg ?? "--"}
            </span>
            <span className="text-xs text-amber-400/70 font-mono">mmHg</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Óptimo: 35 - 45 mmHg</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-transparent" />
        </div>

        {/* Presión Arterial (Sist / Diast / PAM) */}
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-950/80 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold tracking-wider">PA / PAM</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-indigo-300 font-mono tracking-tight">
              {latestLog?.meanBp ?? "--"}
            </span>
            <span className="text-xs text-indigo-400 font-mono">PAM</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            {latestLog?.systolicBp ?? "--"} / {latestLog?.diastolicBp ?? "--"} mmHg
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-transparent" />
        </div>

        {/* Temperatura Central */}
        <div className="rounded-3xl border border-teal-500/30 bg-slate-950/80 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-teal-400">
            <span className="text-xs font-bold tracking-wider">TEMP</span>
            <Thermometer className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black text-teal-400 font-mono tracking-tight">
              {latestLog?.tempCelsius ? Number(latestLog.tempCelsius) : "--"}
            </span>
            <span className="text-xs text-teal-400/70 font-mono">°C</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Normotermia: 37.5 - 39.2 °C</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-transparent" />
        </div>
      </div>

      {/* ── FORMULARIO RÁPIDO DE REGISTRO MINUTO A MINUTO ── */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Añadir Control Transoperatorio (Cada 5 - 15 min)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {logs.length} controles registrados hasta ahora
          </span>
        </div>

        <form onSubmit={handleRecordLog} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                FC (BPM)
              </label>
              <input
                type="number"
                value={formHr}
                onChange={(e) => setFormHr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-rose-400 font-mono focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                FR (RPM)
              </label>
              <input
                type="number"
                value={formRr}
                onChange={(e) => setFormRr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-cyan-400 font-mono focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                SpO2 (%)
              </label>
              <input
                type="number"
                value={formSpo2}
                onChange={(e) => setFormSpo2(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-emerald-400 font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                EtCO2 (mmHg)
              </label>
              <input
                type="number"
                value={formEtco2}
                onChange={(e) => setFormEtco2(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-amber-400 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Sistólica / Diast.
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Sist"
                  value={formSysBp}
                  onChange={(e) => setFormSysBp(Number(e.target.value))}
                  className="w-1/2 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-indigo-300 font-mono"
                />
                <input
                  type="number"
                  placeholder="Diast"
                  value={formDiaBp}
                  onChange={(e) => setFormDiaBp(Number(e.target.value))}
                  className="w-1/2 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-indigo-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formTemp}
                onChange={(e) => setFormTemp(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-teal-400 font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                % Vaporizador
              </label>
              <input
                type="number"
                step="0.1"
                value={formVap}
                onChange={(e) => setFormVap(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-purple-400 font-mono focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Fluidos (ml/h)
              </label>
              <input
                type="number"
                value={formFluid}
                onChange={(e) => setFormFluid(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-blue-400 font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Fármaco / Bolo Administrado
              </label>
              <input
                type="text"
                placeholder="Ej. Fentanilo 2 mcg/kg IV, Atropina 0.02 mg/kg..."
                value={formBolus}
                onChange={(e) => setFormBolus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Nota de Evento Quirúrgico
              </label>
              <input
                type="text"
                placeholder="Ej. Incisión por línea alba, ligadura de muñón, sangrado leve..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isRecording}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isRecording ? "Guardando..." : "Registrar Signos en Hoja Anestésica"}
            </button>
          </div>
        </form>
      </div>

      {/* ── HOJA GRÁFICA / MATRIZ CRONOLÓGICA DE ANESTESIA ── */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Hoja Transoperatoria Minuto a Minuto
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Registro legal e inmutable de anestesiología
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-3">FC (BPM)</th>
                <th className="py-3 px-3">FR (RPM)</th>
                <th className="py-3 px-3">SpO2</th>
                <th className="py-3 px-3">EtCO2</th>
                <th className="py-3 px-3">PA (Sist/Diast/PAM)</th>
                <th className="py-3 px-3">Temp</th>
                <th className="py-3 px-3">% Vap</th>
                <th className="py-3 px-3">Fluidos</th>
                <th className="py-3 px-4">Bolos / Notas de Quirófano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-xs font-sans">
                    Aún no se han registrado controles en la hoja anestésica. Usa el formulario superior para añadir el primer minuto.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const logDate = new Date(log.recordedAt);
                  const timeStr = logDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isLogHypotensive = (log.meanBp ?? 100) < 60;
                  const isLogHypoxic = (Number(log.spo2Percent) || 100) < 94;

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isLogHypotensive || isLogHypoxic ? "bg-rose-500/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-300">{timeStr}</td>
                      <td className="py-3 px-3 text-rose-400 font-bold">
                        {log.heartRateBpm ?? "--"}
                      </td>
                      <td className="py-3 px-3 text-cyan-400">
                        {log.respiratoryRateBpm ?? "--"}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        {log.spo2Percent ? `${Number(log.spo2Percent)}%` : "--"}
                      </td>
                      <td className="py-3 px-3 text-amber-400">
                        {log.etco2Mmhg ?? "--"}
                      </td>
                      <td className="py-3 px-3 text-indigo-300">
                        {log.systolicBp ?? "--"}/{log.diastolicBp ?? "--"}{" "}
                        <span className="text-[10px] text-indigo-400 font-bold">
                          (PAM {log.meanBp ?? "--"})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-teal-400">
                        {log.tempCelsius ? `${Number(log.tempCelsius)}°C` : "--"}
                      </td>
                      <td className="py-3 px-3 text-purple-400">
                        {log.vaporizerPct ? `${Number(log.vaporizerPct)}%` : "--"}
                      </td>
                      <td className="py-3 px-3 text-blue-400">
                        {log.fluidRateMlHr ? `${Number(log.fluidRateMlHr)} ml/h` : "--"}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs">
                        {log.administeredBolus && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold mr-2 text-[10px]">
                            💉 {log.administeredBolus}
                          </span>
                        )}
                        <span className="text-slate-300">{log.notes || "--"}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL CHECKLIST QUIRÚRGICO OMS ── */}
      <SurgeryChecklistModal
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
        surgeryId={surgery.id}
        branchCode={branchCode}
        surgeryName={surgery.surgeryName}
        patientName={surgery.patient.name}
        checklistSignInPassed={surgery.checklistSignInPassed}
        checklistTimeOutPassed={surgery.checklistTimeOutPassed}
        checklistSignOutPassed={surgery.checklistSignOutPassed}
      />

      {/* ── MODAL DE PROTOCOLO OPERATORIO Y HALLAZGOS ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-bold text-white">
                  Protocolo Quirúrgico y Hallazgos Intraoperatorios
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Redacta la descripción del abordaje, hallazgos patológicos, técnica empleada, suturas y complicaciones.
            </p>

            <textarea
              rows={8}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Ej. Incisión medial retroumbilical de 5 cm. Exposición de cuernos uterinos... Ligadura de pedículos con Poliglactina 910 2-0... Cierre de pared con surgete continuo..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 font-mono leading-relaxed"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReport}
                disabled={isSavingReport}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isSavingReport ? "Guardando..." : "Guardar Protocolo Operatorio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

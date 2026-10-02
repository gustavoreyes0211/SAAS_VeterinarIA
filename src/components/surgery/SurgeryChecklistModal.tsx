"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, X, ClipboardCheck, Sparkles } from "lucide-react";
import { updateSurgeryChecklist } from "@/lib/actions/surgery";

interface SurgeryChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgeryId: string;
  branchCode: string;
  surgeryName: string;
  patientName: string;
  checklistSignInPassed: boolean;
  checklistTimeOutPassed: boolean;
  checklistSignOutPassed: boolean;
}

export function SurgeryChecklistModal({
  isOpen,
  onClose,
  surgeryId,
  branchCode,
  surgeryName,
  patientName,
  checklistSignInPassed,
  checklistTimeOutPassed,
  checklistSignOutPassed,
}: SurgeryChecklistModalProps) {
  const [activeTab, setActiveTab] = useState<"sign_in" | "time_out" | "sign_out">("sign_in");

  // Estados de checks para Sign In
  const [signInChecks, setSignInChecks] = useState({
    identity: true,
    fasting: true,
    consent: true,
    catheter: true,
    machineO2: true,
    emergencyDrugs: true,
  });

  // Estados de checks para Time Out
  const [timeOutChecks, setTimeOutChecks] = useState({
    teamIntro: true,
    procedureConfirmed: true,
    antibioticTiming: true,
    sterilityVerified: true,
    initialSpongeCount: true,
    bloodLossPlan: true,
  });

  // Estados de checks para Sign Out
  const [signOutChecks, setSignOutChecks] = useState({
    procedureFinalName: true,
    finalSpongeCount: true,
    instrumentCount: true,
    biopsyLabeled: true,
    postOpAnalgesiaPlan: true,
    recoveryDestination: true,
  });

  const [saving, setSaving] = useState(false);
  const [passedSignIn, setPassedSignIn] = useState(checklistSignInPassed);
  const [passedTimeOut, setPassedTimeOut] = useState(checklistTimeOutPassed);
  const [passedSignOut, setPassedSignOut] = useState(checklistSignOutPassed);

  if (!isOpen) return null;

  const handleSaveStage = async (stage: "sign_in" | "time_out" | "sign_out") => {
    setSaving(true);
    try {
      await updateSurgeryChecklist(surgeryId, branchCode, stage, true);
      if (stage === "sign_in") setPassedSignIn(true);
      if (stage === "time_out") setPassedTimeOut(true);
      if (stage === "sign_out") setPassedSignOut(true);
    } catch (e) {
      console.error(e);
      alert("Error al guardar fase del checklist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Estándar Quirúrgico OMS / AAHA
                </span>
                <span className="text-xs text-slate-400">ID: {surgeryId.slice(0, 8)}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Lista de Verificación de Seguridad Quirúrgica
              </h2>
              <p className="text-xs text-slate-400">
                Paciente: <span className="text-slate-200 font-semibold">{patientName}</span> • Cirugía: <span className="text-slate-200 font-semibold">{surgeryName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Tabs de Fases OMS */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab("sign_in")}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "sign_in"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${passedSignIn ? "bg-emerald-400" : "bg-amber-400"}`} />
            1. SIGN IN (Inducción)
            {passedSignIn && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
          </button>

          <button
            onClick={() => setActiveTab("time_out")}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "time_out"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${passedTimeOut ? "bg-emerald-400" : "bg-amber-400"}`} />
            2. TIME OUT (Incisión)
            {passedTimeOut && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
          </button>

          <button
            onClick={() => setActiveTab("sign_out")}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "sign_out"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${passedSignOut ? "bg-emerald-400" : "bg-amber-400"}`} />
            3. SIGN OUT (Cierre)
            {passedSignOut && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
          {/* FASE 1: SIGN IN */}
          {activeTab === "sign_in" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                <span className="font-bold">Fase 1: Antes de la Inducción Anestésica</span>. Coordinada entre el anestesiólogo y el enfermero antes de aplicar el agente de inducción o intubación endotraqueal.
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: "identity",
                    label: "Identidad del paciente, sexo, especie y sitio anatómico marcados y confirmados.",
                  },
                  {
                    key: "consent",
                    label: "Consentimiento informado quirúrgico y anestésico firmado por el tutor.",
                  },
                  {
                    key: "fasting",
                    label: "Periodo de ayuno verificado (8-12h sólidos, 2-4h líquidos según edad).",
                  },
                  {
                    key: "catheter",
                    label: "Vía intravenosa permeable colocada y fijada con esparadrapo estéril.",
                  },
                  {
                    key: "machineO2",
                    label: "Máquina de anestesia probada: fuga de gas negativa, flujo O2 y canister de cal sodada OK.",
                  },
                  {
                    key: "emergencyDrugs",
                    label: "Fármacos de reversión y carro rojo calculados por peso (Atipamezol, Naloxona, Epinefrina).",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(signInChecks as any)[item.key]}
                      onChange={(e) =>
                        setSignInChecks({
                          ...signInChecks,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* FASE 2: TIME OUT */}
          {activeTab === "time_out" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                <span className="font-bold">Fase 2: Antes de la Primera Incisión (Pausa Quirúrgica)</span>. Todo el equipo quirúgico detiene sus tareas y responde en voz alta.
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: "teamIntro",
                    label: "Presentación en voz alta del cirujano titular, anestesiólogo e instrumentista.",
                  },
                  {
                    key: "procedureConfirmed",
                    label: "Confirmación verbal del procedimiento exacto a realizar y duración estimada.",
                  },
                  {
                    key: "antibioticTiming",
                    label: "Profilaxis antibiótica administrada dentro de los 60 minutos previos a la incisión (Cefazolina u homólogo).",
                  },
                  {
                    key: "sterilityVerified",
                    label: "Indicadores químicos/biológicos de los paquetes de instrumental quirúrgico virados y estériles.",
                  },
                  {
                    key: "initialSpongeCount",
                    label: "Conteo inicial de gasas, compresas de laparotomía con testigo radiopaco e instrumental verificado.",
                  },
                  {
                    key: "bloodLossPlan",
                    label: "Previsión de eventos críticos: pérdidas de sangre estimadas y plan de hemoderivados/fluidos.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(timeOutChecks as any)[item.key]}
                      onChange={(e) =>
                        setTimeOutChecks({
                          ...timeOutChecks,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* FASE 3: SIGN OUT */}
          {activeTab === "sign_out" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                <span className="font-bold">Fase 3: Antes del Cierre y Salida a Recuperación</span>. Garantiza el conteo exacto de material y la seguridad del despertar del paciente.
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: "procedureFinalName",
                    label: "Cirujano confirma el nombre final de la técnica o procedimiento completado.",
                  },
                  {
                    key: "finalSpongeCount",
                    label: "Recuento final de gasas y compresas coincidente con el inicial (100% verificado, sin faltantes).",
                  },
                  {
                    key: "instrumentCount",
                    label: "Recuento de pinzas, mangos de bisturí y separadores completo.",
                  },
                  {
                    key: "biopsyLabeled",
                    label: "Muestras de biopsia o citología rotuladas correctamente con nombre de paciente y sitio anatómico.",
                  },
                  {
                    key: "postOpAnalgesiaPlan",
                    label: "Plan analgésico postoperatorio administrado (AINEs / Opioides / Anestesia local infiltrativa).",
                  },
                  {
                    key: "recoveryDestination",
                    label: "Destino postoperatorio definido: Pizarra UCI 24/7 o canil de hospitalización general.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(signOutChecks as any)[item.key]}
                      onChange={(e) =>
                        setSignOutChecks({
                          ...signOutChecks,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">
              Registrado por el equipo quirúrgico en turno
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => handleSaveStage(activeTab)}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {saving ? "Validando..." : `Validar y Firmar ${activeTab.replace("_", " ").toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { addConsultationAddendum, closeConsultation } from "@/lib/actions/consultations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Lock,
  CheckCircle2,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  FileSignature,
} from "lucide-react";

interface AddendumItem {
  id: string;
  addendumText: string;
  createdAt: Date | string;
  veterinarian: {
    id: string;
    fullName: string;
    professionalLicense: string | null;
  };
}

interface AddendumSectionProps {
  consultationId: string;
  branchCode: string;
  isClosed: boolean;
  addendums: AddendumItem[];
}

export function AddendumSection({
  consultationId,
  branchCode,
  isClosed,
  addendums,
}: AddendumSectionProps) {
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closingConsultation, setClosingConsultation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAddendum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);
    const res = await addConsultationAddendum(consultationId, text, branchCode);
    setIsSubmitting(false);

    if (res.success) {
      setText("");
      setIsOpenForm(false);
    } else {
      setError(res.error || "Error al agregar adenda.");
    }
  };

  const handleCloseConsultation = async () => {
    if (!confirm("¿Está seguro de cerrar y bloquear este acto médico? Una vez cerrado, cualquier cambio posterior solo se podrá realizar mediante Adendas Médicas Legales inmutables.")) {
      return;
    }

    setClosingConsultation(true);
    await closeConsultation(consultationId, branchCode);
    setClosingConsultation(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-indigo-400" />
            Adendas Médicas & Fe de Erratas (Immutabilidad Legal)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Conforme a las directrices de auditoría médica, los registros clínicos cerrados no pueden eliminarse ni sobreescribirse. Las correcciones y evoluciones se asientan como adendas firmadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <Button
              onClick={handleCloseConsultation}
              disabled={closingConsultation}
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
            >
              {closingConsultation ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Lock className="mr-1.5 h-3.5 w-3.5" />
              )}
              Cerrar Acto Médico Oficial
            </Button>
          )}

          <Button
            onClick={() => setIsOpenForm(!isOpenForm)}
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
            {isOpenForm ? "Cancelar" : "Nueva Adenda"}
          </Button>
        </div>
      </div>

      {/* ── FORMULARIO DE ADENDA ── */}
      {isOpenForm && (
        <form
          onSubmit={handleAddAddendum}
          className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <AlertCircle className="h-4 w-4" />
            Redactar Adenda o Notificación de Evolución Clínica
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Describa la corrección, resultado tardío de pruebas diagnósticas o informe de evolución del paciente..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpenForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Descartar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Firmar & Asentar Adenda
            </Button>
          </div>
        </form>
      )}

      {/* ── HISTORIAL DE ADENDAS ── */}
      {addendums.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          No hay adendas registradas. El expediente original permanece fiel al momento de su cierre.
        </div>
      ) : (
        <div className="space-y-3">
          {addendums.map((ad, idx) => (
            <div
              key={ad.id || idx}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-indigo-800/60 bg-indigo-950/40 text-indigo-300 font-mono text-[10px]"
                  >
                    Adenda #{idx + 1}
                  </Badge>
                  <span className="flex items-center gap-1 font-medium text-slate-200">
                    <User className="h-3 w-3 text-slate-400" />
                    Dr(a). {ad.veterinarian?.fullName || "Médico Veterinario"}
                  </span>
                  {ad.veterinarian?.professionalLicense && (
                    <span className="font-mono text-slate-500">
                      (JVPMV: {ad.veterinarian.professionalLicense})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(ad.createdAt).toLocaleString("es-SV", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed pl-1">
                {ad.addendumText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

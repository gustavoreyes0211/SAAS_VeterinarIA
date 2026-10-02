"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/actions/clients";
import {
  UserPlus,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Receipt,
  HeartHandshake,
  Loader2,
} from "lucide-react";
import { ClientTaxType, ClientCategoryTag } from "@prisma/client";

const formSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 letras"),
  lastName: z.string().min(2, "Mínimo 2 letras"),
  taxType: z.nativeEnum(ClientTaxType),
  category: z.nativeEnum(ClientCategoryTag),
  dui: z.string().optional(),
  nit: z.string().optional(),
  nrc: z.string().optional(),
  tradeName: z.string().optional(),
  economicActivityCode: z.string().optional(),
  phoneE164: z.string().min(8, "Teléfono requerido (ej. +503 7000-0000)"),
  secondaryPhone: z.string().optional(),
  email: z.string().email("Correo no válido"),
  address: z.string().min(5, "Dirección requerida"),
  departmentCode: z.string().default("06"),
  municipalityCode: z.string().default("14"),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  creditLimit: z.coerce.number().min(0).default(0),
  internalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientFormModalProps {
  branchCode?: string;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function ClientFormModal({
  branchCode = "central",
  onSuccess,
  triggerButton,
}: ClientFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      taxType: ClientTaxType.CONSUMIDOR_FINAL,
      category: ClientCategoryTag.STANDARD,
      departmentCode: "06",
      municipalityCode: "14",
      creditLimit: 0,
      phoneE164: "+503 ",
    },
  });

  const selectedTaxType = watch("taxType");

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setServerError(null);

    const res = await createClient(values as any, branchCode);
    setIsSubmitting(false);

    if (res.success) {
      reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } else {
      setServerError(res.error || "Ocurrió un error al registrar el cliente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 gap-1.5 shadow-md shadow-emerald-600/20">
            <UserPlus className="h-4 w-4" />
            Nuevo Tutor / Cliente
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Registrar Nuevo Tutor / Cliente
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Filiación médica, fiscal (El Salvador DTE) y contacto de emergencia.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Fila 1: Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Nombres <span className="text-rose-400">*</span>
              </label>
              <Input
                {...register("firstName")}
                placeholder="Ej. Roberto Carlos"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
              {errors.firstName && (
                <p className="text-[10px] text-rose-400">{String(errors.firstName.message || "")}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Apellidos <span className="text-rose-400">*</span>
              </label>
              <Input
                {...register("lastName")}
                placeholder="Ej. Menjívar Rivera"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
              {errors.lastName && (
                <p className="text-[10px] text-rose-400">{String(errors.lastName.message || "")}</p>
              )}
            </div>
          </div>

          {/* Fila 2: Tipo Tributario y Categoría Comercial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Receipt className="h-3 w-3 text-emerald-400" />
                Tipo de Contribuyente (DTE MH)
              </label>
              <select
                {...register("taxType")}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={ClientTaxType.CONSUMIDOR_FINAL}>
                  Consumidor Final (DTE-01 / DUI)
                </option>
                <option value={ClientTaxType.CONTRIBUYENTE_CREDITO_FISCAL}>
                  Crédito Fiscal (DTE-03 / NIT + NRC)
                </option>
                <option value={ClientTaxType.EXTRANJERO}>
                  Extranjero (Pasaporte / Residencia)
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-teal-400" />
                Categoría Comercial
              </label>
              <select
                {...register("category")}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={ClientCategoryTag.STANDARD}>Estándar (Regular)</option>
                <option value={ClientCategoryTag.VIP}>VIP (Alta Frecuencia)</option>
                <option value={ClientCategoryTag.FREQUENT}>Paciente Crónico / Frecuente</option>
                <option value={ClientCategoryTag.RESCUER_SHELTER}>Refugio / Rescatista</option>
                <option value={ClientCategoryTag.DEBTOR}>Deudor Moroso</option>
                <option value={ClientCategoryTag.HIGH_RISK_CAUTION}>Atención con Precaución</option>
              </select>
            </div>
          </div>

          {/* Condicional Tributario según tipo */}
          {selectedTaxType === ClientTaxType.CONSUMIDOR_FINAL ? (
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300">
                DUI (Documento Único de Identidad)
              </label>
              <Input
                {...register("dui")}
                placeholder="00000000-0"
                className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
              />
              <p className="text-[10px] text-slate-500">
                Formato de 8 dígitos y 1 dígito verificador para facturas electrónicas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">NIT de la Empresa</label>
                <Input
                  {...register("nit")}
                  placeholder="0614-000000-000-0"
                  className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">NRC (Registro)</label>
                <Input
                  {...register("nrc")}
                  placeholder="123456-7"
                  className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Razón Social</label>
                <Input
                  {...register("tradeName")}
                  placeholder="Nombre Comercial / Legal"
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Fila 3: Contacto (Teléfono y Correo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-400" />
                Teléfono Principal (WhatsApp) <span className="text-rose-400">*</span>
              </label>
              <Input
                {...register("phoneE164")}
                placeholder="+503 7000-0000"
                className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
              />
              {errors.phoneE164 && (
                <p className="text-[10px] text-rose-400">{String(errors.phoneE164.message || "")}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Mail className="h-3 w-3 text-cyan-400" />
                Correo Electrónico <span className="text-rose-400">*</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="tutor@ejemplo.com"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
              {errors.email && (
                <p className="text-[10px] text-rose-400">{String(errors.email.message || "")}</p>
              )}
            </div>
          </div>

          {/* Fila 4: Dirección */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-rose-400" />
              Dirección Residencial / Fiscal <span className="text-rose-400">*</span>
            </label>
            <Input
              {...register("address")}
              placeholder="Colonia, calle, polígono, casa #..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            {errors.address && (
              <p className="text-[10px] text-rose-400">{String(errors.address.message || "")}</p>
            )}
          </div>

          {/* Fila 5: Contacto de Emergencia Alternativo (Para UCI y Cirugía) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <HeartHandshake className="h-3.5 w-3.5" />
              Contacto de Emergencia Alternativo (Cirugías & UCI 24/7)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                {...register("emergencyContactName")}
                placeholder="Nombre de familiar"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
              <Input
                {...register("emergencyContactPhone")}
                placeholder="Teléfono de emergencia"
                className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
              />
              <Input
                {...register("emergencyContactRelationship")}
                placeholder="Parentesco (Cónyuge, etc.)"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-xs h-9 border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 px-4 gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Guardar Tutor
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

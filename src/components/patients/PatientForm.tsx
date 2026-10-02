"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createPatient } from "@/lib/actions/patients";
import {
  PawPrint,
  User,
  Scale,
  ShieldAlert,
  AlertTriangle,
  HeartCrack,
  CheckCircle2,
  Syringe,
  Plus,
  X,
  Loader2,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimalGender, TemperamentAlertType } from "@prisma/client";

const formSchema = z.object({
  clientId: z.string().uuid("Seleccione un tutor de la lista"),
  name: z.string().min(1, "El nombre de la mascota es obligatorio"),
  species: z.string().min(1),
  breedId: z.string().optional().nullable(),
  breed: z.string().optional().nullable(),
  gender: z.nativeEnum(AnimalGender),
  birthDate: z.string().optional().nullable(),
  estimatedAgeMonths: z.coerce.number().min(0).optional().nullable(),
  microchipNumber: z.string().optional().nullable(),
  tattooNumber: z.string().optional().nullable(),
  coatColor: z.string().optional().nullable(),
  distinctiveMarkings: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  temperamentAlert: z.nativeEnum(TemperamentAlertType),
  initialWeightKg: z.coerce.number().positive("El peso debe ser mayor a 0").optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PatientFormProps {
  branchCode: string;
  clients: { id: string; firstName: string; lastName: string; phoneE164: string }[];
  breeds: { id: string; name: string; species: string; standardWeightMaleKg: any; standardWeightFemKg: any }[];
  initialClientId?: string;
}

export function PatientForm({
  branchCode,
  clients,
  breeds,
  initialClientId,
}: PatientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Chips para alergias y condiciones crónicas
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      clientId: initialClientId || clients[0]?.id || "",
      species: "CANINE",
      gender: AnimalGender.MALE_NEUTERED,
      temperamentAlert: TemperamentAlertType.FRIENDLY,
    },
  });

  const selectedSpecies = watch("species");
  const filteredBreeds = breeds.filter((b) => b.species === selectedSpecies);

  const addAllergy = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addCondition = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !conditions.includes(trimmed)) {
      setConditions([...conditions, trimmed]);
      setConditionInput("");
    }
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setServerError(null);

    const payload = {
      ...values,
      knownAllergies: allergies,
      chronicConditions: conditions,
    };

    const res = await createPatient(payload as any, branchCode);
    setIsSubmitting(false);

    if (res.success && res.patient) {
      router.push(`/${branchCode}/pacientes/${res.patient.id}`);
    } else {
      setServerError(res.error || "Error al crear la ficha de la mascota.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      {serverError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── SECCIÓN 1: TUTOR RESPONSABLE ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
          <User className="h-4 w-4 text-emerald-400" />
          <span>1. Vinculación con Tutor / Propietario Legal</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            Seleccionar Tutor <span className="text-rose-400">*</span>
          </label>
          <select
            {...register("clientId")}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} • {c.phoneE164}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-[10px] text-rose-400">{String(errors.clientId.message || "")}</p>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 2: IDENTIFICACIÓN BIOLÓGICA ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
          <PawPrint className="h-4 w-4 text-teal-400" />
          <span>2. Ficha Biológica y Características Físicas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Nombre de la Mascota <span className="text-rose-400">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="Ej. Max, Luna, Toby..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            {errors.name && (
              <p className="text-[10px] text-rose-400">{String(errors.name.message || "")}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Especie</label>
            <select
              {...register("species")}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="CANINE">🐶 Canino (Perro)</option>
              <option value="FELINE">🐱 Felino (Gato)</option>
              <option value="EXOTIC">🐾 Exótico / Otro</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Raza del Catálogo</label>
            <select
              {...register("breedId")}
              onChange={(e) => {
                const b = filteredBreeds.find((x) => x.id === e.target.value);
                if (b) setValue("breed", b.name);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Seleccionar raza estándar...</option>
              {filteredBreeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Nombre de Raza / Cruce Manual
            </label>
            <Input
              {...register("breed")}
              placeholder="Ej. Mestizo, Golden Doodle..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Sexo y Estado Reproductivo
            </label>
            <select
              {...register("gender")}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={AnimalGender.MALE_NEUTERED}>Macho Castrado</option>
              <option value={AnimalGender.MALE_INTACT}>Macho Entero</option>
              <option value={AnimalGender.FEMALE_SPAYED}>Hembra Esterilizada</option>
              <option value={AnimalGender.FEMALE_INTACT}>Hembra Entera</option>
              <option value={AnimalGender.UNKNOWN}>Desconocido</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Fecha de Nacimiento</label>
            <Input
              type="date"
              {...register("birthDate")}
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Edad Estimada (Meses)</label>
            <Input
              type="number"
              {...register("estimatedAgeMonths")}
              placeholder="Ej. 24 meses (2 años)"
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Scale className="h-3 w-3 text-emerald-400" />
              Peso Inicial ($kg$) <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("initialWeightKg")}
              placeholder="Ej. 14.50"
              className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
            />
            {errors.initialWeightKg && (
              <p className="text-[10px] text-rose-400">{String(errors.initialWeightKg.message || "")}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Microchip ISO (15 dígitos)</label>
            <Input
              {...register("microchipNumber")}
              placeholder="98109810..."
              className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Color del Pelaje</label>
            <Input
              {...register("coatColor")}
              placeholder="Ej. Dorado, Negro y Fuego..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Grupo Sanguíneo</label>
            <Input
              {...register("bloodType")}
              placeholder="Ej. DEA 1.1 Pos / Tipo A"
              className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 3: SEGURIDAD CLÍNICA & TEMPERAMENTO ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          <span>3. Alertas de Seguridad Médica y Temperamento</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            Alerta de Temperamento para el Personal
          </label>
          <select
            {...register("temperamentAlert")}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
          >
            <option value={TemperamentAlertType.FRIENDLY}>
              🟢 Dócil / Amigable (Manejo estándar)
            </option>
            <option value={TemperamentAlertType.REQUIRES_MUZZLE}>
              🔴 Bozal Obligatorio (Riesgo de mordedura)
            </option>
            <option value={TemperamentAlertType.FRACTIOUS_CAT}>
              🟠 Gato Fractioso (Contención con toalla o sedación)
            </option>
            <option value={TemperamentAlertType.FEARFUL_AGGRESSIVE}>
              🟠 Agresivo por Miedo (Acercamiento lento y sin ruido)
            </option>
            <option value={TemperamentAlertType.HIGH_STRESS_CARDIOPATH}>
              🟣 Cardiópata Severo (Alto riesgo por estrés)
            </option>
            <option value={TemperamentAlertType.NO_DOGS_COMPATIBLE}>
              🔵 No compatible con perros en sala de espera
            </option>
          </select>
        </div>

        {/* Chips de Alergias Conocidas */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Alergias Fármaco-Alimentarias Críticas</span>
            <span className="text-[10px] text-slate-500">Presiona Enter o botón +</span>
          </label>

          <div className="flex items-center gap-2">
            <Input
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAllergy(allergyInput);
                }
              }}
              placeholder="Ej. Penicilina, Ivermectina, Pollo..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAllergy(allergyInput)}
              className="h-9 px-3 border-slate-800 hover:bg-slate-800 text-slate-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {allergies.map((all, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-red-600/30 border border-red-500/50 px-2 py-1 text-xs font-bold text-red-200"
              >
                ⚠️ {all}
                <button
                  type="button"
                  onClick={() => removeAllergy(i)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Chips de Condiciones Crónicas */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Condiciones Preexistentes o Crónicas
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCondition(conditionInput);
                }
              }}
              placeholder="Ej. Insuficiencia Renal, Cardiopatía Grado II, Epilepsia..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCondition(conditionInput)}
              className="h-9 px-3 border-slate-800 hover:bg-slate-800 text-slate-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {conditions.map((cond, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 px-2 py-1 text-xs font-medium text-cyan-200"
              >
                {cond}
                <button
                  type="button"
                  onClick={() => removeCondition(i)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTONES DE ENVÍO ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs h-10 px-5"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-10 px-6 gap-2 shadow-lg shadow-emerald-600/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando Expediente...
            </>
          ) : (
            <>
              <PawPrint className="h-4 w-4" />
              Abrir Expediente Clínico 360°
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

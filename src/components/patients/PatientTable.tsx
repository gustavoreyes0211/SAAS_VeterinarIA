"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  PawPrint,
  User,
  Stethoscope,
  FileText,
  AlertTriangle,
  Scale,
  Sparkles,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemperamentAlertType } from "@prisma/client";

interface PatientItem {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string;
  birthDate: Date | null;
  estimatedAgeMonths: number | null;
  microchipNumber: string | null;
  temperamentAlert: TemperamentAlertType;
  knownAllergies: string[];
  isDeceased: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phoneE164: string;
  };
  breedRelation: {
    name: string;
    standardWeightMaleKg: any;
    standardWeightFemKg: any;
  } | null;
  weightHistories: {
    weightKg: any;
    recordedAt: Date;
  }[];
}

interface PatientTableProps {
  initialPatients: PatientItem[];
  branchCode: string;
}

export function PatientTable({ initialPatients, branchCode }: PatientTableProps) {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");

  const filteredPatients = initialPatients.filter((pet) => {
    const q = search.toLowerCase().trim();
    const tutorName = `${pet.client.firstName} ${pet.client.lastName}`.toLowerCase();

    const matchesSearch =
      q === "" ||
      pet.name.toLowerCase().includes(q) ||
      tutorName.includes(q) ||
      (pet.microchipNumber && pet.microchipNumber.includes(q)) ||
      (pet.breed && pet.breed.toLowerCase().includes(q)) ||
      pet.client.phoneE164.includes(q);

    const matchesSpecies = speciesFilter === "ALL" || pet.species === speciesFilter;

    return matchesSearch && matchesSpecies;
  });

  const getSpeciesEmoji = (species: string) => {
    if (species === "CANINE") return "🐶";
    if (species === "FELINE") return "🐱";
    return "🐾";
  };

  const getTemperamentBadge = (alert: TemperamentAlertType) => {
    switch (alert) {
      case TemperamentAlertType.REQUIRES_MUZZLE:
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] font-bold">
            🔴 Bozal
          </Badge>
        );
      case TemperamentAlertType.FRACTIOUS_CAT:
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-bold">
            🟠 Fractioso
          </Badge>
        );
      case TemperamentAlertType.FEARFUL_AGGRESSIVE:
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
            Agresivo
          </Badge>
        );
      case TemperamentAlertType.HIGH_STRESS_CARDIOPATH:
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
            Cardiópata
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
            Dócil
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ── BARRA DE BÚSQUEDA Y FILTRO DE ESPECIE ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente por nombre, tutor, raza o número de microchip..."
            className="pl-9 bg-slate-950/80 border-slate-800 text-xs text-white placeholder:text-slate-500 h-10 w-full rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Todas las especies</option>
            <option value="CANINE">🐶 Caninos</option>
            <option value="FELINE">🐱 Felinos</option>
            <option value="EXOTIC">🐾 Exóticos</option>
          </select>

          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-10 gap-1.5 shadow-md shadow-emerald-600/20 rounded-xl"
          >
            <Link href={`/${branchCode}/pacientes/nuevo`}>
              <PlusCircle className="h-4 w-4" />
              Nuevo Paciente
            </Link>
          </Button>
        </div>
      </div>

      {/* ── TABLA DE PACIENTES ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Paciente (Mascota)</th>
                <th className="py-3.5 px-4">Tutor Responsable</th>
                <th className="py-3.5 px-4">Sexo / Edad</th>
                <th className="py-3.5 px-4">Último Peso</th>
                <th className="py-3.5 px-4">Seguridad Clínica</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <PawPrint className="h-8 w-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-400">
                      No se encontraron pacientes registrados
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Registra una nueva mascota o modifica tu criterio de búsqueda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pet) => {
                  const lastWeight = pet.weightHistories?.[0]?.weightKg;
                  const prevWeight = pet.weightHistories?.[1]?.weightKg;
                  const weightDiff =
                    lastWeight && prevWeight
                      ? Number(lastWeight) - Number(prevWeight)
                      : null;

                  return (
                    <tr
                      key={pet.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Columna 1: Nombre & Raza */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg font-bold shrink-0">
                            {getSpeciesEmoji(pet.species)}
                          </div>
                          <div>
                            <Link
                              href={`/${branchCode}/pacientes/${pet.id}`}
                              className="font-bold text-white group-hover:text-emerald-300 transition-colors text-sm hover:underline"
                            >
                              {pet.name}
                            </Link>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {pet.breed || pet.breedRelation?.name || "Mestizo"}
                              {pet.microchipNumber && (
                                <span className="ml-1.5 font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                                  CHIP: {pet.microchipNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna 2: Tutor */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/${branchCode}/clientes/${pet.client.id}`}
                          className="font-medium text-slate-200 hover:text-emerald-400 transition-colors block"
                        >
                          {pet.client.firstName} {pet.client.lastName}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {pet.client.phoneE164}
                        </span>
                      </td>

                      {/* Columna 3: Sexo / Edad */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300">
                          {pet.gender === "MALE_NEUTERED"
                            ? "Macho Castrado"
                            : pet.gender === "FEMALE_SPAYED"
                            ? "Hembra Esterilizada"
                            : pet.gender === "MALE_INTACT"
                            ? "Macho Entero"
                            : pet.gender === "FEMALE_INTACT"
                            ? "Hembra Entera"
                            : "Desconocido"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pet.estimatedAgeMonths
                            ? `${Math.floor(pet.estimatedAgeMonths / 12)} años`
                            : "Edad no registrada"}
                        </div>
                      </td>

                      {/* Columna 4: Peso */}
                      <td className="py-3.5 px-4">
                        {lastWeight ? (
                          <div>
                            <div className="font-mono font-bold text-white text-xs">
                              {Number(lastWeight).toFixed(2)} kg
                            </div>
                            {weightDiff !== null && (
                              <div
                                className={`text-[10px] font-mono ${
                                  weightDiff > 0
                                    ? "text-emerald-400"
                                    : weightDiff < 0
                                    ? "text-rose-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {weightDiff > 0 ? `+${weightDiff.toFixed(2)}` : weightDiff.toFixed(2)} kg
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Sin peso</span>
                        )}
                      </td>

                      {/* Columna 5: Seguridad Clínica */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getTemperamentBadge(pet.temperamentAlert)}
                          {pet.knownAllergies.length > 0 && (
                            <span className="rounded bg-red-600/30 border border-red-500/50 px-1.5 py-0.5 text-[9px] font-bold text-red-200">
                              ⚠️ {pet.knownAllergies.join(", ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Columna 6: Acciones */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            <Link href={`/${branchCode}/pacientes/${pet.id}`}>
                              <FileText className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                              Expediente 360°
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          >
                            <Link href={`/${branchCode}/consultas/nueva?patientId=${pet.id}`}>
                              <Stethoscope className="h-3.5 w-3.5 mr-1" />
                              Consulta
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

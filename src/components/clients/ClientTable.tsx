"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  Receipt,
  User,
  ExternalLink,
  PlusCircle,
  Filter,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientCategoryTag, ClientTaxType } from "@prisma/client";
import { ClientFormModal } from "./ClientFormModal";

interface ClientWithPatients {
  id: string;
  firstName: string;
  lastName: string;
  taxType: ClientTaxType;
  category: ClientCategoryTag;
  dui: string | null;
  nit: string | null;
  nrc: string | null;
  tradeName: string | null;
  phoneE164: string;
  email: string;
  address: string;
  currentBalance: any;
  patients: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    temperamentAlert: string;
    isDeceased: boolean;
  }[];
}

interface ClientTableProps {
  initialClients: ClientWithPatients[];
  branchCode: string;
}

export function ClientTable({ initialClients, branchCode }: ClientTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredClients = initialClients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const query = search.toLowerCase().trim();

    const matchesSearch =
      query === "" ||
      fullName.includes(query) ||
      client.phoneE164.includes(query) ||
      client.email.toLowerCase().includes(query) ||
      (client.dui && client.dui.includes(query)) ||
      (client.nit && client.nit.includes(query)) ||
      (client.tradeName && client.tradeName.toLowerCase().includes(query)) ||
      client.patients.some((p) => p.name.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === "ALL" || client.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat: ClientCategoryTag) => {
    switch (cat) {
      case ClientCategoryTag.VIP:
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium text-[10px]">
            ★ VIP
          </Badge>
        );
      case ClientCategoryTag.FREQUENT:
        return (
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
            Frecuente
          </Badge>
        );
      case ClientCategoryTag.RESCUER_SHELTER:
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
            Refugio
          </Badge>
        );
      case ClientCategoryTag.DEBTOR:
        return (
          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">
            Moroso
          </Badge>
        );
      case ClientCategoryTag.HIGH_RISK_CAUTION:
        return (
          <Badge className="bg-red-600/30 text-red-200 border-red-500/40 text-[10px]">
            Precaución
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
            Estándar
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de tutor, mascota, teléfono, correo o DUI/NIT..."
            className="pl-9 bg-slate-950/80 border-slate-800 text-xs text-white placeholder:text-slate-500 h-10 w-full rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Todas las categorías</option>
            <option value={ClientCategoryTag.STANDARD}>Estándar</option>
            <option value={ClientCategoryTag.VIP}>VIP</option>
            <option value={ClientCategoryTag.FREQUENT}>Frecuente</option>
            <option value={ClientCategoryTag.RESCUER_SHELTER}>Refugio / Rescate</option>
            <option value={ClientCategoryTag.DEBTOR}>Deudor Moroso</option>
            <option value={ClientCategoryTag.HIGH_RISK_CAUTION}>Atención con Precaución</option>
          </select>

          <ClientFormModal
            branchCode={branchCode}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </div>
      </div>

      {/* ── TABLA PRINCIPAL DE CLIENTES ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tutor / Contribuyente</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Contacto Directo</th>
                <th className="py-3.5 px-4">Mascotas Asociadas</th>
                <th className="py-3.5 px-4 text-right">Cuenta Corriente</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <User className="h-8 w-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-400">
                      No se encontraron clientes registrados
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Intenta con otro término de búsqueda o agrega un nuevo tutor.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const balanceNum = Number(client.currentBalance) || 0;
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Columna 1: Nombre & Datos Fiscales */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0 mt-0.5">
                            {client.firstName[0]}
                            {client.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                              {client.firstName} {client.lastName}
                              {client.tradeName && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({client.tradeName})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                              {client.dui && <span>DUI: {client.dui}</span>}
                              {client.nrc && <span>NRC: {client.nrc}</span>}
                              {!client.dui && !client.nrc && (
                                <span className="text-slate-500 italic">Sin DTE registrado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna 2: Categoría */}
                      <td className="py-3.5 px-4">
                        {getCategoryBadge(client.category)}
                      </td>

                      {/* Columna 3: Contacto */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <a
                            href={`https://wa.me/${client.phoneE164.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 transition-colors font-mono"
                          >
                            <Phone className="h-3 w-3 text-emerald-400" />
                            {client.phoneE164}
                          </a>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                            <Mail className="h-3 w-3 text-cyan-400" />
                            {client.email}
                          </div>
                        </div>
                      </td>

                      {/* Columna 4: Mascotas */}
                      <td className="py-3.5 px-4">
                        {client.patients.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic">
                            Sin pacientes
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {client.patients.map((pet) => (
                              <Link
                                key={pet.id}
                                href={`/${branchCode}/pacientes/${pet.id}`}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-200 border border-slate-700/60 transition-colors"
                              >
                                <PawPrint className="h-2.5 w-2.5 text-emerald-400" />
                                <span className="font-medium">{pet.name}</span>
                                <span className="text-slate-400">
                                  ({pet.species === "CANINE" ? "Canino" : "Felino"})
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Columna 5: Saldo */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-mono font-bold text-xs ${
                            balanceNum < 0
                              ? "text-rose-400"
                              : balanceNum > 0
                              ? "text-emerald-400"
                              : "text-slate-400"
                          }`}
                        >
                          ${balanceNum.toFixed(2)}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {balanceNum < 0 ? "Pendiente pago" : balanceNum > 0 ? "A favor" : "Al día"}
                        </div>
                      </td>

                      {/* Columna 6: Acciones */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            <Link href={`/${branchCode}/clientes/${client.id}`}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Ficha
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

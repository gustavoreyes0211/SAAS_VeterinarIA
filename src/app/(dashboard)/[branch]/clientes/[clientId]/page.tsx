import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/actions/clients";
import {
  User,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Receipt,
  ShieldCheck,
  HeartHandshake,
  PawPrint,
  PlusCircle,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientCategoryTag, ClientTaxType } from "@prisma/client";

interface ClientDetailPageProps {
  params: Promise<{
    branch: string;
    clientId: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { branch, clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) {
    notFound();
  }

  const balanceNum = Number(client.currentBalance) || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── BOTÓN VOLVER Y BREADCRUMB ── */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-slate-400 hover:text-white gap-1.5"
        >
          <Link href={`/${branch}/clientes`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al Directorio de Tutores
          </Link>
        </Button>
      </div>

      {/* ── TARJETA PRINCIPAL DEL TUTOR ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-2xl font-bold">
              {client.firstName[0]}
              {client.lastName[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {client.firstName} {client.lastName}
                </h1>
                {client.category === ClientCategoryTag.VIP && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                    ★ Tutor VIP
                  </Badge>
                )}
                {client.category === ClientCategoryTag.DEBTOR && (
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
                    Cuenta con Saldo Pendiente
                  </Badge>
                )}
              </div>

              {client.tradeName && (
                <p className="text-xs text-slate-300 font-medium">
                  Razón Social: <span className="text-white">{client.tradeName}</span>
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap font-mono">
                {client.dui && <span>DUI: {client.dui}</span>}
                {client.nit && <span>NIT: {client.nit}</span>}
                {client.nrc && <span>NRC: {client.nrc}</span>}
                <span>
                  Tipo:{" "}
                  {client.taxType === ClientTaxType.CONSUMIDOR_FINAL
                    ? "Consumidor Final (DTE-01)"
                    : "Crédito Fiscal (DTE-03)"}
                </span>
              </div>
            </div>
          </div>

          {/* Saldo y Estado Financiero */}
          <div className="flex flex-col items-start md:items-end justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-800 min-w-[200px]">
            <span className="text-[11px] font-medium text-slate-400">Estado de Cuenta</span>
            <div
              className={`text-2xl font-mono font-bold mt-1 ${
                balanceNum < 0
                  ? "text-rose-400"
                  : balanceNum > 0
                  ? "text-emerald-400"
                  : "text-slate-300"
              }`}
            >
              ${balanceNum.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Límite de crédito: ${Number(client.creditLimit).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Canales de contacto y dirección */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Teléfono Principal / WhatsApp</span>
              <a
                href={`https://wa.me/${client.phoneE164.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-emerald-400 font-mono"
              >
                {client.phoneE164}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Correo Electrónico</span>
              <span className="text-white">{client.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Dirección Registrada</span>
              <span className="text-white truncate block max-w-xs">{client.address}</span>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia Alternativo */}
        {client.emergencyContactName && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">
                Contacto Alternativo para Emergencias:
              </span>
              <span className="text-white font-bold">{client.emergencyContactName}</span>
              {client.emergencyContactRelationship && (
                <span className="text-slate-400">({client.emergencyContactRelationship})</span>
              )}
            </div>
            {client.emergencyContactPhone && (
              <span className="font-mono text-emerald-400 font-medium">
                {client.emergencyContactPhone}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── MASCOTAS ASOCIADAS AL TUTOR ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Mascotas Registradas ({client.patients.length})
            </h2>
          </div>

          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Link href={`/${branch}/pacientes/nuevo?clientId=${client.id}`}>
              <PlusCircle className="h-4 w-4" />
              Registrar Nueva Mascota
            </Link>
          </Button>
        </div>

        {client.patients.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            <PawPrint className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">
              Este tutor aún no tiene mascotas vinculadas
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Registra la primera mascota para abrir su expediente clínico 360°.
            </p>
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9"
            >
              <Link href={`/${branch}/pacientes/nuevo?clientId=${client.id}`}>
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Registrar Mascota Ahora
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.patients.map((pet) => {
              const lastWeight = pet.weightHistories?.[0]?.weightKg;
              return (
                <div
                  key={pet.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-xl font-bold border border-emerald-500/20">
                          {pet.species === "CANINE" ? "🐶" : pet.species === "FELINE" ? "🐱" : "🐾"}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">
                            {pet.name}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {pet.breed || pet.breedRelation?.name || "Raza no especificada"}
                          </span>
                        </div>
                      </div>

                      {pet.isDeceased ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Fallecido
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                          Activo
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Especie / Sexo</span>
                        <span className="text-white font-medium">
                          {pet.species === "CANINE" ? "Canino" : "Felino"} • {pet.gender}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Último Peso</span>
                        <span className="text-emerald-400 font-mono font-medium">
                          {lastWeight ? `${Number(lastWeight).toFixed(2)} kg` : "Sin peso"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-white"
                    >
                      <Link href={`/${branch}/pacientes/${pet.id}`}>
                        <FileText className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                        Expediente 360°
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                    >
                      <Link href={`/${branch}/consultas/nueva?patientId=${pet.id}`}>
                        Nueva Consulta
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

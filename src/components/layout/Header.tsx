"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  DoorOpen,
  Volume2,
  VolumeX,
  Search,
  AlertTriangle,
} from "lucide-react";
import { BranchSwitcher } from "@/components/layout/BranchSwitcher";
import { Badge } from "@/components/ui/badge";

export function Header({ branchId = "central" }: { branchId?: string }) {
  const [time, setTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reloj hospitalario en vivo (El Salvador / CST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-SV", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* ── SECTOR IZQUIERDO: SWITCHER DE SEDE & SALA ACTIVA ── */}
      <div className="flex items-center gap-4">
        <BranchSwitcher currentBranchId={branchId} />

        {/* Sala actual del médico */}
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
          <DoorOpen className="h-4 w-4 text-emerald-400" />
          <span>
            Sala Asignada: <strong className="text-white">Consultorio 1 (Caninos)</strong>
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
      </div>

      {/* ── SECTOR CENTRAL: BÚSQUEDA RÁPIDA GLOBAL ── */}
      <div className="hidden lg:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Microchip, Paciente, Tutor o Teléfono... (Ctrl + K)"
            className="w-full h-9 rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* ── SECTOR DERECHO: CÓDIGO ROJO, RELOJ Y CONTROLES ── */}
      <div className="flex items-center gap-3">
        {/* Alerta de Urgencias Activas */}
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />
          <span className="hidden sm:inline font-medium">Código Rojo:</span>
          <Badge variant="destructive" className="px-1.5 py-0 h-5">
            2 Críticos
          </Badge>
        </div>

        {/* Sonido de Alarma / Chime */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          title={soundEnabled ? "Silenciar alarmas sonoras" : "Activar sonido de turnos y paro"}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <VolumeX className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {/* Campana de Notificaciones */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
        </button>

        {/* Reloj Hospitalario Oficial */}
        <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3 text-xs text-slate-300 font-mono">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span>{time || "08:00:00 AM"}</span>
        </div>
      </div>
    </header>
  );
}

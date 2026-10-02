"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Timer,
  ShieldAlert,
  Zap,
  Activity,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CprMetronomeProps {
  patientName?: string;
  weightKg?: number;
  onLogEvent?: (event: string) => void;
}

export function CprMetronome({
  patientName = "Paciente en Paro",
  weightKg = 10,
  onLogEvent,
}: CprMetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(110);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [beatVisual, setBeatVisual] = useState(false);

  // Temporizadores
  const [cycleSeconds, setCycleSeconds] = useState(120); // 2 minutos
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const [roscAchieved, setRoscAchieved] = useState(false);

  // Web Audio Context ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Tono agudo claro (A5)

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  // Metrónomo Beat Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000;
      interval = setInterval(() => {
        playBeep();
        setBeatVisual(true);
        setTimeout(() => setBeatVisual(false), 120);
      }, intervalMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, bpm, soundEnabled]);

  // Cronómetro de ciclo (2 min) y total
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
        setCycleSeconds((prev) => {
          if (prev <= 1) {
            // Ciclo de 2 minutos terminado
            setCycleCount((c) => c + 1);
            if (onLogEvent) {
              onLogEvent(`Fin del Ciclo ${cycleCount} (2 min). Cambio de operador.`);
            }
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, cycleCount, onLogEvent]);

  const togglePlay = () => {
    if (!isPlaying && !audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCycleSeconds(120);
    setTotalSeconds(0);
    setCycleCount(1);
    setRoscAchieved(false);
  };

  const handleRosc = () => {
    setIsPlaying(false);
    setRoscAchieved(true);
    if (onLogEvent) {
      onLogEvent(`¡RETORNO DE CIRCULACIÓN ESPONTÁNEA (ROSC) ALCANZADO! Tiempo total: ${formatTime(totalSeconds)}.`);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
      {/* Luz pulsante de fondo con el latido */}
      <div
        className={`absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-100 ${
          beatVisual ? "bg-rose-500/30 opacity-100 scale-110" : "bg-rose-500/10 opacity-30 scale-100"
        }`}
      />

      <div className="relative z-10 space-y-6">
        {/* Cabecera del Metrónomo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-100 ${
                beatVisual
                  ? "bg-rose-600 text-white border-rose-400 scale-105 shadow-lg shadow-rose-600/50"
                  : "bg-rose-500/20 text-rose-400 border-rose-500/40"
              }`}
            >
              <Heart className={`h-6 w-6 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-rose-400 uppercase">
                  Metrónomo de RCP • RECOVER 2.0
                </span>
                <Badge
                  className={
                    isPlaying
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300"
                  }
                >
                  {isPlaying ? "EN CURSO" : "DETENIDO"}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {patientName} ({weightKg} kg)
              </h2>
            </div>
          </div>

          {/* Selector de Cadencia BPM */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Ritmo:</span>
            {[100, 110, 120].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setBpm(rate)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  bpm === rate
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {rate} BPM
              </button>
            ))}
          </div>
        </div>

        {/* Panel Central: Pulso visual, Temporizador de Ciclo y Tiempo Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {/* Ciclo Actual de 2 Minutos */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              cycleSeconds <= 15
                ? "border-amber-500/80 bg-amber-950/30 animate-pulse text-amber-300"
                : "border-slate-800 bg-slate-900/60 text-white"
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
              <Timer className="h-3 w-3 text-rose-400" />
              Ciclo {cycleCount} (Cambio en):
            </div>
            <div className="text-4xl font-mono font-extrabold mt-1 text-rose-400">
              {formatTime(cycleSeconds)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {cycleSeconds <= 15 ? "⚠️ ¡PREPARAR RELEVO!" : "Compresiones ininterrumpidas"}
            </span>
          </div>

          {/* Ritmo Activo y Animación */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center justify-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Frecuencia Cardíaca Objetivo
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-extrabold text-white">{bpm}</span>
              <span className="text-xs text-rose-400 font-bold">comp/min</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  beatVisual ? "bg-rose-500 scale-125 ring-4 ring-rose-500/30" : "bg-slate-700"
                }`}
              />
              <span className="text-[10px] text-slate-400 font-mono">1/3 a 1/2 tórax</span>
            </div>
          </div>

          {/* Tiempo Total de RCP */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-cyan-400" />
              Tiempo Total en Paro:
            </div>
            <div className="text-4xl font-mono font-extrabold text-white mt-1">
              {formatTime(totalSeconds)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {totalSeconds >= 600 ? "⚠️ Paro Prolongado (>10 min)" : "Ventilar 10 rpm (1 c/6s)"}
            </span>
          </div>
        </div>

        {/* Controles Principales */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlay}
              className={`h-11 px-6 rounded-2xl text-sm font-bold gap-2 shadow-lg transition-all ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-white" /> Pausar Metrónomo
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" /> Iniciar RCP (110 BPM)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-11 w-11 rounded-2xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
              title={soundEnabled ? "Silenciar pitido sonoro" : "Activar pitido sonoro"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="h-11 px-3 rounded-2xl border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
            </Button>
          </div>

          {/* Botón de Victoria Clínica: ROSC */}
          <Button
            onClick={handleRosc}
            className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/30"
          >
            <Award className="h-4 w-4" />
            ¡ROSC (Pulso Recuperado)!
          </Button>
        </div>

        {roscAchieved && (
          <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-4 text-emerald-200 text-xs flex items-center justify-between animate-in zoom-in-95">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>
                <strong>¡Retorno de Circulación Espontánea registrado!</strong> Proceder de inmediato a cuidados post-paro (oxigenoterapia al 100%, monitoreo de presión arterial media PAM &gt; 80 mmHg y gasometría).
              </span>
            </div>
            <Badge className="bg-emerald-600 text-white shrink-0 ml-2">ESTABILIZAR</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

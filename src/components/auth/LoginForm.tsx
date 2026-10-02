"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Clock,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Ingrese un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@veterinaria.com",
      password: "Password123!",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/central/dashboard";
    }, 600);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) {
      setErrorMessage("El código debe tener 6 dígitos.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/central/dashboard";
    }, 600);
  };

  // Botones de acceso rápido para pruebas
  const setDemoRole = (role: "doctor" | "director" | "reception") => {
    setValue("email", "admin@veterinaria.com");
    setValue("password", "Password123!");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ──────────────────────────────────────────────────────────
          PANEL IZQUIERDO: BRANDING CLÍNICO & HERO HOSPITALARIO
         ────────────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-r border-slate-800 overflow-hidden">
        {/* Orbes de luz de fondo con blur */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera institucional */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
              <HeartPulse className="h-7 w-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  VeterinarIA<span className="text-emerald-400">Next</span>
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                  HOSPITAL 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Red Hospitalaria & Centro de Cuidados Intensivos
              </p>
            </div>
          </div>
        </div>

        {/* Hero Central Informativo */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-emerald-400 border border-slate-700/60 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Suite Médica Hospitalaria & Facturación DTE
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Plataforma Integral de <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Alta Precisión Clínica
            </span>
          </h1>

          <p className="mt-4 text-sm text-slate-300 max-w-lg leading-relaxed">
            Gestión en tiempo real de quirófanos, UCI 24/7 con fluidoterapia CRI,
            semáforo de triaje VECCS, expediente longitudinal 360°, farmacia con
            lotes PEPS/FIFO y emisión de Facturación Electrónica avalada por el
            Ministerio de Hacienda de El Salvador.
          </p>

          {/* Tarjetas de características en grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Stethoscope className="h-4 w-4" />
                <span className="text-xs font-semibold text-white">
                  Core Clínico SOAP
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Examen físico de 10 sistemas y recetas oficiales con QR y firma JVPM.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-teal-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-semibold text-white">
                  DTE El Salvador
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Factura (01) y Crédito Fiscal (03) con firma JWS RS512 y contingencia.
              </p>
            </div>
          </div>
        </div>

        {/* Footer institucional de seguridad */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Aislamiento Multi-Tenant con PostgreSQL RLS</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Servicio Hospitalario Continuo 24/7</span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          PANEL DERECHO: FORMULARIO DE ACCESO PROFESIONAL
         ────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          {/* Logo en versión móvil */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">
                VeterinarIA<span className="text-emerald-400">Next</span>
              </span>
              <p className="text-[11px] text-slate-400">Acceso Profesional Clínico</p>
            </div>
          </div>

          {/* Tarjeta de Login Glassmorphic */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            {!requiresTwoFactor ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Iniciar Sesión
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingrese con sus credenciales médicas o administrativas.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Campo Correo Electrónico */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Correo Electrónico o Usuario
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="doctor@hospitalvet.sv"
                        className="pl-10 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-rose-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Campo Contraseña */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">
                        Contraseña
                      </label>
                      <a
                        href="#recuperar"
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        ¿Olvidó su clave?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="pl-10 pr-10 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-rose-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Checkbox Recordar Sesión */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                      <input
                        {...register("rememberMe")}
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                      />
                      <span>Recordar mi sesión en este equipo</span>
                    </label>
                  </div>

                  {/* Botón de Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/25 mt-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verificando credenciales...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Ingresar al Sistema Clínico</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Accesos rápidos de demostración */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Perfiles de Prueba Rápidos:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoRole("doctor")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Stethoscope className="h-3 w-3 text-emerald-400" />
                      Médico
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoRole("director")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="h-3 w-3 text-cyan-400" />
                      Director
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoRole("reception")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Clock className="h-3 w-3 text-amber-400" />
                      Recepción
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Modal / Formulario 2FA */
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto">
                  <KeyRound className="h-6 w-6" />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">
                    Verificación en Dos Pasos (2FA)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingrese el código de 6 dígitos de su aplicación autenticadora o enviado a su WhatsApp.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <Input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    className="text-center text-2xl tracking-[0.5em] font-mono font-bold h-14 bg-slate-950 border-slate-700 text-emerald-400"
                    autoFocus
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || twoFactorCode.length !== 6}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/25"
                  >
                    {isLoading ? "Validando token..." : "Confirmar y Acceder"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setRequiresTwoFactor(false)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Volver a ingresar credenciales
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Información legal al pie */}
          <div className="mt-8 text-center text-[11px] text-slate-500">
            © 2026 VeterinarIA SaaS. Plataforma clínica multi-sede conforme con Ministerio de Hacienda de El Salvador.
          </div>
        </div>
      </div>
    </div>
  );
}

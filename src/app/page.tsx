import Link from "next/link";
import {
  HeartPulse,
  Stethoscope,
  Siren,
  Scissors,
  Activity,
  ReceiptText,
  ShieldCheck,
  Building2,
  Tv,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      {/* ── BARRA DE NAVEGACIÓN SUPERIOR ── */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                VeterinarIA<span className="text-emerald-400">Next</span>
              </span>
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                Hospital 24/7 & DTE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="text-xs h-9 border-slate-700 hover:bg-slate-800"
            >
              <Link href="/central/dashboard">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Consola Clínica
              </Link>
            </Button>
            <Button
              asChild
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
            >
              <Link href="/login">
                Acceso Profesional
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER PRINCIPAL ── */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-4 py-1.5 text-xs text-emerald-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            SaaS Hospitalario Veterinario • Multi-Sucursal • Facturación MH El Salvador
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Plataforma Médica y Quirúrgica para{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Hospitales Veterinarios 24/7
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Diseñado para hospitales de alta complejidad: quirófanos con riesgo ASA,
            Pizarra UCI con infusión continua (CRI), semáforo de triaje VECCS,
            consultas SOAP AAHA y facturación electrónica nativa (DTE-01 y DTE-03).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-600/25 h-12 px-8 rounded-xl"
            >
              <Link href="/login">
                Iniciar Sesión en el Sistema
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white font-semibold text-sm h-12 px-6 rounded-xl"
            >
              <Link href="/central/dashboard">
                Ver Demo de Consola Clínica
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── MATRIZ DE MÓDULOS HOSPITALARIOS EN TIEMPO REAL ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Arquitectura Hospitalaria de Nivel Empresarial
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Módulos integrados con control de acceso granular (RBAC) y aislamiento multi-tenant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Core SOAP */}
          <Link
            href="/central/dashboard"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-emerald-500/50 hover:bg-slate-900 transition-all shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Consultas SOAP & Recetas QR
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Examen físico sistemático de 10 órganos, cálculo de dosis por peso ($mg/kg$) y recetas con firma y colegiatura oficial JVPM de El Salvador.
            </p>
          </Link>

          {/* Card 2: Urgencias VECCS */}
          <Link
            href="/central/dashboard"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-rose-500/50 hover:bg-slate-900 transition-all shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Siren className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Emergencias & Carrito Rojo
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Semáforo de triaje de 5 niveles (Rojo a Azul), evaluación rápida ABCDE en 30 segundos, alarma de Código Rojo y calculadora RECOVER.
            </p>
          </Link>

          {/* Card 3: Quirófano & UCI */}
          <Link
            href="/central/dashboard"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-cyan-500/50 hover:bg-slate-900 transition-all shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Scissors className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Quirófano & Pizarra UCI 24/7
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Estratificación de riesgo anestésico ASA, monitoreo transoperatorio minuto a minuto y Flowboard UCI con fluidoterapia continua (CRI).
            </p>
          </Link>

          {/* Card 4: Facturación DTE */}
          <Link
            href="/central/dashboard"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-emerald-500/50 hover:bg-slate-900 transition-all shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 group-hover:scale-110 transition-transform">
              <ReceiptText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Facturación DTE El Salvador
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Emisión de Factura Electrónica (DTE-01) y Crédito Fiscal (03) con firma criptográfica JWS RS512 y modo contingencia offline con Redis BullMQ.
            </p>
          </Link>

          {/* Card 5: Kiosco Smart TV */}
          <Link
            href="/central/dashboard"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-amber-500/50 hover:bg-slate-900 transition-all shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Tv className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Llamador Turnos Smart TV
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Pantalla pública para televisores con campana hospitalaria sintetizada (Web Audio API), llamada por consultorio y modo OLED anti-burn-in.
            </p>
          </Link>

          {/* Card 6: Multi-Tenant & RLS */}
          <Link
            href="/central/dashboard"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-emerald-500/50 hover:bg-slate-900 transition-all shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Seguridad Multi-Tenant (RLS)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Blindaje relacional en PostgreSQL 16 con políticas Row-Level Security estrictas y matriz granular de 10 roles y permisos RBAC.
            </p>
          </Link>
        </div>
      </section>

      {/* ── FOOTER INSTITUCIONAL ── */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>
          © 2026 VeterinarIA SaaS. Plataforma especializada para hospitales veterinarios, quirófanos y redes multi-sede.
        </p>
      </footer>
    </div>
  );
}

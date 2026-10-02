"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  CalendarDays,
  History,
  PawPrint,
  Users,
  Siren,
  Zap,
  Activity,
  Scissors,
  ScanLine,
  FlaskConical,
  DoorClosed,
  Pill,
  Sparkles,
  ReceiptText,
  UserCog,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Moon,
  Sun,
  LogOut,
  Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "danger" | "warning" | "info";
  shortcut?: string;
  description?: string;
}

interface NavSection {
  category: string;
  items: NavItem[];
}

export function CollapsibleSidebar({
  branchId = "central",
  initialCollapsed = false,
}: {
  branchId?: string;
  initialCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const pathParts = pathname?.split("/").filter(Boolean) || [];
  const activeBranch = pathParts[0] || branchId;
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const { theme, isDark, toggleTheme } = useTheme();

  // Atajo de teclado global: Ctrl + B para colapsar/expandir
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigationSections: NavSection[] = [
    {
      category: "Clínica & Atención",
      items: [
        {
          title: "Agenda & Citas",
          href: `/${activeBranch}/citas`,
          icon: CalendarDays,
          badge: "Hoy",
          badgeVariant: "info",
          shortcut: "Ctrl+A",
          description: "Calendario de recepción y turnos",
        },
        {
          title: "Consultas Médicas (SOAP)",
          href: `/${activeBranch}/consultas`,
          icon: Stethoscope,
          badge: 3,
          badgeVariant: "info",
          shortcut: "Ctrl+S",
          description: "3 pacientes en sala de espera",
        },
        {
          title: "Expediente 360°",
          href: `/${activeBranch}/pacientes`,
          icon: History,
          shortcut: "Ctrl+H",
          description: "Historial longitudinal y timeline",
        },
        {
          title: "Pacientes (Mascotas)",
          href: `/${activeBranch}/pacientes`,
          icon: PawPrint,
          description: "Microchips ISO, razas y vacunas",
        },
        {
          title: "Clientes & Tutores",
          href: `/${activeBranch}/clientes`,
          icon: Users,
          description: "DUI/NIT/NRC, créditos y contactos",
        },
      ],
    },
    {
      category: "Urgencias & Quirófano",
      items: [
        {
          title: "Semáforo de Triaje (VECCS)",
          href: `/${activeBranch}/emergencias`,
          icon: Siren,
          badge: 2,
          badgeVariant: "danger",
          shortcut: "Ctrl+T",
          description: "2 pacientes clasificados en Rojo/Naranja",
        },
        {
          title: "Carrito Rojo (Paro CPR)",
          href: `/${activeBranch}/emergencias/crash-cart`,
          icon: Zap,
          shortcut: "Ctrl+R",
          description: "Calculadora RECOVER y metrónomo",
        },
        {
          title: "Centro Quirúrgico & ASA",
          href: `/${activeBranch}/quirofano`,
          icon: Scissors,
          description: "Monitoreo anestésico minuto a minuto",
        },
        {
          title: "Pizarra UCI 24/7 (Flowboard)",
          href: `/${activeBranch}/uci`,
          icon: Activity,
          badge: 4,
          badgeVariant: "warning",
          shortcut: "Ctrl+U",
          description: "4 pacientes con infusiones continuas CRI",
        },
      ],
    },
    {
      category: "Diagnóstico por Imagen",
      items: [
        {
          title: "Rayos X & Visor DICOM",
          href: `/${activeBranch}/imagenologia`,
          icon: ScanLine,
          description: "Visor Web PACS con mediciones VHS y TPLO",
        },
        {
          title: "Laboratorio Clínico",
          href: `/${activeBranch}/laboratorio`,
          icon: FlaskConical,
          description: "Biomarcadores y curvas de tendencias",
        },
      ],
    },
    {
      category: "Operaciones & Logística",
      items: [
        {
          title: "Consultorios & Salas",
          href: `/${activeBranch}/consultorios`,
          icon: DoorClosed,
          description: "Estados en tiempo real y asignación médica",
        },
        {
          title: "Inventario & Lotes PEPS",
          href: `/${activeBranch}/inventario`,
          icon: Pill,
          badge: "!",
          badgeVariant: "warning",
          shortcut: "Ctrl+I",
          description: "Viales abiertos en UCI y semáforo de vencimiento",
        },
        {
          title: "Peluquería / Grooming",
          href: `/${activeBranch}/peluqueria`,
          icon: Sparkles,
          description: "Tablero Kanban de baño y corte",
        },
      ],
    },
    {
      category: "Finanzas & Fiscal",
      items: [
        {
          title: "Facturación DTE El Salvador",
          href: `/${activeBranch}/facturacion`,
          icon: ReceiptText,
          shortcut: "Ctrl+F",
          description: "Factura DTE-01, Crédito Fiscal 03 y Hacienda",
        },
        {
          title: "Kiosco Turnos Smart TV",
          href: `/turnos/${activeBranch}`,
          icon: Tv,
          description: "Pantalla sala de espera con sonido chime",
        },
      ],
    },
    {
      category: "Administración",
      items: [
        {
          title: "Médicos JVPM & Usuarios",
          href: `/${activeBranch}/configuracion`,
          icon: UserCog,
          description: "Cédulas de colegiatura, firmas y RBAC",
        },
      ],
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "relative flex flex-col h-screen bg-slate-950 border-r border-slate-800/80 select-none z-30 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        {/* ── CABECERA DE LA SIDEBAR ── */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-800/80">
          <Link
            href={`/${branchId}/dashboard`}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
              <HeartPulse className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-200">
                <span className="text-sm font-bold tracking-tight text-white leading-tight">
                  VeterinarIA<span className="text-emerald-400">Next</span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Hospital 24/7
                </span>
              </div>
            )}
          </Link>

          {/* Botón de Colapso con Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                aria-label="Colapsar menú lateral"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>{isCollapsed ? "Expandir menú (Ctrl+B)" : "Colapsar menú (Ctrl+B)"}</span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── LISTA DE MENÚ SCROLLABLE ── */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.category}
                </div>
              )}

              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                // Renderizado para modo COLAPSADO con Tooltip Flotante
                if (isCollapsed) {
                  return (
                    <Tooltip key={itemIdx}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-bold"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {/* Dot Badge en modo colapsado */}
                          {item.badge && (
                            <span
                              className={cn(
                                "absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-slate-950",
                                item.badgeVariant === "danger"
                                  ? "bg-rose-500 animate-ping"
                                  : item.badgeVariant === "warning"
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              )}
                            />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={14}
                        className="bg-slate-900 border-slate-700/80 text-white p-2.5 max-w-xs shadow-2xl"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-xs text-white">
                            {item.title}
                          </span>
                          {item.shortcut && (
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono font-medium text-emerald-400 border border-slate-700">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {item.description}
                          </p>
                        )}
                        {item.badge && (
                          <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-emerald-300 font-medium">
                            Estado: {item.badge} pendientes
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                // Renderizado para modo EXPANDIDO
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                      isActive
                        ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-emerald-400"
                            : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {/* Badges numéricos en modo expandido */}
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
                          item.badgeVariant === "danger"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                            : item.badgeVariant === "warning"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── FOOTER DE USUARIO & CONTROLES ── */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60">
          {!isCollapsed ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              {/* Tarjeta de Médico en Turno */}
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                  AM
                </div>
                <div className="flex-1 truncate">
                  <span className="font-semibold text-xs text-white block truncate">
                    Dra. Andrea Martínez
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>Cirujana Líder</span>
                    <span className="text-emerald-400 font-medium">JVPM #4821</span>
                  </div>
                </div>
              </div>

              {/* Botones de Utilidad */}
              <div className="flex items-center justify-between px-1 text-slate-400">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 text-[11px] hover:text-white transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-800/60"
                  title={isDark ? "Cambiar a Modo Día" : "Cambiar a Modo Quirófano"}
                >
                  {isDark ? (
                    <>
                      <Moon className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Modo Quirófano</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      <span>Modo Día</span>
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Salir</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Modo colapsado en footer */
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 cursor-pointer">
                    AM
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="font-semibold">Dra. Andrea Martínez</div>
                  <div className="text-[11px] text-slate-400">Cirujana Líder • JVPM #4821</div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isDark ? <Moon className="h-4 w-4 text-cyan-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>{isDark ? "Modo Quirófano (Activo)" : "Modo Día (Activo)"}</span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/login"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>Cerrar Sesión</span>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

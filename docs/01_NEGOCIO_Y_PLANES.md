# 01. MODELO DE NEGOCIO Y MATRIZ DE PLANES (TIERS)

Este documento detalla el posicionamiento de mercado, análisis competitivo y la matriz de capacidades de la plataforma SaaS, estructurada en tres niveles de suscripción escalables.

---

## 1. ANÁLISIS COMPETITIVO Y DIFERENCIADORES DE MERCADO

A partir de la investigación de plataformas internacionales de gestión veterinaria (*Digitail, ezyVet, Instinct EMR, DaySmart Vet*):

| Plataforma | Fortalezas | Debilidades Críticas | Nuestra Ventaja Competitiva |
| :--- | :--- | :--- | :--- |
| **Digitail** | Interfaz moderna, notas clínicas asistidas. | Fricción en inventario hospitalario, doble cobro de viales abiertos, sin facturación electrónica para Centroamérica. | **Fraccionamiento hospitalario real ($ml$, $mg$)** y facturación nativa DTE de El Salvador. |
| **ezyVet** | Muy robusto para corporaciones grandes. | Costo prohibitivo por usuario, curva de aprendizaje empinada, sin integración con el Ministerio de Hacienda. | **Precios justos por sede/plan**, interfaz intuitiva y DTE automatizado. |
| **Instinct EMR** | Líder en Treatment Board de UCI y captura de costos. | Sin módulo de peluquería/grooming, sin portal ligero PWA para tutores, costos muy elevados. | **Suite completa (UCI + Quirófano + Peluquería + Portal Tutor PWA)**. |
| **DaySmart Vet** | Bueno para recordatorios y citas ambulatorias. | Carente de profundidad médica para urgencias 24/7, sin monitoreo anestésico ni visor DICOM. | **Soporte de Hospital 24/7** con semáforo de emergencias y visor PACS web. |

---

## 2. MATRIZ DE PLANES Y CAPACIDADES (TIERS)

El sistema opera bajo un modelo de feature flags y cuotas en base de datos (`plan_features` y `tenant_usage`), habilitando los módulos de acuerdo al plan contratado:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PLAN BÁSICO (Consultorio Independiente)                                                │
│ Destinado a veterinarios autónomos y consultorios ambulatorios de 1 sala               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Hasta 2 usuarios concurrentes con roles predefinidos (Médico y Recepción)            │
│ • 1 Sede / 1 Consultorio físico con agenda de citas                                    │
│ • Perfil Médico: Registro de cédula JVPM y estampado en recetas digitales              │
│ • Inventario Básico: Control de existencias ambulatorias y venta directa en mostrador  │
│ • Consultas clínicas SOAP (AAHA) y recetas médicas simples en PDF                      │
│ • Carnet de vacunación digital básico (enlace web de solo lectura)                     │
│ • Turnos: Lista de recepción interna (sin pantalla TV)                                 │
│ • Peluquería: Citas simples en agenda                                                  │
│ • Facturación Electrónica DTE El Salvador: Hasta 100 facturas DTE-01/mes               │
│ • Almacenamiento: 2 GB (PDFs y fotos básicas)                                          │
│ • Notificaciones: Correo electrónico transaccional                                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PLAN MEDIO (Clínica con Cirugía Ambulatoria)                                           │
│ Destinado a clínicas medianas con quirófano, estancia diurna y servicios de estética   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Hasta 8 usuarios concurrentes con matriz de permisos RBAC configurable               │
│ • Hasta 2 Sedes y hasta 4 Consultorios / Quirófanos con estados en tiempo real         │
│ • Médicos: Agendas de consulta, turnos programados y firma/sello digitalizado          │
│ • Inventario Avanzado: Control de lotes con semáforo de caducidad (PEPS/FIFO),         │
│   catálogo de proveedores y órdenes de compra con Costo Promedio Ponderado             │
│ • Todo lo del Plan Básico +                                                            │
│ • Cirugías ambulatorias con reporte operatorio y checklist quirúrgico                  │
│ • Emergencias: Semáforo de 3 colores (Verde, Amarillo, Rojo) con cálculo de urgencia   │
│ • Laboratorio Clínico con rangos de referencia por especie (canino/felino)             │
│ • Consentimientos informados con firma táctil en pantalla                              │
│ • Peluquería: Tablero Kanban por fases + Notificación por WhatsApp al terminar         │
│ • Hospitalización: Estancia diurna ambulatoria (Check-in/Check-out)                    │
│ • Portal del Tutor PWA: Citas online, vacunas y recetas descargables                   │
│ • Pantallas TV: 1 Pantalla activa por sede con chime sonoro                            │
│ • Facturación Electrónica DTE: Hasta 500 DTE/mes (Factura DTE-01 + Crédito Fiscal 03) │
│ • Almacenamiento: 25 GB en la nube                                                     │
│ • Notificaciones: Correo electrónico + Enlaces rápidos a WhatsApp Web                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PLAN PRO (Hospital 24/7, Redes y Centros de Referencia)                                │
│ Destinado a hospitales de tercer nivel con UCI, trauma, especialistas y múltiples sedes│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Usuarios concurrentes ilimitados con auditoría de sesiones y turnos rotativos        │
│ • Matriz RBAC Granular: Creación de roles personalizados y permisos por endpoint       │
│ • Médicos Especialistas: Cirujanos líderes, anestesistas, intensivistas y protocolo     │
│   de emergencia "Break-Glass" con registro inmutable en bitácora de seguridad          │
│ • Consultorios y Quirófanos Ilimitados con estados (Disponible, Ocupado, Desinfección, │
│   Mantenimiento), inventario de equipos médicos y llamado automático a Smart TV        │
│ • Sucursales ilimitadas con jerarquía matriz-satélite y derivaciones en ambulancia     │
│ • Farmacia Hospitalaria Total: Fraccionamiento de viales abiertos (ml/mg en UCI/QX),   │
│   libro de estupefacientes y psicotrópicos controlados, tomas físicas ciegas, mermas   │
│ • Logística: Transferencias de inventario inter-bodegas con doble confirmación         │
│ • Todo lo del Plan Medio +                                                             │
│ • Emergencias: Semáforo 5 Niveles (VECCS/RECOVER) + Código Rojo + Carrito de Paro      │
│ • Quirófano de alta complejidad con Monitor Anestésico en vivo minuto a minuto + ASA   │
│ • Pizarra UCI 24/7 (Flowboard) con infusión continua (CRI) y fluidoterapia horaria     │
│ • Laboratorio: Gráficas de tendencias evolutivas de biomarcadores y alertas críticas   │
│ • Imagenología: Visor Web DICOM PACS (Rayos X y Ecografía con medición VHS y TPLO)     │
│ • Motor Zero-Lost-Charges: Captura automática de costos quirúrgicos y de UCI a DTE     │
│ • Portal del Tutor PWA Completo: Seguimiento en vivo de UCI y Peluquería + Facturas DTE│
│ • Pantallas TV Ilimitadas por sala/piso + Perifoneo por voz (TTS) + Modo Anti-Burn-in │
│ • Facturación Electrónica DTE Ilimitada + Multi-Caja (P001, P002) + Contingencia BullMQ│
│ • Almacenamiento: 150 GB (PACS DICOM de alta resolución + Add-ons escalables)          │
│ • Notificaciones: API Oficial de WhatsApp Cloud (Reportes gráficos con foto del tutor) │
│ • Marca Blanca: Logotipo y colores institucionales en pantallas de TV y reportes       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MODELO DE COBRO Y POLÍTICA DE ADD-ONS

Para permitir a las clínicas crecer sin necesidad de saltar de plan inmediatamente, se contemplan los siguientes complementos (*Add-ons*):

1. **Pantalla TV Adicional:** Tarifa mensual por televisor extra emparejado.
2. **Paquete de Almacenamiento DICOM:** Tramos de +100 GB para archivo histórico de placas radiológicas.
3. **Paquete de Mensajería WhatsApp Cloud Oficial:** Lotes de 1,000 conversaciones activas iniciadas por la clínica.
4. **Punto de Venta / Caja DTE Adicional:** Para cajas suplementarias durante campañas de vacunación o temporadas altas.

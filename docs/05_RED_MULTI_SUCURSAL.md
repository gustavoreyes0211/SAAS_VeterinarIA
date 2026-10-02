# 05. RED MULTI-SUCURSAL Y LOGÍSTICA INTER-SEDES

Este documento detalla la arquitectura de red hospitalaria jerárquica para cadenas de clínicas veterinarias, centros de referencia y sucursales satélites.

---

## 1. JERARQUÍA DE SUCURSALES HOSPITALARIAS

El sistema clasifica las sedes según su nivel de complejidad física y equipamiento:

```
                  ┌───────────────────────────────────────────────┐
                  │          HOSPITAL CENTRAL MATRIZ 24/7         │
                  │   Establecimiento MH: M001 | Cajas: P001, P002│
                  │   • UCI 24/7 (Caniles de Cuidados Críticos)  │
                  │   • Quirófanos de Cirugía Compleja y Anestesia│
                  │   • Centro de Imagenología DICOM (Rayos X/TAC)│
                  │   • Bodega Central de Farmacia                │
                  └───────────────────────┬───────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
                  ▼                                               ▼
   ┌───────────────────────────────┐               ┌───────────────────────────────┐
   │    CLÍNICA SATÉLITE NORTE     │               │     CLÍNICA SATÉLITE SUR      │
   │    Establecimiento MH: M002   │               │     Establecimiento MH: M003  │
   │    • Consultas SOAP y Vacunas │               │    • Consultas SOAP y Vacunas │
   │    • Peluquería y Spa Canino  │               │    • Peluquería y Spa Canino  │
   │    • Estancia Diurna          │               │    • Estancia Diurna          │
   └───────────────────────────────┘               └───────────────────────────────┘
```

---

## 2. CONTEXTO ACTIVO Y "BRANCH SWITCHER" EN FRONTEND

1. **Resolución en Middleware Next.js:**
   * La sesión almacena el array de sedes autorizadas (`user_branch_assignments`).
   * Cada petición envía la cabecera `X-Branch-ID` (o cookie segura `active_branch_id`).
   * Si el usuario no tiene permisos sobre la sede solicitada, el acceso es bloqueado con HTTP 403.
2. **Selector Rápido en Barra de Navegación:**
   * Los directores médicos y veterinarios especialistas flotantes pueden alternar de sede con un clic sin cerrar sesión.
   * La interfaz re-suscribe automáticamente los canales SSE de colas de turnos y cambia el almacén de farmacia activo.

---

## 3. DERIVACIONES CLÍNICAS INTER-SEDES (`patient_transfers`)

Flujo protocolizado para el traslado seguro de pacientes críticos desde clínicas periféricas hacia la UCI del Hospital Central:

```
 [Clínica Satélite M002] ──► [Veterinario pulsa "Derivar a Hospital Central"]
                                            │
                                            ▼
                      [Validación en Tiempo Real de Jaula UCI Disponible]
                                            │
                                            ▼
                      [Alerta en Pantalla de Triaje del Hospital Central]
                      "🚨 Paciente en traslado: Canino en shock hipovolémico"
                                            │
                                            ▼
                      [Arribo de Ambulancia / Tutor a la Sede Central]
                                            │
                                            ▼
                      [Médico Central pulsa "Admitir Paciente"]
                      (Abre Flowboard UCI con el expediente completo unificado)
```

> **Expediente Centralizado Único:**  
> El tutor y su mascota tienen un único historial clínico digital. Si un paciente es vacunado en la Sucursal Norte y meses después ingresa de urgencia en la Sede Central, los médicos tienen acceso inmediato a todo su historial, alergias y notas previas.

---

## 4. LOGÍSTICA Y TRANSFERENCIAS DE FARMACIA INTER-BODEGAS

Las sucursales periféricas pueden solicitar reposición de fármacos e insumos a la Bodega Central del hospital mediante un flujo auditado con doble confirmación:

```
 [Sede Receptora solicita stock] ──► [Bodega Matriz prepara el pedido]
                                                   │
                                                   ▼
                                     [Despacho: Mercadería en Tránsito]
                                     (Kardex Matriz: Movimiento TRANSFER_OUT)
                                                   │
                                                   ▼
                                     [Recepción Física y Conteo en Destino]
                                                   │
                                                   ▼
                                     [Confirmación: Stock Acreditado]
                                     (Kardex Satélite: Movimiento TRANSFER_IN)
```

* Si durante el transporte se rompe un frasco o se detecta una merma, el encargado receptor registra la discrepancia en la tabla `pharmacy_transfer_items`, asentándose la diferencia como merma justificada (`WASTE`).

---

## 5. REPORTE GERENCIAL CONSOLIDADO DE LA RED

El Director General y el equipo de Finanzas disponen de un **Dashboard de Grupo**:
* **Facturación Comparativa:** Ingresos desglosados por sucursal y consolidados de la red.
* **Tasa de Ocupación Hospitalaria:** % de caniles y camas UCI ocupadas por sede en tiempo real.
* **Tiempos de Espera:** Promedio de permanencia de pacientes en salas de espera de cada clínica satélite.

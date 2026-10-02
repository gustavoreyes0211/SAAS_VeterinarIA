# 09. USUARIOS, PERMISOS (RBAC), INVENTARIO, MÉDICOS Y CONSULTORIOS

Este documento define la administración integral del personal médico veterinario, la gestión operativa de consultorios y quirófanos físicos, el control completo de inventario y farmacia hospitalaria con lotes y vencimientos (PEPS/FIFO), y la matriz granular de control de acceso basada en roles (RBAC).

---

## 1. GESTIÓN DE MÉDICOS VETERINARIOS Y PERFILES PROFESIONALES

En un entorno hospitalario y de clínicas veterinarias, el personal médico cuenta con responsabilidades legales, cédulas de ejercicio profesional y facultades quirúrgicas diferenciadas. El sistema modela esto a través de la entidad `doctor_profiles` asociada a la cuenta de usuario (`users`).

```
  ┌──────────────────────────────────────────────────────────────┐
  │                 PERFIL MÉDICO VETERINARIO                    │
  ├──────────────────────────────────────────────────────────────┤
  │ • Nombre Completo & Usuario del Sistema                     │
  │ • Cédula / Colegiatura Oficial (JVPM - El Salvador)         │
  │ • Especialidades (Cirugía, Cardiología, Felinos, etc.)      │
  │ • Firma Digital & Sello Oficial Digitalizado (SVG/PNG)      │
  │ • Facultades: Cirujano Líder, Anestesiólogo, Intensivista   │
  │ • Habilitación Protocolo de Emergencia "Break-Glass"        │
  └──────────────────────────────────────────────────────────────┘
```

### 1.1. Atributos del Perfil Médico Veterinario
* **Cédula Oficial JVPM:** Número de registro legal ante la **Junta de Vigilancia de la Profesión Médico Veterinaria de El Salvador**, validado con formato oficial. Este número se estampa de forma obligatoria e inmutable en todas las recetas médicas digitales, certificados de vacunación, fichas quirúrgicas e informes de laboratorio.
* **Especialidades Médicas:** Asignación de áreas de práctica clínica certificada:
  * Cirugía de Tejidos Blandos y Laparoscopía.
  * Traumatología y Ortopedia Quirúrgica.
  * Medicina de Emergencias y Cuidados Críticos (VECCS).
  * Cardiología y Ecocardiografía.
  * Dermatología Veterinaria.
  * Medicina y Manejo Felino (Cat Friendly Practice).
  * Oncología Médica y Quimioterapia.
* **Firma Digitalizada y Sello Profesional:** Almacenamiento criptográfico y seguro de los trazados de firma y sello profesional con resolución vectorial (SVG/PNG con canal alfa transparente). Se estampa automáticamente en los documentos legales PDF y recetas con Código QR de validación pública.
* **Facultades Clínicas Especiales:**
  * `is_lead_surgeon`: Habilitado para liderar actos quirúrgicos mayores y firmar reportes operatorios.
  * `is_anesthesiologist`: Autorizado para confeccionar hojas anestésicas, calcular dosis de inducción y monitorear gases transoperatorios.
  * `is_intensivist_icu`: Facultado para modificar protocolos de infusión continua (CRI) y órdenes médicas en la Pizarra UCI 24/7.
  * `emergency_break_glass_authorized`: Autorización para invocar el protocolo de acceso de emergencia a expedientes bloqueados.

### 1.2. Horarios, Agendas y Turnos de Guardia (`doctor_schedules`)
* **Planificación por Sucursal:** Cada médico puede tener horarios definidos en una o múltiples sedes (`branch_id`), con especificación de días de la semana y bloques de atención (ej. Consultas de 20 o 30 minutos).
* **Turnos de Guardia Nocturna / 24/7:** Marcación del personal activo en guardia de noche o fines de semana. Los médicos en guardia activa adquieren prioridad de notificación push en triajes clasificados como Rojo o Naranja.
* **Protocolo de Acceso de Emergencia ("Break-Glass"):** Durante situaciones críticas de riesgo vital o guardias nocturnas, un médico puede requerir acceso inmediato al expediente histórico completo de un paciente registrado en otra sede o asignado a otro facultativo. Al activar el botón **"Acceso de Emergencia (Break-Glass)"**:
  1. Se desbloquea el expediente de inmediato sin demoras burocráticas.
  2. El sistema exige ingresar una justificación clínica en 1 línea.
  3. Se registra un evento inmutable en la bitácora de auditoría (`audit_logs`) con timestamp exacto, IP y usuario.
  4. Se envía una notificación push y correo al Director Médico de la sede alertando del desbloqueo extraordinario.

### 1.3. Métricas y KPIs de Desempeño Médico
* **Pacientes Atendidos:** Consultas generales, revisiones y urgencias por día/semana/mes.
* **Tasa de Cierre Clínico en 24h:** Porcentaje de consultas SOAP completadas y selladas formalmente sin retrasos legales.
* **Tiempo Promedio de Consulta:** Duración promedio desde que el paciente ingresa al consultorio hasta que se expide la receta/alta.
* **Tasa de Conversión a Estudios:** Proporción de consultas que requirieron laboratorio, rayos X o ecografía, evaluando correlación diagnóstica.

---

## 2. GESTIÓN DE CONSULTORIOS, QUIRÓFANOS Y SALAS FÍSICAS (`rooms`)

La infraestructura física de cada clínica u hospital se parametriza con precisión para coordinar el flujo de pacientes, la ocupación de espacios y la pantalla de turnos en sala de espera.

### 2.1. Tipología de Espacios en el Hospital
| Código de Tipo | Denominación | Equipamiento y Propósito Típico |
| :--- | :--- | :--- |
| `CONSULTATION_GENERAL` | Consultorio General | Mesa de exploración de acero inox, báscula digital, otoscopio/oftalmoscopio, negatoscopio/monitor. |
| `CONSULTATION_SPECIALTY` | Consultorio Especializado | Ecógrafo Doppler color, lámpara de hendidura, tonómetro de aplanación (oftalmología/cardiología). |
| `SURGERY_ROOM` | Quirófano Estéril | Mesa hidráulica con calefacción térmica, máquina de anestesia inhalatoria (Isoflurano), monitor multiparámetro (ECG, SpO2, EtCO2, PNI), electrobisturí bipolar y lámpara cialítica LED. |
| `ICU_ROOM` | Sala de Hospitalización UCI | Caniles de acero grado 304 con oxigenoterapia concentrada, bombas de infusión continua (CRI), colchones viscoelásticos anti-escaras. |
| `XRAY_ROOM` | Sala de Imagenología Plomada | Generador de Rayos X de alta frecuencia, chasis digitalizador DR con detector de panel plano, delantales plomados y protectores tiroideos. |
| `TRIAGE_ROOM` | Box de Choque / Urgencias | Mesa de reanimación, Carrito Rojo (*Crash Cart*) con laringoscopio, tubos endotraqueales, ambú y drogas de emergencia. |
| `GROOMING_ROOM` | Salón de Grooming & Spa | Tinas de baño elevadas, mesas de corte antideslizantes, turbinas de secado rápido, esterilizador UV de cuchillas. |

### 2.2. Máquina de Estados Operativos de las Salas
Cada sala mantiene un estado en tiempo real que previene colisiones y sincroniza la atención:

```
        ┌────────────────────────────────────────────────────────┐
        │                                                        │
        ▼                                                        │
 ┌─────────────┐   Iniciar Atención   ┌─────────────┐           │
 │  AVAILABLE  ├─────────────────────►│  OCCUPIED   │           │
 └─────────────┘                      └──────┬──────┘           │
        ▲                                    │                  │
        │                        Finalizar   │ Paciente         │
        │                        Atención    ▼                  │
        │                             ┌─────────────┐           │
        │     Protocolo Completado    │  CLEANING_  │           │
        └─────────────────────────────┤ STERILIZING │           │
                                      └─────────────┘           │
        ▲                                    │                  │
        │                                    ▼ Falla Técnica    │
        │                             ┌─────────────┐           │
        └─────────────────────────────┤ MAINTENANCE ├───────────┘
               Reparado / Calibrado   └─────────────┘
```

1. **`AVAILABLE` (Disponible / Listo):** Sala desinfectada, libre de pacientes y con insumos cargados. Lista para recibir turno.
2. **`OCCUPIED` (En Consulta / Ocupada):** Paciente y médico en sesión. Se proyecta en la pantalla de la clínica el ticket en atención.
3. **`CLEANING_STERILIZING` (En Desinfección):** Estado obligatorio tras consultas de pacientes infecciosos (ej. Parvovirus, Giardia) o procedimientos quirúrgicos. El personal auxiliar marca el inicio y fin de la sanitización.
4. **`MAINTENANCE` (En Mantenimiento Técnico):** Desactivación temporal por calibración de equipos médicos, reparación de climatización o revisión eléctrica.

### 2.3. Asignación Dinámica del Médico y Llamador de Turnos (Smart TV)
* Al comenzar su jornada, el médico veterinario inicia sesión y selecciona su sala física (ej. *"Dra. Martínez ingresó a Consultorio 1"*).
* Al presionar el botón **"Llamar Siguiente Paciente"** desde su interfaz clínica:
  * La pantalla Smart TV emite el sonido polifónico de campana (*chime*) en sala de espera.
  * Se proyecta en pantalla gigante: **"Ticket A-104 | Firulais (Canino) ➔ Consultorio 1 (Dra. Martínez)"**.
  * El estado de la sala conmuta automáticamente a `OCCUPIED`.

### 2.4. Calendario de Reservas de Quirófano y Salas de Especialidad (`room_reservations`)
* Los quirófanos y salas de imagenología no operan por orden de llegada, sino por **reserva de bloque de tiempo**.
* El módulo de programación quirúrgica permite reservar Quirófano 1 para un procedimiento de traumatología (ej. 14:00 a 16:30 hrs), bloqueando automáticamente la sala e impidiendo solapamientos con cirugías electivas de otros médicos.

---

## 3. CONTROL INTEGRAL DE INVENTARIO, FARMACIA HOSPITALARIA Y COMPRAS

El inventario hospitalario veterinario exige un control de alta precisión para evitar pérdidas por caducidad, garantizar trazabilidad en medicamentos controlados y permitir el fraccionamiento de fármacos sin pérdidas económicas ni duplicidades.

```
       [PROVEEDORES]
             │
             ▼ Orden de Compra (PO)
   [RECEPCIÓN DE MERCADERÍA] ◄── Comprobante Crédito Fiscal (DTE-03)
             │
             ▼ Ingreso con Costeo Promedio Ponderado (CPP)
      [LOTES Y VENCIMIENTOS] ──► Semáforo: 🔴 <30d | 🟡 30-60d | 🟢 >90d
             │
    ┌────────┴────────────────────────┬────────────────────────┐
    ▼                                 ▼                        ▼
[DISPENSACIÓN AMBULATORIA]   [FRACCIONAMIENTO UCI/QX]   [TRANSFERENCIA SEDES]
Venta Caja / Receta DTE      Viales Abiertos (ml/mg)    Bodega Central ➔ Sucursal
```

### 3.1. Tipología y Clasificación de Ítems (`inventory_items`)
1. **Medicamentos Hospitalarios y Ambulatorios:**
   * Antibióticos, antiinflamatorios (AINEs y esteroides), protectores gástricos, broncodilatadores, soluciones de fluidoterapia (Lactato de Ringer, NaCl 0.9%, Glucosa 5%).
2. **Estupefacientes y Psicotrópicos Controlados (`is_controlled_narcotic = TRUE`):**
   * **Fentanilo, Ketamina, Midazolam, Morfina, Tramadol, Butorfanol.**
   * *Regulación Estricta:* Requieren el registro del médico veterinario solicitante, indicación en el expediente clínico, saldo en mililitros/miligramos en tiempo real y libro digital de estupefacientes auditable.
3. **Material Médico y Quirúrgico Descartable:**
   * Suturas de absorción rápida y lenta (Vicryl, PDS, Polipropileno), catéteres endovenosos (calibres 18G a 26G), jeringas, agujas, gasas estériles, sondas uretrales y tubos endotraqueales.
4. **Alimentos y Dietas Terapéuticas:**
   * Alimentos de prescripción clínica (Renal, Hepatic, Gastrointestinal, Urinario, Hipoalergénico). Manejo de unidades por bulto/saco y por lata o sobre húmedo.
5. **Reactivos y Diagnóstico Rápido:**
   * Kits de test rápido (SNAP Parvovirus/Coronavirus, FeLV/FIV, Dirofilaria), rotores para analizadores bioquímicos y tubos con anticoagulante (EDTA, Citrato de Sodio, Tapa Roja).

### 3.2. Proveedores y Órdenes de Compra (`suppliers` y `purchase_orders`)
* **Padrón de Proveedores:** Registro con NIT, NRC, Razón Social, condiciones comerciales (días de crédito: contado, 15, 30, 60 días) y catálogo asociado.
* **Generación de Órdenes de Compra:** Cálculo automatizado sugerido a partir de la fórmula de reposición:
  $$\text{Cantidad a Pedir} = (\text{Punto de Reorden} - \text{Stock Actual}) + \text{Ventas Previstas en Lead Time}$$
* **Recepción y Validación Fiscal:** Entrada de mercancía contra el **Comprobante de Crédito Fiscal (DTE-03)** del proveedor, recalculando en el acto el **Costo Promedio Ponderado (CPP)** de cada producto:
  $$\text{Nuevo Costo Promedio} = \frac{(\text{Stock Anterior} \times \text{Costo Anterior}) + (\text{Cantidad Recibida} \times \text{Costo Factura})}{\text{Stock Total Resultante}}$$

### 3.3. Control de Lotes y Vencimientos con Sistema PEPS / FIFO (`inventory_lots`)
* **PEPS / FIFO Obligatorio:** Toda salida de almacén (sea para una venta en mostrador o para una inyección en consulta) consume automáticamente el lote que tenga la **fecha de caducidad más próxima** (*First Expired, First Out*).
* **Semáforo Visual de Caducidad:**
  * 🔴 **Semáforo Rojo (Crítico):** Vence en menos de 30 días. El sistema emite alertas destacadas y prioriza su salida o devolución al laboratorio proveedor.
  * 🟡 **Semáforo Amarillo (Atención):** Vence entre 31 y 60 días.
  * 🟢 **Semáforo Verde (Óptimo):** Vence en más de 60 días.
* **Bloqueo Automático:** Los lotes con fecha de vencimiento superada quedan **bloqueados de forma estricta** por el sistema, impidiendo su prescripción, facturación o administración a pacientes.

### 3.4. Fraccionamiento de Viales en UCI y Quirófano (`pharmacy_open_vials`)
Una de las mayores fuentes de pérdidas en clínicas veterinarias es el desecho o cobro injusto de fármacos inyectables. El sistema implementa un motor de **Frascos Abiertos**:
1. Al administrar la primera dosis de un frasco nuevo (ej. Cefazolina 1g o Propofol 20ml), se registra como **Vial Abierto**.
2. Se registra el volumen inicial en ml y la fecha límite de estabilidad tras apertura (ej. 28 días en refrigeración).
3. Cada dosis administrada a un paciente internado descuenta los mililitros exactos de ese frasco abierto (`remaining_volume_ml`).
4. Al tutor solo se le factura la fracción administrada (ej. 2.4 ml), prorrateando el costo sin obligarlo a pagar el frasco entero ni permitir cobros duplicados.

### 3.5. Tomas Físicas de Inventario y Mermas (`inventory_adjustments`)
* **Auditoría Ciega:** La interfaz permite imprimir o mostrar en tablet listas de conteo sin mostrar el stock teórico del sistema, obligando al auditor a contar las existencias reales.
* **Tipos de Ajuste Formal:**
  * `EXPIRATION`: Baja justificada de producto caducado (con acta de destrucción de medicamentos).
  * `DAMAGE_BREAKAGE`: Rotura accidental de frascos o empaques estériles dañados.
  * `PHYSICAL_COUNT_DEFICIT`: Faltante detectado en toma física (envío de alerta a gerencia).
  * `PHYSICAL_COUNT_SURPLUS`: Sobrante detectado por error en digitación previa.
  * `CLINICAL_SHRINKAGE`: Merma técnica inevitable en preparación de diluciones y purga de guías intravenosas.
* **Aprobación Obligatoria:** Todo ajuste que supere un umbral monetario (ej. > $20.00 USD) requiere autorización con contraseña del Director Administrativo o Gerente de Bodega.

---

## 4. MATRIZ GRANULAR DE ROLES Y CONTROL DE ACCESO (RBAC)

La plataforma garantiza el principio de mínimo privilegio (*Least Privilege*) mediante una arquitectura de roles y permisos jerárquicos y verificables en backend y frontend.

### 4.1. Catálogo Completo de Permisos por Módulo

```
MÓDULO CLÍNICO, HISTORIAL Y CONSULTAS
• CLINIC:CONSULTATION_VIEW      - Ver expediente y consultas del paciente
• CLINIC:CONSULTATION_CREATE    - Iniciar y redactar una consulta SOAP
• CLINIC:CONSULTATION_CLOSE     - Sellar legalmente la consulta médica
• CLINIC:ADDENDUM_CREATE        - Agregar notas y adendas posteriores al cierre
• CLINIC:PRESCRIPTION_CREATE    - Confeccionar y emitir recetas médicas digitales
• CLINIC:NARCOTIC_PRESCRIBE     - Prescribir estupefacientes controlados (Fentanilo/Ketamina)
• CLINIC:VIEW_FULL_HISTORY      - Consultar el historial médico longitudinal 360°
• CLINIC:BREAK_GLASS_ACTIVATE   - Activar acceso extraordinario de emergencia a expedientes

MÓDULO DE URGENCIAS, TRIAJE Y CARRO DE PARO
• EMERGENCY:TRIAGE_EVALUATE     - Evaluar y clasificar según semáforo VECCS/RECOVER
• EMERGENCY:CRASH_CART_ACCESS   - Utilizar calculadora del Carro Rojo y registrar reanimación
• EMERGENCY:ADMIT_PATIENT       - Ingresar paciente en shock a box de reanimación

MÓDULO QUIRÚRGICO, ANESTESIA Y CONSENTIMIENTOS
• SURGERY:SCHEDULE              - Agendar cirugías y reservar quirófano
• SURGERY:OPERATE               - Redactar informe y hallazgos quirúrgicos
• SURGERY:ANESTHESIA_LOG        - Registrar signos vitales minuto a minuto en anestesia
• SURGERY:CONSENT_COLLECT       - Recolectar firma táctil biométrica de consentimiento

HOSPITALIZACIÓN Y UCI 24/7 (FLOWBOARD)
• HOSPITALIZATION:ADMIT         - Ingresar paciente a hospitalización/UCI
• HOSPITALIZATION:DISCHARGE     - Dar de alta médica al paciente internado
• HOSPITALIZATION:ORDERS_MANAGE - Prescribir fluidos, CRI y medicamentos en Flowboard
• HOSPITALIZATION:EXECUTE_CARE  - Marcar dosis y tratamientos administrados como enfermero

IMAGENOLOGÍA DICOM Y LABORATORIO
• LAB:ORDER_CREATE              - Solicitar análisis de sangre, orina y citologías
• LAB:RESULTS_ENTER             - Cargar resultados analíticos y valores de referencia
• IMAGING:ORDER_CREATE          - Solicitar estudios de Rayos X o Ecografía
• IMAGING:PACS_VIEW             - Abrir visor web DICOM y realizar mediciones (VHS/TPLO)
• IMAGING:REPORT_WRITE          - Redactar informe radiológico oficial

INVENTARIO, FARMACIA, COMPRAS Y TRASLADOS
• INVENTORY:VIEW_STOCK          - Consultar existencias de productos por sucursal
• INVENTORY:VIEW_COSTS          - Ver costos de compra promedio (CPP) y márgenes comerciales
• INVENTORY:DISPENSE            - Dispensar medicamentos e imputar fraccionamiento de viales
• INVENTORY:PURCHASE_MANAGE     - Crear y aprobar órdenes de compra a proveedores
• INVENTORY:RECEIVE_GOODS       - Registrar recepción de mercadería y control de lotes
• INVENTORY:TRANSFER_MANAGE     - Solicitar y autorizar envíos de stock entre sucursales
• INVENTORY:ADJUST_STOCK        - Realizar ajustes de stock por tomas físicas o mermas

FACTURACIÓN Y DTE MINISTERIO DE HACIENDA (EL SALVADOR)
• BILLING:DTE_ISSUE_01          - Emitir Factura Electrónica (DTE-01)
• BILLING:DTE_ISSUE_03          - Emitir Comprobante de Crédito Fiscal (DTE-03)
• BILLING:DTE_VOID_05           - Emitir Nota de Crédito para anulación oficial (DTE-05)
• BILLING:CASH_REGISTER_CUT     - Generar cortes de caja diarios (Cortes X y Z)
• BILLING:DTE_CONFIG_MANAGE     - Administrar certificados de firma y credenciales de Hacienda

ESTÉTICA Y PELUQUERÍA (GROOMING)
• GROOMING:KANBAN_MANAGE        - Mover mascotas en las fases del tablero de peluquería
• GROOMING:PHOTO_UPLOAD         - Subir fotos de control antes/después
• GROOMING:NOTIFY_OWNER         - Disparar mensajes automáticos de WhatsApp de finalización

ADMINISTRACIÓN GENERAL, SEDES Y USUARIOS
• USERS:MANAGE                  - Crear, modificar y desactivar cuentas de usuario
• DOCTOR_PROFILES:MANAGE        - Administrar cédulas JVPM, firmas y sellos médicos
• ROLES:MANAGE                  - Crear roles personalizados y editar matrices de permisos
• ROOMS:MANAGE                  - Configurar consultorios, quirófanos y su equipamiento
• BRANCH:SWITCH                 - Alternar entre sucursales autorizadas
• BRANCH:MANAGE                 - Editar datos de sucursales, caniles y capacidad
• AUDIT:LOG_VIEW                - Consultar bitácora inmutable de eventos de seguridad
```

---

## 5. ROLES PREDEFINIDOS Y MATRIZ DE ASIGNACIÓN

El sistema incluye 10 roles preconfigurados listos para operar, además de permitir la creación de **Roles Personalizados** según el organigrama de cada hospital:

| Módulo / Acción | Super Admin Global | Director de Red | Director de Sede | Médico de Planta | Cirujano / Anest. | Enfermero / Técnico | Recepcionista / Cajero | Encargado Farmacia | Estilista Grooming | Tutor PWA |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consultas SOAP y Recetas** | Lectura | Total | Total | Total | Lectura | Lectura | ❌ | ❌ | ❌ | Solo Propias (Lectura) |
| **Prescripción Estupefacientes** | ❌ | Total | Total | Total | Total | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Acceso "Break-Glass"** | ❌ | Total | Total | Autorizado | Autorizado | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Triaje y Carrito Rojo** | ❌ | Total | Total | Total | Total | Total | Clasificación | ❌ | ❌ | ❌ |
| **Quirófano y Protocolos** | ❌ | Total | Total | Lectura | Total | Asistente | ❌ | ❌ | ❌ | ❌ |
| **Flowboard UCI 24/7** | ❌ | Total | Total | Total | Total | Ejecución | ❌ | ❌ | ❌ | Estado en Vivo |
| **Visor DICOM y Rayos X** | ❌ | Total | Total | Total | Total | Lectura | ❌ | ❌ | ❌ | Informes |
| **Laboratorio Clínico** | ❌ | Total | Total | Total | Total | Carga Datos | ❌ | ❌ | ❌ | Informes |
| **Dispensación de Farmacia** | ❌ | Total | Total | Total | Total | Total | Solo Venta Mostrador | Total | ❌ | ❌ |
| **Órdenes de Compra y CPP** | ❌ | Total | Total (Sede) | ❌ | ❌ | ❌ | ❌ | Total | ❌ | ❌ |
| **Tomas Físicas y Mermas** | ❌ | Total | Total (Sede) | ❌ | ❌ | ❌ | ❌ | Registro/Conteo | ❌ | ❌ |
| **Facturación DTE El Salvador** | ❌ | Total | Total | ❌ | ❌ | ❌ | Total Emisión/Corte | ❌ | ❌ | Descarga DTE |
| **Tablero Kanban Grooming** | ❌ | Total | Total (Sede) | ❌ | ❌ | ❌ | Registro Cita | ❌ | Total | Estado en Vivo |
| **Gestión de Consultorios** | Total | Total | Total (Sede) | Ocupar Sala | Reservar Qx | ❌ | Ver Disponibilidad | ❌ | ❌ | ❌ |
| **Gestión Usuarios y JVPM** | Total | Total | Total (Sede) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Auditoría y Bitácora** | Total | Total | Total (Sede) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 6. SEGURIDAD MULTI-TENANT Y ROLES CONTEXTUALES POR SUCURSAL

### 6.1. Roles Diferenciados por Sede
En organizaciones con múltiples clínicas y un hospital central de referencia, los colaboradores pueden tener diferentes atribuciones según la sede en la que se encuentren operando:
* *Ejemplo:* El Dr. Alejandro Morales es **Director Médico** en la Sucursal Satélite Escalón, pero cuando acude a operar al Hospital Central 24/7 actúa exclusivamente bajo el rol de **Cirujano Especialista**.
* El sistema modela esto en la tabla `user_branch_assignments` asignando un `role_id` específico por cada par `(user_id, branch_id)`.

### 6.2. Inyección de Contexto en Sesión y PostgreSQL RLS
En cada petición HTTP autenticada a la API, el middleware extrae el token JWT y ejecuta la función de contexto seguro de base de datos antes de disparar cualquier consulta SQL:

```sql
-- Establecimiento del contexto seguro de tenant, usuario y sede activa
SELECT set_config('app.current_tenant_id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', false);
SELECT set_config('app.current_user_id', 'f4e3d2c1-b0a9-8f7e-6d5c-4b3a2f1e0d9c', false);
SELECT set_config('app.current_branch_id', '00112233-4455-6677-8899-aabbccddeeff', false);
```

Las políticas de **Row-Level Security (RLS)** en PostgreSQL garantizan que sea matemáticamente imposible que un usuario consulte o modifique datos de un hospital ajeno, blindando el sistema contra ataques de escalación de privilegios o brechas de datos inter-empresariales.

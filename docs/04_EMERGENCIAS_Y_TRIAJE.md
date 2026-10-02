# 04. MÓDULO DE EMERGENCIAS Y SEMÁFORO DE TRIAJE

Este documento describe la arquitectura del **Módulo de Urgencias y Triaje Crítico**, basado en los estándares internacionales **VECCS (Veterinary Emergency and Critical Care Society)** y la iniciativa **RECOVER (Reassessment Campaign on Veterinary Resuscitation)**.

---

## 1. EL SEMÁFORO DE TRIAJE DE 5 NIVELES

Todo paciente que ingresa por la puerta de urgencias o recepción con carácter imprevisto es evaluado en un formulario táctil rápido que asigna automáticamente una categoría de color:

```
┌───────────┬──────────────┬───────────────────────────────┬───────────────────────────────┐
│ COLOR     │ TIEMPO MÁX.  │ ESTADO FISIOLÓGICO            │ EJEMPLOS CLÍNICOS             │
├───────────┼──────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🔴 ROJO   │ 0 minutos    │ Reanimación Inmediata / Paro  │ Paro cardiorrespiratorio,     │
│           │ (Inmediato)  │ Pérdida inminente de la vida  │ shock descompensado, GDV      │
│           │              │                               │ (torsión gástrica), coma.     │
├───────────┼──────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟠 NARANJA│ < 15 minutos │ Muy Urgente / Shock Inminente │ Disnea severa (boca abierta   │
│           │              │ Riesgo de colapso rápido      │ en felinos), politrauma mayor,│
│           │              │                               │ intoxicación aguda mortal.    │
├───────────┼──────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟡 AMARILLO│ < 60 minutos │ Urgente / Dolor Agudo         │ Vómitos/diarreas persistentes,│
│           │              │ Fisiológicamente estable      │ deshidratación moderada,      │
│           │              │                               │ fractura cerrada, hematuria.  │
├───────────┼──────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟢 VERDE  │ < 120 minutos│ Estándar / No Urgente         │ Cojeras leves sin fractura,   │
│           │              │ Sin compromiso sistémico      │ heridas superficiales.        │
├───────────┼──────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🔵 AZUL   │ Según agenda │ Rutina / Sin Urgencia         │ Vacunas o chequeos menores    │
│           │              │ Consulta preventiva           │ que ingresan por urgencias.   │
└───────────┴──────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 2. EVALUACIÓN RÁPIDA ABCDE EN 30 SEGUNDOS

Diseñada para ser completada en tablets o dispositivos móviles en la zona de triaje por el enfermero o veterinario de guardia:

* **A (Airway - Vía Aérea):** Permeable, Obstruida parcialmente, Intubada.
* **B (Breathing - Respiración):** Normal, Disnea moderada, Disnea severa, Agónica, Apnea.
* **C (Circulation - Circulación):** Pulso (Fuerte, Débil/filiforme, Ausente), TLLC, Color de Mucosas (Rosadas, Pálidas, Cianóticas, Rojo ladrillo) y Lactato sanguíneo rápido.
* **D (Disability - Estado Neurológico):** Alerta, Deprimido, Estuporoso, Comatoso, Convulsivo.
* **E (Exposure - Examen Térmico/Externo):** Temperatura rectal, glucemia capilar y peso (real o estimado).

---

## 3. CALCULADORA DEL CARRITO ROJO (CRASH CART RECOVER)

Al clasificar a un paciente en **🔴 Código Rojo**, el sistema despliega automáticamente una tarjeta de pantalla completa con el protocolo de reanimación cardiopulmonar:

### 3.1. Dosis Automáticas de Fármacos de Emergencia (según el peso)
* **Epinefrina (Adrenalina):**
  * Dosis Baja ($0.01\text{ mg/kg}$): Volumen en $ml$ listo para inyección IV/IO cada 4 minutos.
  * Dosis Alta ($0.1\text{ mg/kg}$): Para paro prolongado superior a 10 minutos.
* **Atropina ($0.04\text{ mg/kg}$):** Para bradicardia severa mediada por tono vagal o asistolia.
* **Naloxona / Flumazenil:** Dosis de reversión inmediata de opioides o sedantes.
* **Lidocaína ($2\text{ mg/kg}$ bolo lento):** Para taquicardia ventricular sostenida sin pulso.
* **Gluconato de Calcio al 10%:** Para hiperpotasemia severa o hipocalcemia crítica.

### 3.2. Metrónomo Sonoro de RCP
* Reproduce un sonido rítmico audible en el navegador configurado a **100 - 120 compresiones por minuto**, guiando al reanimador para mantener la cadencia recomendada por RECOVER.

---

## 4. ALARMA DE "CÓDIGO ROJO" EN SMART TVS Y CONSOLAS

```
 [Recepción / Triage marca ROJO]
               │
               ▼  (Redis Pub/Sub)
 [Servicio SSE distribuye el evento]
               │
       ┌───────┴───────┐
       ▼               ▼
 [Consolas Web Médicos] [Smart TVs en Salas Médicas]
  • Modal emergente      • Tono de alarma polifónico
  • Desbloqueo Break-    • Banner rojo intermitente:
    Glass instantáneo      "🚨 CÓDIGO ROJO - BOX DE SHOCK 1"
```

---

## 5. DERIVACIÓN CLÍNICA INMEDIATA POST-ESTABILIZACIÓN

Una vez lograda la estabilización hemodinámica (ROSC / Retorno de la circulación espontánea):
1. **Derivación a UCI 24/7:** Un botón transfiere al paciente a [`hospitalizations`](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/02_ARQUITECTURA_Y_BASE_DE_DATOS.md) abriendo el Flowboard para monitoreo de fluidos y CRI.
2. **Derivación a Quirófano de Urgencia:** Si requiere cirugía inmediata (ej. hemoabdomen o hemostasia), se envía a [`surgeries`](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/02_ARQUITECTURA_Y_BASE_DE_DATOS.md) precargando la hoja anestésica con `ASA_E`.
3. **Captura de Honorarios:** Todos los fármacos y maniobras de resucitación se transfieren a la pre-factura para cobro fiscal con factura electrónica DTE.

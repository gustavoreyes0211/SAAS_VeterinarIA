# 03. CORE CLÍNICO, QUIRÓFANO, UCI Y DIAGNÓSTICO

Este documento describe la suite clínica y hospitalaria que constituye el motor diario del médico veterinario, cirujano, anestesista e intensivista.

---

## 1. CONSULTAS CLÍNICAS (AAHA SOAP) Y EXAMEN FÍSICO POR SISTEMAS

La consulta médica está estructurada para completarse en menos de 3 minutos sin sacrificar rigor clínico ni respaldo legal:

### 1.1. Constantes Vitales Obligatorias
* **Peso ($kg$):** Actualiza automáticamente el historial temporal de peso para cálculo de dosis ($mg/kg$).
* **Temperatura Rectal (°C):** Rango fisiológico configurable por especie (canino: 37.5 - 39.2 °C, felino: 38.0 - 39.5 °C).
* **Frecuencias:** Cardíaca (lpm) y Respiratoria (rpm).
* **Perfusión Periférica:** Tiempo de Llenado Capilar (TLLC en segundos) y Coloración de Mucosas (Rosadas, Pálidas, Ictéricas, Cianóticas, Rojo Ladrillo).
* **Grado de Deshidratación:** Normal (0%), Leve (5%), Moderada (7-8%), Severa (> 10%).
* **Condición Corporal:** Escala estándar WSAVA de 1 a 9.
* **Escala de Dolor:** Escala de Glasgow (caninos) o Colorado (felinos) de 0 a 4.

### 1.2. Examen Físico Sistemático (10 Sistemas Orgánicos)
Checklist rápido con botones interactivos `Normal` / `Anormal` y campo de notas clínicas:
1. **Ojos:** Reflejo pupilar, córnea, esclera, secreciones.
2. **Oídos:** Pabellón auricular, conducto auditivo, presencia de cerumen o mal olor.
3. **Cavidad Oral:** Dentición, sarro (grado I-IV), gingivitis, úlceras.
4. **Cardiovascular:** Soplos cardíacos (grado I-VI), ritmo, pulso femoral sincronizado.
5. **Respiratorio:** Auscultación pulmonar, estertores, estridor o sibilancias.
6. **Abdomen:** Palpación abdominal, dolor focalizado, visceromegalias, masas.
7. **Linfonodos:** Ganglios mandibulares, preescapulares y poplíteos.
8. **Músculo-Esquelético:** Claudicaciones, arcos de movimiento articular, crepitaciones.
9. **Piel y Manto:** Alopecia, prurito, pulgas/garrapatas, pioderma.
10. **Neurológico / Urogenital:** Estado mental, reflejos, palpación vesical.

### 1.3. Cierre Inmutable y Adendas Médico-Legales
* Al finalizar la consulta, el veterinario presiona **"Cerrar Consulta"**, bloqueando los textos originales (`is_closed = TRUE`).
* Cualquier informe tardío o reporte telefónico del tutor se incorpora mediante el botón **"Agregar Adenda"** (`consultation_addendums`), registrando la fecha, hora exacta y firma del médico sin alterar la nota original.

---

## 2. RECETAS MÉDICAS DIGITALES CON FIRMA JVPM Y CÓDIGO QR

* **Cálculo Automático por Peso:** Al seleccionar un fármaco, el sistema calcula la dosis en $mg/kg$ contra el peso actual del paciente, determinando volumen en $ml$ o número de tabletas.
* **Receta Membretada en PDF:** Generación instantánea con logotipo institucional, datos de la clínica, cédula profesional (JVPM) y Código QR de verificación para farmacias.
* **Control de Estupefacientes:** Marca las recetas que requieren receta retenida o control especial de psicotrópicos.
* **Envío Inmediato:** Transmisión con un clic al WhatsApp y Email del tutor, además de quedar visible en el **Portal del Tutor PWA**.

---

## 3. HISTORIAL CLÍNICO LONGITUDINAL 360° (PATIENT EMR TIMELINE)

Vista cronológica unificada de la vida médica del paciente:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 🐶 "MAX" - Canino Golden Retriever (32.4 kg)                           │
 │ ⚠️ ALERGIAS: Penicilina | Condición Crónica: Cardiopatía Grado II      │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
   [2026-10-02] 🩺 Consulta General SOAP: Tos seca nocturna
                ├─ O: Soplo sistólico Grado III/VI | TLLC: 2s | Temp: 38.6°C
                └─ 💊 Receta Digital: Enalapril 10mg + Furosemida 20mg (PDF QR)
                                     │
   [2026-10-02] 🩻 Estudio Rayos X Tórax (Lateral y VD)
                ├─ Hallazgo: Cardiomegalia leve | Medición VHS: 10.4 v
                └─ Visor Web DICOM integrado (Cornerstone.js)
                                     │
   [2026-10-02] 🧪 Laboratorio: Panel Bioquímico Renal
                ├─ Creatinina: 1.2 mg/dL | BUN: 22 mg/dL
                └─ Gráfica de evolución renal estable
                                     │
   [2026-08-10] 💉 Vacunación: Refuerzo Anual Rabia
                └─ Semáforo en Portal Tutor: 🟢 Vigente hasta Ago 2027
```

> **Banner Superior Fijo de Seguridad:**  
> En cualquier sección que el médico consulte, se mantiene fijo un banner con la foto, edad exacta, **peso más reciente con fecha** y **alertas de alergias en rojo de alto contraste**.

---

## 4. CENTRO QUIRÚRGICO Y HOJA ANESTÉSICA TRANSOPERATORIA

### 4.1. Estratificación de Riesgo Anestésico ASA
* `ASA I`: Paciente normal y sano.
* `ASA II`: Enfermedad sistémica leve (ej. soplo compensado, geronte).
* `ASA III`: Enfermedad sistémica severa (ej. insuficiencia renal compensada).
* `ASA IV`: Enfermedad sistémica incapacitante con riesgo vital.
* `ASA V`: Paciente moribundo que no sobrevivirá sin la intervención.
* `ASA E`: Emergencia sobreañadida a cualquiera de los grados anteriores.

### 4.2. Checklist Quirúrgico AAHA / OMS
1. **Sign-in (Antes de la inducción):** Confirmación de identidad, ayuno verificado, consentimiento firmado y acceso venoso permeable.
2. **Time-out (Antes de la incisión):** Todo el equipo quirúrgico confirma paciente, procedimiento exacto y administración de antibiótico profiláctico.
3. **Sign-out (Antes de cerrar cavidad):** Conteo conforme de gasas, compresas e instrumental quirúrgico.

### 4.3. Hoja Anestésica en Tiempo Real ([`surgery_anesthesia_logs`](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/02_ARQUITECTURA_Y_BASE_DE_DATOS.md))
Registro cada 5 minutos de $\text{SpO}_2$, $\text{EtCO}_2$, Presión Arterial (Sistólica/Diastólica/PAM), Temperatura, % de vaporizador de gas anestésico (isoflurano/sevoflurano) y bolos administrados.

---

## 5. PIZARRA DE HOSPITALIZACIÓN UCI 24/7 (FLOWBOARD)

* **Cuadrícula Horaria de 24 Horas:** Visualización de tratamientos organizados en horas del día, sincronizados con la zona horaria local de la sede.
* **Calculadora de Infusión Continua (CRI):** Cálculo automático de tasas de infusión ($ml/kg/h$ o $mcg/kg/min$) para analgésicos potentes (Fentanilo, Ketamina, Lidocaína) y fluidoterapia de reemplazo/mantenimiento.
* **Captura de Ejecuciones:** Los técnicos marcan las dosis administradas (`DONE`) registrando las constantes vitales observadas en ese horario.

---

## 6. LABORATORIO CLÍNICO CON GRÁFICAS DE TENDENCIAS

* **Rangos de Referencia por Especie y Edad:** Diferenciación estricta de valores fisiológicos normales entre caninos, felinos y exóticos.
* **Semáforo de Valores Críticos:** Alarma visual en rojo cuando un analito se encuentra en rangos peligrosos (ej. hipoglucemia severa o hiperpotasemia).
* **Gráficas de Evolución:** Seguimiento visual de la curva de biomarcadores (ej. descenso de urea y creatinina tras 48h de fluidoterapia).

---

## 7. IMAGENOLOGÍA DIAGNÓSTICA Y VISOR WEB DICOM PACS

* **Visor Cornerstone.js Integrado:** Permite a los veterinarios ajustar el contraste óseo (*Windowing*), realizar zoom y manipular placas de Rayos X o Ecografías directamente en el navegador web sin software externo.
* **Herramientas de Medición Especializadas:**
  * **VHS de Buchanan (Índice Vertebral Cardiaco):** Medición de ejes cardiacos en relación a las vértebras torácicas para diagnóstico de cardiomegalia en perros.
  * **Ángulo TPLO:** Calibración angular para planificación de cirugía ortopédica de rodilla.

---

## 8. CONSENTIMIENTOS INFORMADOS DIGITALES "CERO PAPEL"

* **Firma Biométrica Táctil en Tablet:** El tutor lee los términos legales en una tablet y firma con el dedo o stylus óptico en recepción o consulta.
* **Fianza y Presupuesto Vinculado:** Registro del depósito económico acordado (`initial_deposit_amount`) vinculado al expediente.
* **PDF Inmutable:** Sellado con hash SHA-256 inalterable para protección médico-legal en: Cirugía, Anestesia, Admisión en UCI y Eutanasia Compasiva.

---

## 9. MOTOR DE CAPTURA AUTOMÁTICA DE COSTOS (ZERO-LOST-CHARGES)

Cada acto médico registrado (honorarios de consulta, suturas en quirófano, estudios de Rayos X, analíticas de laboratorio o días de canil en UCI) **se transfiere automáticamente a la pre-factura del paciente**, evitando la pérdida del 15-20% de ingresos habitual por olvidos de facturación.

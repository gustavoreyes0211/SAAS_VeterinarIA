# 10. GESTIÓN INTEGRAL DE CLIENTES (TUTORES) Y PACIENTES (MASCOTAS)

Este documento define la administración integral del padrón de tutores/propietarios y el expediente biológico maestro de las mascotas, incluyendo datos fiscales de El Salvador, microchips ISO, co-propietarios, medicina preventiva y el banner de seguridad clínica de alto contraste.

---

## 1. GESTIÓN DEL CLIENTE (TUTOR O PROPIETARIO)

En un hospital o clínica veterinaria, el cliente es la entidad legal y financiera responsable del paciente. El sistema modela sus datos personales, fiscales, de crédito y de contacto de emergencia en la entidad `clients`.

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                 EXPEDIENTE MAESTRO DEL CLIENTE                  │
  ├─────────────────────────────────────────────────────────────────┤
  │ • Nombres, Apellidos y Datos de Contacto (Teléfono/WhatsApp)   │
  │ • Datos Tributarios El Salvador: DUI, NIT, NRC, Razón Social   │
  │ • Contacto de Emergencia Alternativo (Cónyuge / Apoderado)      │
  │ • Categorización: VIP, Estándar, Refugio, Moroso, Precaución    │
  │ • Estado de Cuenta Corriente, Depósitos en Garantía y Crédito   │
  │ • Mascotas Asociadas (Acceso Directo a Fichas de Paciente)      │
  │ • Clave de Acceso PWA / Magic Link para el Portal del Tutor     │
  └─────────────────────────────────────────────────────────────────┘
```

### 1.1. Atributos del Cliente y Cumplimiento Tributario (El Salvador)
* **Tipo de Contribuyente (`client_tax_type`):**
  * `CONSUMIDOR_FINAL`: Requiere DUI (Documento Único de Identidad con formato `00000000-0`). Se le emiten **Facturas Electrónicas (DTE-01)**.
  * `CONTRIBUYENTE_CREDITO_FISCAL`: Requiere NIT, NRC (Número de Registro de Contribuyente), Código y Nombre de Actividad Económica (Giro) y Razón Social. Se le emiten **Comprobantes de Crédito Fiscal (DTE-03)**.
  * `EXTRANJERO`: Para diplomáticos, turistas o residentes temporales que se identifican con Pasaporte o Carnet de Residencia.
* **Canales de Comunicación y Notificación:**
  * Teléfono principal en formato internacional E.164 (ej. `+503 7000-0000`), utilizado para el envío de recordatorios de citas, recetas PDF y avisos automáticos de WhatsApp.
  * Teléfono secundario / fijo.
  * Correo electrónico para el despacho de Representaciones Gráficas de DTE y firmas de consentimientos informados.
  * Dirección física con Códigos de Departamento y Municipio del estándar oficial del Ministerio de Hacienda (ej. `06` San Salvador, `14` San Salvador).

### 1.2. Contacto de Emergencia Alternativo
Durante intervenciones quirúrgicas de alto riesgo o estancias en la UCI 24/7, es crítico disponer de un contacto secundario si el tutor principal no responde su teléfono:
* `emergency_contact_name`: Nombre completo del familiar o apoderado.
* `emergency_contact_phone`: Número de contacto prioritario.
* `emergency_contact_relationship`: Parentesco o relación (Cónyuge, Hermano/a, Cuidador, etc.).

### 1.3. Categorización Comercial y Crédito (`client_category_tag`)
* **Etiquetas de Cliente:**
  * `STANDARD`: Tutor regular con historial dentro de los parámetros normales.
  * `VIP`: Clientes de alto volumen, planes de salud prepagados o socios fundadores.
  * `FREQUENT`: Pacientes crónicos con visitas quincenales o mensuales programadas.
  * `RESCUER_SHELTER`: Rescatistas independientes o asociaciones protectoras de animales (con tarifas diferenciadas o donaciones).
  * `DEBTOR`: Clientes con saldos vencidos pendientes de pago (bloqueo automático de servicios electivos a crédito).
  * `HIGH_RISK_CAUTION`: Tutores conflictivos o con antecedentes de agresión al personal médico (aviso preventivo en recepción).
* **Cuenta Corriente y Depósitos:**
  * `current_balance`: Saldo neto en cuenta corriente (positivo a favor del cliente por depósitos anticipados; negativo por cuentas pendientes).
  * `credit_limit`: Límite máximo de crédito autorizado por gerencia para emergencias nocturnas.

---

## 2. EXPEDIENTE MAESTRO DEL PACIENTE (MASCOTA)

Cada paciente (`patients`) posee un expediente clínico longitudinal que consolida su filiación, características biológicas, factores de riesgo y alertas médicas permanentes.

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 🐶 "ROCKY" | Canino - Bulldog Francés | Macho Castrado | 3 años 2 meses│
 │ 🏷️ Microchip: 985141002345678 | 🩸 Sangre: DEA 1.1 Negativo            │
 │ ⚠️ ALERGIAS: Cefalexina, AINES | Crónico: Síndrome Braquicefálico      │
 │ 🚨 TEMPERAMENTO: Requiere Bozal (Ansiedad por Dolor)                   │
 └────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Filiación e Identificación Oficial
* **Especie y Catálogo Normalizado de Razas (`breeds`):**
  * Especies admitidas: `CANINE`, `FELINE`, `LAGOMORPH` (Conejos), `AVIAN`, `EXOTIC` (Hurones, Erizos, Pequeños Mamíferos) y `EQUINE`.
  * Catálogo de razas con pesos fisiológicos estándar de referencia (macho y hembra) y lista de predisposiciones genéticas registradas.
* **Identificación Electrónica con Microchip (ISO 11784 / 11785):**
  * Campo validado a 15 dígitos numéricos estándar internacional con validación de código de fabricante/país.
  * Compatibilidad con lectores universales RFID (134.2 kHz FDX-B).
  * Número de Tatuaje o Placa identificativa municipal / institucional.
* **Fisionomía y Pelaje:**
  * Color de manto, patrón de pelaje (atigrado, mirlo, bicolor, arlequín) y señas particulares (manchas oculares, cicatrices previas).
  * Foto de perfil del paciente (avatar) visible en la cabecera del software y en el carnet digital del tutor.
* **Sexo y Estado Reproductivo (`animal_gender`):**
  * `MALE_INTACT` (Macho entero), `MALE_NEUTERED` (Macho castrado).
  * `FEMALE_INTACT` (Hembra entera), `FEMALE_SPAYED` (Hembra esterilizada).
  * `UNKNOWN` (No determinado en animales exóticos juveniles).

### 2.2. Banner Superior de Seguridad Clínica Permanente
En cualquier pantalla donde un veterinario o técnico interactúe con el paciente (Consulta SOAP, Quirófano, UCI, Laboratorio, Carrito Rojo o Peluquería), se despliega un **Banner de Alerta en Alto Contraste**:
1. **Grupo Sanguíneo Tipificado:**
   * Caninos: DEA 1.1 (Positivo / Negativo). Esencial previo a transfusiones de sangre entera o plasma.
   * Felinos: Tipo A, Tipo B, Tipo AB. Vital para prevenir reacciones transfusionales hemolíticas fatales.
2. **Alergias Conocidas (`known_allergies`):**
   * Destacadas con fondo rojo pulsante (ej. Penicilina, Dipirona, Cefalosporinas, Yodo tópico).
   * El sistema genera una alerta bloqueante si un médico intenta prescribir un fármaco que contenga un principio activo alérgeno registrado.
3. **Condiciones Médicas Crónicas (`chronic_conditions`):**
   * Cardiopatías, Nefropatía Crónica (IRIS estadio I-IV), Epilepsia Idiopática, Diabetes Mellitus, Hipotiroidismo, Hiperadrenocorticismo.
4. **Alertas de Temperamento y Manejo Hospitalario (`temperament_alert`):**
   * `FRIENDLY`: Paciente dócil y cooperativo.
   * `FEARFUL_AGGRESSIVE`: Agresividad por miedo; requiere aproximación sin movimientos bruscos.
   * `REQUIRES_MUZZLE`: Bozal obligatorio antes de la palpación o sujeción.
   * `FRACTIOUS_CAT`: Manejo exclusivo Cat Friendly (toalla con feromonas Feliway, reducción de ruidos, sedación previa de bajo estrés si es necesario).
   * `HIGH_STRESS_CARDIOPATH`: Cardiópata con riesgo de descompensación aguda o edema pulmonar ante estrés en consultorio.
   * `NO_DOGS_COMPATIBLE`: Reactivo ante otros caninos en sala de espera.

---

## 3. MULTI-TUTORES Y CO-PROPIETARIOS (`patient_co_owners`)

En la vida real, una mascota no pertenece exclusivamente a una persona solitaria. Parejas, familias, cuidadores o rescatistas interactúan con la clínica:

```
                  ┌──────────────────────┐
                  │ PACIENTE: "LUCAS"    │
                  └──────────┬───────────┘
                             │
          ┌──────────────────┴──────────────────┐
          ▼                                     ▼
 ┌─────────────────┐                   ┌─────────────────┐
 │ TUTOR PRINCIPAL │                   │ CO-PROPIETARIO  │
 │ Juan Pérez      │                   │ María Gómez     │
 │ (Cliente Titular│                   │ (Cónyuge / Co-  │
 │ de Facturación) │                   │ Propietaria)    │
 ├─────────────────┤                   ├─────────────────┤
 │ • Firma DTE     │                   │ • Firma Consent.│
 │ • Estado Cuenta │                   │ • Retiro Mascota│
 └─────────────────┘                   └─────────────────┘
```

* **Relación de Co-Propietarios:**
  * Se enlaza al paciente con clientes secundarios (`client_id`) especificando su relación (`SPOUSE`, `FAMILY_MEMBER`, `CAREGIVER`, `LEGAL_AUTHORIZED`).
* **Facultades Jurídicas y Operativas:**
  * `is_authorized_to_sign_consent`: Autorizado para firmar consentimientos quirúrgicos, de anestesia o de internamiento en tablet.
  * `is_authorized_to_pick_up`: Autorizado para retirar al paciente del hospital o del salón de peluquería, evitando entregas a terceros no autorizados en litigios de custodia de mascotas.

---

## 4. MEDICINA PREVENTIVA INTEGRAL Y ALERTAS DE SALUD

El sistema automatiza el seguimiento preventivo del paciente, vinculándolo directamente con las notificaciones automáticas y el carnet digital PWA:

### 4.1. Curva Histórica de Peso Corporal (`patient_weight_history`)
* Cada vez que el paciente se pesa en recepción, consulta o triaje, se registra fecha, hora, sucursal, médico y peso exacto en $kg$ (precisión a 3 decimales).
* El sistema dibuja una **Gráfica de Tendencia Ponderal**:
  * Detección temprana de pérdida de peso involuntaria (> 5% en 1 mes = bandera roja de enfermedad crónica o neoplasia).
  * Control en cachorros para evaluar adecuación a la curva de crecimiento de su raza.

### 4.2. Carnet de Vacunación Oficial (`vaccination_records`)
* Registro de biológicos aplicados con **Nombre de Vacuna**, **Número de Lote**, **Laboratorio Fabricante**, **Fecha de Aplicación** y **Fecha de Próximo Refuerzo**.
* **Semáforo de Vacunación:**
  * 🟢 **Vigente:** Refuerzo distante a más de 30 días.
  * 🟡 **Próxima a Vencer:** Vence en los próximos 15 a 30 días (disparo de recordatorio por WhatsApp/Email).
  * 🔴 **Vencida:** Fecha de vencimiento superada (alerta en rojo en el carnet del tutor y en recepción).

### 4.3. Desparasitaciones Internas y Externas (`deworming_records` y `antiparasitic_records`)
* **Desparasitación Interna:** Registro de productos nematocidas/cestocidas (Febantel, Pirantel, Praziquantel), dosis administrada y fecha de control coprológico o siguiente toma.
* **Control Antiparasitario Externo:** Registro de fármacos de larga duración contra ectoparásitos (Isoxazolinas: Bravecto 3 meses, NexGard/Simparica 1 mes, collares Seresto 8 meses).
* **Alertas Predictivas:** El motor de eventos agenda automáticamente el recordatorio preventivo 3 días antes de que expire la protección antiparasitaria.

---

## 5. CICLO DE VIDA DEL PACIENTE Y PROTOCOLO DE DEFUNCIÓN

### 5.1. Etapas del Ciclo de Vida
1. **Neonatal y Cachorro/Gatito (0 a 12 meses):** Calendario intensivo de primovacunación, desparasitaciones quincenales, control de dentición decidua y asesoría de esterilización.
2. **Adulto Joven y Maduro (1 a 7 años):** Chequeos anuales, vacunación anual de refuerzo, profilaxis dental ultrasónica.
3. **Senior y Geronte (> 7 años en caninos grandes, > 9 años en felinos):** Perfil geriátrico semestral (panel renal, hepático, SDMA, ecocardiograma, presión arterial sistólica).

### 5.2. Protocolo Respetuoso de Defunción
Cuando un paciente fallece en hospitalización, quirófano o por eutanasia compasiva:
1. El médico veterinario activa la opción **"Registrar Defunción"** (`is_deceased = TRUE`), ingresando la fecha, hora y causa clínica (`deceased_reason`).
2. **Desactivación Inmediata de Mensajería Comercial:**
   * El sistema suspende de forma automática y estricta todos los recordatorios automáticos de vacunas, citas de peluquería o promociones por WhatsApp y correo, evitando situaciones dolorosas y poco éticas con el tutor.
3. **Acta de Defunción y Certificado de Eutanasia:**
   * Emisión automática del Certificado Oficial con firma y sello JVPM del médico tratante.
   * Registro del destino del cuerpo: Entrega a familiares, cremación individual con retorno de cenizas, cremación colectiva ecológica o necropsia patológica.

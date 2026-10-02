# 07. PELUQUERÍA, PORTAL DEL TUTOR PWA Y SMART TV

Este documento detalla la experiencia del cliente y los servicios complementarios: el Módulo de Estética Canina y Felina (Grooming), el Portal Progresivo para Tutores (PWA) y el Kiosco de Turnos para Smart TV.

---

## 1. MÓDULO DE PELUQUERÍA Y SPA VETERINARIO (GROOMING)

### 1.1. Tablero Operativo Kanban
Permite al equipo de peluqueros y recepcionistas gestionar visualmente el flujo de trabajo:
* `CHECKED_IN`: Mascota recibida en recepción.
* `IN_BATH`: En zona de tinas con agua tibia y champú seleccionado.
* `DRYING`: En mesa de secado y cepillado de manto.
* `HAIRCUT_STYLING`: En corte de raza, tijera y arreglo higiénico.
* `READY_FOR_PICKUP`: Listo para entrega (dispara automáticamente el aviso por WhatsApp al tutor).
* `DELIVERED`: Entregado al tutor y cobrado en caja.

### 1.2. Triage Dermatológico Pre-Baño
Antes de mojar a la mascota, el estilista completa un checklist rápido en tablet:
* **Presencia de Nudos:** Normal vs. Apelmazado (requiere corte a ras con previa autorización).
* **Parásitos Externos:** Pulgas o garrapatas (sugiere aplicación de pipeta o baño medicado).
* **Lesiones en Piel u Oídos:** Eritemas, alopecias, otitis con secreción.
* **Derivación Clínica Inmediata:** Si el estilista marca `requires_medical_check = TRUE`, el sistema genera automáticamente un ticket de turno para revisión por el médico veterinario.

### 1.3. Notificación con Fotografía por WhatsApp Cloud API
Al mover la mascota a la columna **"Listo para Entrega"**:
* El sistema envía un mensaje con la foto del resultado final (`photo_after_url`):
  > *"¡Hola [Nombre]! Te informamos que [Mascota] ya terminó su sesión de spa en [Sede]. Ya se encuentra listo(a) para que pases a recogerlo(a). 🐶✨"*

---

## 2. PORTAL DEL TUTOR (PET PARENT PORTAL - PWA MOBILE-FIRST)

Diseñado bajo tecnología **Progressive Web App (PWA)**, 100% responsivo para teléfonos móviles y computadoras sin requerir descargas desde Google Play o App Store.

```
 [Tutor escanea QR o recibe enlace por WhatsApp]
                        │
                        ▼
         [Autenticación Magic Link / OTP]
      (Acceso seguro por SMS o WhatsApp sin contraseñas)
                        │
                        ▼
         [Dashboard PWA del Tutor (Móvil / PC)]
  ┌────────────────────────────────────────────────────────┐
  │ 🐾 Carnet de Vacunas Digital (Semáforo de Vigencia)    │
  │ 📋 Historial Médico SOAP (Consultas y Recetas en PDF)  │
  │ 🏥 Estado en Vivo de Hospitalización UCI (Fotos y Peso)│
  │ ✂️ Estado en Vivo de Peluquería (Kanban en progreso)  │
  │ 🧾 Facturas Electrónicas DTE con QR del Min. Hacienda  │
  │ 📅 Agendamiento de Citas Online                       │
  └────────────────────────────────────────────────────────┘
```

### 2.1. Carnet de Vacunación Interactivo con Soporte Offline
* **Semáforo de Vacunas:**
  * 🟢 **Al Día:** Refuerzo distante.
  * 🟡 **Próximo Refuerzo:** Vence en los próximos 15 días (con botón para agendar cita).
  * 🔴 **Vencida:** Refuerzo atrasado.
* **Almacenamiento Local (Service Worker):** Permite al tutor mostrar el carnet oficial de vacunación en aeropuertos, guarderías u hoteles caninos **incluso si no tiene señal ni internet**.

---

## 3. SISTEMA DE TURNOS Y SALA DE ESPERA PARA SMART TV

### 3.1. Flujo de Llamado con Server-Sent Events (SSE)
* El médico pulsa **"Llamar Paciente"** desde su consola web.
* El servidor actualiza el turno en PostgreSQL a `CALLED` y emite el evento en Redis Pub/Sub.
* El gateway SSE envía la señal a la Smart TV suscrita a esa sede y sala específica.

### 3.2. Campana Hospitalaria Sintetizada (Web Audio API)
Para evitar fallas de descarga de archivos `.mp3` en redes inestables, el navegador del televisor sintetiza un acorde polifónico en Do Mayor (C5-E5-G5):
```javascript
export function playHospitalChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const notes = [523.25, 659.25, 783.99]; // Acorde Do Mayor
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2 + (idx * 0.25));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + (idx * 0.08));
    osc.stop(ctx.currentTime + 1.8);
  });
}
```

### 3.3. Modo OLED Anti-Burn-In (Pixel Shifting)
Para televisores OLED encendidos 24 horas continuas en la sala de espera, la interfaz desplaza sutilmente los elementos 3 píxeles cada 4 minutos de forma imperceptible, previniendo el quemado y retención de imagen fija en pantalla.

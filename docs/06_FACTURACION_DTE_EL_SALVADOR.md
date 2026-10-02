# 06. FACTURACIÓN ELECTRÓNICA DE EL SALVADOR (DTE - MINISTERIO DE HACIENDA)

Este documento detalla la integración nativa con el **Sistema de Transmisión de Documentos Tributarios Electrónicos (DTE)** regulado por la **Dirección General de Impuestos Internos (DGII) del Ministerio de Hacienda de El Salvador**.

---

## 1. TIPOS DE DOCUMENTOS SOPORTADOS EN LA CLÍNICA

| Código | Tipo de DTE | Destinatario y Caso de Uso Veterinario |
| :--- | :--- | :--- |
| **01** | **Factura Electrónica** | Tutores de mascotas y consumidores finales (consultas, vacunas, peluquería, cirugías particulares). |
| **03** | **Comprobante de Crédito Fiscal (CCF)** | Empresas, criaderos registrados, fundaciones con NRC y laboratorios B2B. |
| **05** | **Nota de Crédito** | Devoluciones, anulaciones de cargos o descuentos otorgados post-emisión. |
| **14** | **Factura de Sujeto Excluido** | Compras o pagos de servicios a personas naturales sin registro de IVA. |

---

## 2. FORMATO REGLAMENTARIO DEL NÚMERO DE CONTROL

El Ministerio de Hacienda exige una estructura fija de 31 caracteres alfanuméricos:

$$\text{DTE} - \{\text{Tipo: 2 dig}\} - \{\text{Establecimiento: 4 car}\} - \{\text{Punto Venta: 4 car}\} - \{\text{Secuencia: 15 dig}\}$$

* **Ejemplo Factura en Hospital Central:** `DTE-01-M001P001-000000000000142`
* **Ejemplo Crédito Fiscal en Sucursal Satélite:** `DTE-03-M002P001-000000000000028`

> **Código de Generación:** Cada DTE genera obligatoriamente un identificador universal UUID v4 en mayúsculas (ej. `3B82F6A1-9D2E-4E7B-A5F1-0A8F1C3B4E21`).

---

## 3. FLUJO DE GENERACIÓN, FIRMA DIGITAL Y TRANSMISIÓN

```
 [Cobro en Caja / Alta Médica]
               │
               ▼
 [Construcción de JSON DTE v3] ──► [Validación de Esquema Oficial MH]
               │
               ▼
 [Firmador Criptográfico JWS] ──► [Firma con Certificado X.509 RSA SHA-512]
               │
         ¿Hay Conexión y
          MH Disponible?
            ├── SÍ ──► [POST /fesv/recepciondte] ──► [Sello de Recepción Obtenido]
            │                                                 │
            └── NO ──► [Modo Contingencia Offline]            ▼
                       (Almacena en cola Redis BullMQ) ──► [Generación PDF + QR Oficial]
                                                              │
                                                              ▼
                                               [Envío WhatsApp Cloud / Email al Tutor]
```

### 3.1. Firma Digital (JSON Web Signature - JWS)
* Utiliza el certificado `.crt` y clave privada `.key` del contribuyente almacenada con cifrado asimétrico en la base de datos (`tenant_dte_configs`).
* Algoritmo: `RS512` (RSA con SHA-512) conforme a la guía técnica oficial del MH.

---

## 4. REPRESENTACIÓN GRÁFICA (PDF) Y CÓDIGO QR OFICIAL

El PDF emitido contiene:
1. Membrete oficial de la clínica veterinaria y sucursal emisora.
2. Número de Control, Código de Generación y Sello de Recepción otorgado por Hacienda.
3. Desglose fiscal en USD ($): Subtotal Gravado, Exento, IVA 13% y Retención 1% (si aplica).
4. **Código QR Oficial Dinámico:** Enlaza directamente al validador público de Hacienda:
   ```
   https://admin.factura.gob.sv/consultaPublica?ambiente=00&codGen=3B82F6A1-9D2E-4E7B-A5F1-0A8F1C3B4E21&fechaEmi=2026-10-02
   ```

---

## 5. PROTOCOLO DE CONTINGENCIA OFFLINE (RESILIENCIA MÉDICA)

Ante caídas de internet en la clínica o ventanas de mantenimiento del servidor de Hacienda:
1. El sistema cambia el estado del DTE a `CONTINGENCY`.
2. Se genera e imprime la representación gráfica provisional con la leyenda legal: *"Documento emitido en contingencia según Art. 11 de la Normativa DTE"*.
3. El documento se encola en **Redis BullMQ** con reintentos exponenciales automáticos.
4. Al restablecerse la conectividad (plazo legal máximo de 72 horas), el servicio en segundo plano transmite el lote de contingencia al MH y actualiza los Sellos de Recepción sin intervención humana.

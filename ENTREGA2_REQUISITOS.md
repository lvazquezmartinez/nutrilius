# Definición del prototipo tecnológico — Entrega 2

> Requisitos **reales** de la Entrega 2 (transcritos de la consigna oficial
> *"Prototipado tecnológico — Lectura 2: Definición del prototipo tecnológico"*, 38 pág.),
> con el **estado** de cada entregable y el **insumo** que lo cubre. El proyecto usa
> **Scrum**, así que aplican los artefactos de Scrum (no UML).

## Entregables (camino Scrum)

| # | Entregable | Estado | Insumo |
|---|---|---|---|
| 1 | **Diagnóstico y propuesta** | 🟡 redacción (agente) | `REQUERIMIENTOS.md`, `CASOS_DE_USO_Y_FLUJOS.md` |
| 2 | **Objetivo, límite y alcances** del prototipo | 🟡 redacción | Alcances + nota datos reales |
| 3 | **Descripción del sistema (Scrum)**: product backlog + historias + sprint backlog | ✅ insumo completo | `ENTREGA2_SCRUM.md` |
| 4 | **Estructura de datos**: DER (+ justificación) + **diccionario de datos** | ✅ completo | `MODELO_DATOS.md`, `DICCIONARIO_DATOS.md`, `ANEXO_ANAMNESIS.md` |
| 5 | **Prototipos de interfaces de pantallas** | ✅ capturas generadas | `capturas-entrega2/` (9 PNG) |
| 6 | **Diagrama de arquitectura** (Scrum) + relato | ✅ completo | `ARQUITECTURA.md` + `docs/arquitectura.svg` |

## Requisitos de formato exactos (de la consigna)

### 1 · Diagnóstico y propuesta
- Tabla por proceso: **Nombre del proceso / Problemas / Causas**. Respetar el nombre del proceso del relevamiento.
- ⚠️ La causa **nunca** es "no existe un sistema informático". No incluir procesos que ya son correctos.
- Cerrar con una **propuesta genérica** (un relato) que resuelva los procesos diagnosticados.

### 2 · Objetivo, límite y alcances
- **Objetivo:** una sola oración, verbo en infinitivo, sin "punto y seguido".
- **Límite:** "desde XXXX hasta YYYY".
- **Alcances:** lista de procesos de negocio (solo mencionarlos, no explicarlos).

### 3 · Descripción del sistema (Scrum)
- **Product backlog** (Tabla 5): columnas **ID · Historia de usuario · Prioridad · Puntos de historia · Dependencias**.
- **Historias de usuario** (Tabla 2), cada una con:
  - Identificación (código + nombre),
  - Descripción: *"como <rol> quiero <función> para lograr <valor de negocio>"*,
  - **Criterios de aceptación en formato "dado/a – cuando – entonces"**.
- **Sprint backlog** (Tabla 3): columnas **Sprint · Historia de usuario · ID · Tareas · Prioridad · Estimado · Estado (Hecho/Por hacer)**. **Es mandatorio elaborar al menos el primer sprint** con sus tareas (diseñar, codificar, diseñar interfaz, implementar, testing).

### 4 · Estructura de datos
- Presentar **DER** (elegido por ser base relacional) y **justificar** la elección del diagrama.
- **Diccionario de datos OBLIGATORIO en nuestro caso**: la consigna lo exige cuando los nombres de entidad/atributo **no están en español** o no son comprensibles. Nuestros modelos usan nombres en inglés (`first_name`, `weight_kg`, `muscle_mass_pct`, …) → **hay que incluirlo** (Tabla 4): **Campo · Longitud · Tipo de datos · Descripción**. (`ANEXO_ANAMNESIS.md` ya lo hace para la anamnesis; falta el resto de entidades.)

### 5 · Prototipos de interfaces de pantallas — ✅
- Pide "las interfaces de **todo el producto** que hayas diseñado" reflejando el **encadenamiento lógico** del proceso.
- La consigna sugiere wireframes "sin codificar", pero como el prototipo **ya está construido**, entregamos **capturas reales del sistema** (equivalen y superan al mockup). En `capturas-entrega2/`:
  - [x] 01 Landing · 02 Login · 03 Registro
  - [x] 04 Dashboard · 05 Pacientes
  - [x] 06 Ficha–Datos · 07 Ficha–Anamnesis · 08 Ficha–Evoluciones (con gráfico) · 09 Ficha–Turnos
  - Capturadas con **cuenta demo + datos sintéticos** (sin datos reales).
  - Falta (opcional): un **diagrama de flujo de navegación** entre pantallas para mostrar el "encadenamiento lógico".

### 6 · Diagrama de arquitectura (Scrum)
- Como el proyecto usa **Scrum**, va **diagrama de arquitectura** (los de UML presentan diagrama de despliegue).
- Debe ir acompañado de un **breve relato** explicando su funcionamiento (cómo se conectan front, API, base y servicios en la nube). Base en `INFRAESTRUCTURA.md`.

## Gaps concretos — estado
1. ✅ Backlog con **Puntos** + sección **Dependencias** (`ENTREGA2_SCRUM.md`).
2. ✅ Criterios de aceptación en **"dado – cuando – entonces"** (historias ejemplares HU-01/02/11/14; el resto sigue el mismo formato).
3. ✅ **Sprint backlog a nivel tareas** (Sprint 1, mandatorio).
4. ✅ **Diccionario de datos** completo (`DICCIONARIO_DATOS.md`).
5. ✅ **Relato de arquitectura** (`ARQUITECTURA.md`).

**Todos los entregables tienen su insumo listo.** Queda solo la redacción/armado final en el
`.docx` por el agente de tesis, y la decisión del PO sobre el apartado de datos reales.

## Pendiente de decisión del PO
- Redacción del apartado de **datos reales** (demo con cuenta vacía; profesionales reales bajo su responsabilidad; Ley 25.326).

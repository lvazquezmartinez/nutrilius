# Definición del prototipo tecnológico — Entrega 2

> Requisitos y **checklist de estado** de la Entrega 2 (*Definición del prototipo
> tecnológico*) del TFG, según lo relevado, con el **estado** de cada entregable y **qué
> documento/insumo lo cubre**. Sirve para no perder de vista ningún ítem (en particular
> las **capturas de pantalla**).

## Entregables pedidos

| # | Entregable | Estado | Insumo / dónde |
|---|---|---|---|
| 1 | **Diagnóstico y Propuesta** — descripción del área problemática y la propuesta de solución (3 procesos relevados: elaboración/aprobación de plan alimentario, registro de anamnesis, gestión de turnos, recontacto por inactividad) | 🟡 En redacción (agente tesis) | Base en `REQUERIMIENTOS.md` + `CASOS_DE_USO_Y_FLUJOS.md` |
| 2 | **Objetivo, límites y alcances del prototipo** — qué hace, qué queda afuera y por qué | 🟡 En redacción | Alcances + nota de datos reales (ver `REQUERIMIENTOS.md` §2.5 y redacción acordada) |
| 3 | **Descripción del Sistema con artefactos de Scrum** — product backlog, historias de usuario, sprint backlog | ✅ Insumo listo | `ENTREGA2_SCRUM.md` (18 historias reales + backlog + sprints) |
| 4 | **Estructura de datos (DER)** — modelo de datos del prototipo | ✅ Insumo listo | `MODELO_DATOS.md` (DER Mermaid) |
| 5 | **Prototipos de interfaces / pantallas** — mockups o wireframes **y/o capturas de pantalla** de las pantallas principales | ⏳ **Pendiente: subir capturas de pantalla** | Ver sección abajo |
| 6 | **Diagrama de arquitectura** (versión Scrum, no UML formal) | 🟡 Casi listo | `INFRAESTRUCTURA.md` + decisiones (`DECISIONES_TECNICAS_Y_SEGURIDAD.md`) |

Anexos complementarios ya generados: `ANEXO_ANAMNESIS.md` (ficha de anamnesis).

## ⚠️ Ítem 5 — Capturas de pantalla (pendiente)

La consigna pide **subir capturas de pantalla** de las pantallas principales. Ventaja:
el prototipo **está funcionando en producción** (`nutrilius.com.ar`), así que se pueden
usar **capturas reales del sistema andando**, que valen más que wireframes.

Pantallas principales a capturar:
- [ ] Landing pública (`/`)
- [ ] Login / Registro (con ingreso por Google)
- [ ] Dashboard (métricas + agenda del día)
- [ ] Listado de pacientes (búsqueda)
- [ ] Ficha de paciente — pestaña **Datos**
- [ ] Ficha de paciente — pestaña **Anamnesis**
- [ ] Ficha de paciente — pestaña **Evoluciones** (con el **gráfico de tendencia**)
- [ ] Ficha de paciente — pestaña **Turnos**

> Nota de privacidad: capturar con **datos de demo/sintéticos** (cuenta vacía o de
> prueba), nunca con datos de pacientes reales.

## Pendiente de decisión del PO
- Redacción final del apartado de **datos reales** (demo con cuenta vacía; profesionales
  reales bajo su responsabilidad; datos de salud Ley 25.326). Ver `ENTREGA2_SCRUM.md` §6.

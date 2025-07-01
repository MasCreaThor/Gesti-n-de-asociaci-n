import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Acta from '../../../lib/models/Acta'
import Configuracion from '../../../lib/models/Configuracion'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAH32SaWE2MMUzWuD37z7LCvyGutMDjkvs'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    await dbConnect()
    const { actaId } = req.body
    if (!actaId) {
      return res.status(400).json({ error: 'ID de acta requerido' })
    }
    
    // Obtener la acta con información de la reunión
    const acta = await (Acta as any).findById(actaId)
      .populate('reunionId', 'titulo fecha tipoReunion lugar hora asistentes descripcion')
      .exec()
    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' })
    }

    // Obtener la configuración del sistema
    const configuracion = await (Configuracion as any).findOne().exec()
    if (!configuracion) {
      return res.status(500).json({ error: 'Configuración del sistema no encontrada' })
    }

    // Utilidades para el prompt
    const getTipoReunionLegible = (tipo: string) => {
      const tipos = {
        'asamblea': 'Asamblea General',
        'reunion_ordinaria': 'Reunión Ordinaria',
        'reunion_extraordinaria': 'Reunión Extraordinaria'
      }
      return tipos[tipo as keyof typeof tipos] || tipo
    }
    const getNombreMes = (fecha: Date) => {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
      return meses[fecha.getMonth()]
    }

    // ----------- PASO 1: ANÁLISIS Y ESTRUCTURACIÓN (JSON) -----------
    const promptAnalisis = `
Eres un analista de actas experto y un asistente de estructuración de datos. Tu tarea es leer la siguiente transcripción de una reunión e información contextual, y convertirla en un objeto JSON bien formado.

**INSTRUCCIONES CRÍTICAS:**
1.  **Salida Exclusivamente en JSON:** Tu respuesta DEBE ser únicamente el objeto JSON. No incluyas texto introductorio, explicaciones, ni las marcas de código \`\`\`json. Solo el JSON puro.
2.  **Mapeo de Participantes:** Analiza la transcripción para identificar los nombres reales de los "Oradores". Usa el contexto (presentaciones, menciones como "doctor Manuel", "Darlene", "Denly") para asociar "Orador 1", "Orador 2", etc., con sus nombres. Si un nombre no puede ser identificado, usa su etiqueta genérica (ej: "Orador 3").
3.  **Deducción del Orden del Día:** Identifica y deduce TODOS los grandes temas de la discusión y formúlalos como puntos claros para el orden del día. No limites el número de ítems, incluye todos los temas relevantes tratados.
4.  **Resumen de Deliberaciones:** Para cada punto del orden del día, crea un resumen detallado de la discusión. Atribuye cada intervención al nombre correcto del participante que identificaste. Si dentro de un resumen hay una lista de requisitos o puntos, usa el formato markdown con guiones (-) para crear una sublista.
5.  **Extracción de Acuerdos y Tareas:** Identifica y lista claramente cualquier decisión, acuerdo o tarea pendiente que surja.

**EJEMPLO DE TRANSCRIPCIÓN Y SALIDA ESPERADA:**
TRANSCRIPCIÓN:
"""
Orador 1: Buenas tardes, soy Manuel, presidente de la asociación. Hoy revisaremos el Acuerdo 006 y la elección de representantes.
Orador 2: Gracias Manuel. ¿Podemos ver el documento?
Orador 1: Claro, aquí está. El acuerdo establece la creación del Consejo Municipal de Paz.
Orador 3: ¿Quiénes pueden ser elegidos?
Orador 1: Cualquier miembro de la sociedad civil que cumpla los requisitos.
Orador 2: Sugiero que se publique la convocatoria en la web.
Orador 1: De acuerdo, lo haremos así.
"""
SALIDA JSON ESPERADA:
{
  "participantes": [
    { "etiqueta": "Orador 1", "nombreIdentificado": "Manuel" },
    { "etiqueta": "Orador 2", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 3", "nombreIdentificado": "No identificado" }
  ],
  "ordenDelDia": [
    "Revisión del Acuerdo 006",
    "Elección de representantes de la sociedad civil",
    "Publicación de la convocatoria"
  ],
  "deliberaciones": [
    {
      "punto": "1. Revisión del Acuerdo 006",
      "resumen": "Manuel presenta el Acuerdo 006 y explica la creación del Consejo Municipal de Paz."
    },
    {
      "punto": "2. Elección de representantes de la sociedad civil",
      "resumen": "Orador 3 pregunta sobre los requisitos. Manuel responde que cualquier miembro que cumpla los requisitos puede ser elegido."
    },
    {
      "punto": "3. Publicación de la convocatoria",
      "resumen": "Orador 2 sugiere publicar la convocatoria en la web. Manuel acepta la sugerencia."
    }
  ],
  "acuerdosYTareas": [
    "Publicar la convocatoria en la web.",
    "Realizar la elección de representantes."
  ]
}

**INFORMACIÓN DE CONTEXTO:**
- Presidente de la Asociación: ${configuracion.presidente.nombre}
- Secretario de la Asociación: ${configuracion.secretario.nombre}
- Posibles nombres mencionados: Manuel, Darlene, Denly, Berlín, Yulisa, Nelazio, Duderney, Sandra Lagos.

**TRANSCRIPCIÓN A ANALIZAR:**
${acta.apuntes}

**ESTRUCTURA JSON DE SALIDA REQUERIDA:**
{
  "participantes": [
    { "etiqueta": "Orador 1", "nombreIdentificado": "Nombre Real o 'Orador 1 si no se identifica'" }
  ],
  "ordenDelDia": [
    "Tema 1...",
    "Tema 2..."
  ],
  "deliberaciones": [
    {
      "punto": "1. Tema 1...",
      "resumen": "Resumen detallado..."
    }
  ],
  "acuerdosYTareas": [
    "Acuerdo o tarea 1..."
  ]
}
`;

    // Llamada a Gemini para el análisis
    const responseAnalisis = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { parts: [ { text: promptAnalisis } ] }
        ]
      })
    })
    if (!responseAnalisis.ok) {
      const errorData = await responseAnalisis.text()
      return res.status(500).json({ error: 'Error en análisis IA', detalle: errorData })
    }
    const dataAnalisis = await responseAnalisis.json()
    let contenidoJsonTexto = dataAnalisis.candidates?.[0]?.content?.parts?.[0]?.text

    // Preprocesamiento para limpiar la respuesta de la IA
    if (contenidoJsonTexto) {
      // Eliminar marcas de código ```json o ```
      contenidoJsonTexto = contenidoJsonTexto.replace(/```json|```/g, '').trim()
      // Buscar el primer y último { }
      const firstBrace = contenidoJsonTexto.indexOf('{')
      const lastBrace = contenidoJsonTexto.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1) {
        contenidoJsonTexto = contenidoJsonTexto.substring(firstBrace, lastBrace + 1)
      }
    }

    let datosEstructurados
    try {
      datosEstructurados = JSON.parse(contenidoJsonTexto)
    } catch (e) {
      return res.status(500).json({ error: 'La IA no devolvió un JSON estructurado válido.', contenido: contenidoJsonTexto })
    }

    // Formatear listas para el segundo prompt
    const ordenDelDiaFormateado = (datosEstructurados.ordenDelDia || [])
      .map((item: string, idx: number) => `${idx + 1}. ${item}`)
      .join('\n')
    const deliberacionesFormateadas = (datosEstructurados.deliberaciones || [])
      .map((d: any) => `**${d.punto}**\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${d.resumen.replace(/\n/g, '\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}`)
      .join('\n\n')
    const acuerdosFormateados = (datosEstructurados.acuerdosYTareas || [])
      .map((a: string, idx: number) => `${idx + 1}. ${a}`)
      .join('\n')

    // ----------- PASO 2: REDACCIÓN FINAL -----------
    const promptRedaccion = `
Eres un secretario experto encargado de redactar un acta formal y profesional usando la información estructurada que se te proporciona. Sigue el formato EXACTAMENTE como se indica, con las sangrías y negritas correspondientes.

**INFORMACIÓN DE LA ASOCIACIÓN Y REUNIÓN:**
- Nombre de la Asociación: ${configuracion.nombreCompletoAsociacion}
    - Tipo de Reunión: ${getTipoReunionLegible(acta.tipoReunion)}
    - Lugar: ${acta.lugar}
- Fecha: ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}
    - Hora: ${acta.hora}
- Presidente: ${configuracion.presidente.nombre}
- Secretario: ${configuracion.secretario.nombre}
- Número de Asistentes: ${acta.asistentes.length}

**CONTENIDO ESTRUCTURADO DEL ACTA:**

**ORDEN DEL DÍA:**
${ordenDelDiaFormateado}

**DELIBERACIONES Y ACUERDOS:**
${deliberacionesFormateadas}

**ACUERDOS Y TAREAS:**
${acuerdosFormateados}

**REDacta EL ACTA FINAL SIGUIENDO ESTE FORMATO OBLIGATORIO:**

<p align="center"><strong>${configuracion.nombreAsociacion.toUpperCase()}</strong></p>
<p align="center"><strong>ACTA DE LA ${getTipoReunionLegible(acta.tipoReunion).toUpperCase()}</strong></p>
<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;En [Lugar], la **[Nombre de la Asociación]**, y siendo las [Hora] horas del [Fecha completa], debidamente convocados, los socios se reúnen en [Tipo de Reunión], respetando el quórum legalmente exigido.

<br>
<p align="center"><strong>COMPOSICIÓN DE LA MESA</strong></p>
<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Actúa como presidente de la Asamblea **[Presidente]** y como secretario **[Secretario]**.

<br>
<p align="center"><strong>ASISTENCIA</strong></p>
<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Asisten a la reunión un total de [Número de Asistentes] socios.

<br>
<p align="center"><strong>ORDEN DEL DÍA</strong></p>
<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Se presenta y aprueba el siguiente orden del día:
${ordenDelDiaFormateado.replace(/\n/g, '<br>')}

<br>
<p align="center"><strong>DELIBERACIONES Y ACUERDOS</strong></p>
<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tras la lectura del Orden del Día, se procede a su tratamiento, dando lugar a las siguientes deliberaciones y acuerdos:

${deliberacionesFormateadas.replace(/\n/g, '<br>')}

<br>
<p align="center"><strong>ACUERDOS Y TAREAS</strong></p>
<br>
${acuerdosFormateados.replace(/\n/g, '<br>')}

<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No habiendo más asuntos que tratar, se levanta la sesión.

<br><br><br>
| | |
|:---:|:---:|
| _____________________________________ | _____________________________________ |
| **${configuracion.presidente.nombre}** | **${configuracion.secretario.nombre}** |
| **PRESIDENTE** | **SECRETARIO** |
`;

    // Llamada a Gemini para la redacción final
    const responseRedaccion = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { parts: [ { text: promptRedaccion } ] }
        ]
      })
    })
    if (!responseRedaccion.ok) {
      const errorData = await responseRedaccion.text()
      return res.status(500).json({ error: 'Error en redacción IA', detalle: errorData })
    }
    const dataRedaccion = await responseRedaccion.json()
    const actaGenerada = dataRedaccion.candidates?.[0]?.content?.parts?.[0]?.text

    // Guardar el acta generada, la estructura y marcar como finalizada
    const actaActualizada = await (Acta as any).findByIdAndUpdate(
      actaId,
      { actaGenerada, estructura: datosEstructurados, estado: 'finalizada' },
      { new: true }
    ).exec()
    
    res.status(200).json({
      acta: actaActualizada,
      contenidoGenerado: actaGenerada,
      estructura: datosEstructurados
    })
  } catch (error) {
    console.error('Error extremo al generar acta con IA:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 
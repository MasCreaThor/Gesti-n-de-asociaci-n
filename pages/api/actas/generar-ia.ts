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
    const { actaId, regenerar } = req.body
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

    // Si no es regeneración y ya existe un acta generado, verificar
    if (!regenerar && acta.actaGenerada && acta.actaGenerada.trim() !== '') {
      return res.status(400).json({ error: 'Ya existe un acta generado para esta reunión. Use "Regenerar" para crear una nueva versión.' })
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

**EJEMPLO MEJORADO DE TRANSCRIPCIÓN Y SALIDA ESPERADA:**
TRANSCRIPCIÓN:
"""
Orador 1: Buenas tardes, soy Manuel, presidente de la asociación. Hoy tenemos una agenda extensa que incluye revisión del presupuesto, elección de comisiones y varios temas administrativos.
Orador 2: Gracias Manuel. Soy Darlene, secretaria. Antes de empezar, ¿podemos confirmar la asistencia?
Orador 1: Claro, tenemos 12 personas presentes. Procedamos con el primer punto.
Orador 3: Soy Berlín, tesorero. Sobre el presupuesto, necesitamos revisar los gastos del último trimestre. Hay algunas inconsistencias en los reportes.
Orador 4: ¿Qué tipo de inconsistencias específicamente?
Orador 3: Principalmente en los gastos de mantenimiento y los honorarios de consultoría. Sugiero que revisemos línea por línea.
Orador 5: Estoy de acuerdo con Berlín. También noté que faltan algunos recibos de los proveedores.
Orador 1: Bien, entonces acordamos revisar el presupuesto detalladamente. ¿Quién se encarga?
Orador 3: Yo puedo liderar la revisión, pero necesito apoyo de la comisión de finanzas.
Orador 6: Me ofrezco para apoyar. Soy Yulisa, de la comisión de finanzas.
Orador 1: Perfecto. Pasemos al siguiente punto: elección de comisiones.
Orador 7: ¿Cuáles son los requisitos para ser miembro de comisión?
Orador 2: Los requisitos están en el reglamento: ser socio activo, tener disponibilidad de tiempo, y no tener conflictos de interés.
Orador 8: ¿Y cuánto tiempo dura el cargo?
Orador 2: Dos años, con posibilidad de reelección por un período más.
Orador 1: ¿Hay candidatos para las comisiones vacantes?
Orador 9: Me postulo para la comisión de eventos. Tengo experiencia en organización.
Orador 10: Yo también me intereso, pero necesito más información sobre las responsabilidades.
Orador 2: Te puedo enviar el documento con las responsabilidades detalladas.
Orador 1: Bien, entonces programamos la elección para la próxima reunión. ¿Alguien más tiene algo que agregar sobre este punto?
Orador 11: Solo recordar que necesitamos actualizar el reglamento de comisiones.
Orador 1: Correcto, lo incluimos en la agenda de la próxima reunión.
Orador 12: Sobre los temas administrativos, necesitamos renovar el contrato de limpieza.
Orador 1: ¿Cuál es el estado actual del contrato?
Orador 12: Vence en dos meses. El proveedor actual quiere aumentar el precio en un 15%.
Orador 3: Eso es un incremento significativo. ¿Tenemos otras opciones?
Orador 12: Sí, tengo tres cotizaciones de otros proveedores. La más competitiva es un 8% menos que el precio actual.
Orador 1: Entonces evaluemos las tres opciones y tomemos una decisión en la próxima reunión.
Orador 13: ¿Podemos incluir en la evaluación los criterios de calidad del servicio?
Orador 1: Por supuesto, es fundamental. ¿Alguien más tiene temas para tratar?
Orador 14: Solo recordar que la próxima reunión será el 15 del próximo mes.
Orador 1: Perfecto. Con esto damos por terminada la reunión.
"""
SALIDA JSON ESPERADA:
{
  "participantes": [
    { "etiqueta": "Orador 1", "nombreIdentificado": "Manuel" },
    { "etiqueta": "Orador 2", "nombreIdentificado": "Darlene" },
    { "etiqueta": "Orador 3", "nombreIdentificado": "Berlín" },
    { "etiqueta": "Orador 4", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 5", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 6", "nombreIdentificado": "Yulisa" },
    { "etiqueta": "Orador 7", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 8", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 9", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 10", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 11", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 12", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 13", "nombreIdentificado": "No identificado" },
    { "etiqueta": "Orador 14", "nombreIdentificado": "No identificado" }
  ],
  "ordenDelDia": [
    "Revisión del presupuesto del último trimestre",
    "Elección de comisiones",
    "Renovación del contrato de limpieza",
    "Actualización del reglamento de comisiones"
  ],
  "deliberaciones": [
    {
      "punto": "1. Revisión del presupuesto del último trimestre",
      "resumen": "Berlín (tesorero) reporta inconsistencias en los gastos de mantenimiento y honorarios de consultoría. Orador 5 confirma la falta de algunos recibos de proveedores. Se acuerda una revisión detallada línea por línea. Berlín se compromete a liderar la revisión con apoyo de Yulisa de la comisión de finanzas."
    },
    {
      "punto": "2. Elección de comisiones",
      "resumen": "Se discuten los requisitos para ser miembro de comisión: ser socio activo, tener disponibilidad de tiempo y no tener conflictos de interés. El cargo dura dos años con posibilidad de reelección. Orador 9 se postula para la comisión de eventos. Orador 10 solicita más información sobre responsabilidades. Darlene se compromete a enviar el documento detallado. Se programa la elección para la próxima reunión."
    },
    {
      "punto": "3. Renovación del contrato de limpieza",
      "resumen": "El contrato actual vence en dos meses. El proveedor actual solicita un aumento del 15%. Orador 12 presenta tres cotizaciones alternativas, siendo la más competitiva un 8% menor al precio actual. Se acuerda evaluar las tres opciones considerando criterios de calidad del servicio en la próxima reunión."
    },
    {
      "punto": "4. Actualización del reglamento de comisiones",
      "resumen": "Orador 11 solicita actualizar el reglamento de comisiones. Se incluye este tema en la agenda de la próxima reunión."
    }
  ],
  "acuerdosYTareas": [
    "Berlín y Yulisa realizarán revisión detallada del presupuesto del último trimestre",
    "Darlene enviará documento con responsabilidades detalladas de comisiones a Orador 10",
    "Programar elección de comisiones para la próxima reunión",
    "Evaluar tres cotizaciones de limpieza considerando calidad del servicio",
    "Incluir actualización del reglamento de comisiones en agenda de próxima reunión",
    "Próxima reunión programada para el 15 del próximo mes"
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

**APUNTES ORIGINALES PARA ANÁLISIS DE CONCLUSIÓN:**
${acta.apuntes}

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
**INSTRUCCIONES CRÍTICAS PARA LA CONCLUSIÓN:**
IMPORTANTE: Después de la sección "ACUERDOS Y TAREAS", DEBES incluir una conclusión natural del acta.

**ANALIZA LOS APUNTES ORIGINALES** para encontrar información sobre:
- Hora de inicio y finalización de la reunión (busca patrones como "2:00 PM - 3:45 PM", "de 2pm a 3:45pm", "inició a las 2:00", "terminó a las 3:45", etc.)
- Anuncios sobre próxima reunión
- Recordatorios importantes
- Cómo se cerró la reunión

**ESTRUCTURA DE LA CONCLUSIÓN:**
1. Comienza con "En conclusión..." y haz un resumen de los principales acuerdos y temas tratados
2. Termina con la frase estándar de cierre incluyendo la hora de finalización

**DETECCIÓN DE HORAS EN LOS APUNTES:**
Busca estos patrones en los apuntes originales:
- Rangos: "2:00 PM - 3:45 PM", "de 2pm a 3:45pm", "2:00-3:45"
- Hora de inicio: "inició a las 2:00", "comenzó a las 2pm", "empezó a las 14:00"
- Hora de finalización: "terminó a las 3:45", "finalizó a las 3:45pm", "concluyó a las 15:45"
- Duración: "duró 1 hora 45 minutos", "se extendió hasta las 3:45"
- Conversión: Si encuentras formato 24h (14:00), conviértelo a formato 12h (2:00 PM) para el acta. Mantén formato 12h si ya está así.

**FORMATO DE LA CONCLUSIÓN:**
Después de la sección "ACUERDOS Y TAREAS", continúa directamente con la conclusión sin subtítulo.

**EJEMPLOS DE CONCLUSIÓN:**
- Con rango de horas en los apuntes (ej: "2:00 PM - 3:45 PM"):
  "En conclusión, se han tratado los temas del presupuesto, elección de comisiones y renovación de contratos. Se han establecido acuerdos claros para cada punto y se han asignado responsabilidades específicas. No habiendo más asuntos que tratar, se levanta la sesión a las 3:45 PM."

- Con hora específica de finalización (ej: "terminó a las 3:45 PM"):
  "En conclusión, se han revisado y aprobado todos los puntos del orden del día, estableciendo acuerdos importantes para el funcionamiento de la asociación. No habiendo más asuntos que tratar, se levanta la sesión a las 3:45 PM."

- Sin hora específica:
  "En conclusión, se han abordado todos los temas pendientes y se han tomado decisiones importantes para el futuro de la asociación. No habiendo más asuntos que tratar, se levanta la sesión."

- Con próxima reunión y hora:
  "En conclusión, se han abordado todos los temas pendientes y se han tomado decisiones importantes para el futuro de la asociación. Se acuerda que la próxima reunión será el 15 del próximo mes. No habiendo más asuntos que tratar, se levanta la sesión a las 6:00 PM."

**OBLIGATORIO:** Incluye siempre una conclusión, NO dejes el acta sin cerrar.
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
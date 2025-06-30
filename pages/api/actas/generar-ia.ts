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

    // Función para convertir tipos de reunión
    const getTipoReunionLegible = (tipo: string) => {
      const tipos = {
        'asamblea': 'Asamblea General',
        'reunion_ordinaria': 'Reunión Ordinaria',
        'reunion_extraordinaria': 'Reunión Extraordinaria'
      }
      return tipos[tipo as keyof typeof tipos] || tipo
    }

    // Función para obtener el nombre del mes
    const getNombreMes = (fecha: Date) => {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
      return meses[fecha.getMonth()]
    }

    // Extraer puntos del orden del día de los apuntes
    const extraerOrdenDelDia = (apuntes: string) => {
      if (!apuntes) return 'No se especificó el orden del día'
      
      // Buscar números seguidos de puntos en los apuntes
      const puntos = apuntes.match(/\d+\.\s*[^.\n]+/g)
      if (puntos && puntos.length > 0) {
        return puntos.join('\n')
      }
      
      // Si no hay números, buscar líneas que parezcan puntos del orden del día
      const lineas = apuntes.split('\n').filter(linea => 
        linea.trim().length > 0 && 
        !linea.trim().startsWith('•') && 
        !linea.trim().startsWith('-')
      )
      
      if (lineas.length > 0) {
        return lineas.slice(0, 5).join('\n') // Máximo 5 puntos
      }
      
      return 'No se especificó el orden del día'
    }

    // Preparar el prompt para la IA con el nuevo modelo
    const prompt = `Eres un secretario experto en redactar actas de reuniones formales siguiendo un modelo específico.

    Basándote en la siguiente información de la reunión, los apuntes tomados y la configuración de la asociación, genera un acta profesional siguiendo EXACTAMENTE este formato:

    INFORMACIÓN DE LA ASOCIACIÓN:
    - Nombre: ${configuracion.nombreAsociacion}
    - Nombre Completo: ${configuracion.nombreCompletoAsociacion}
    - Dirección: ${configuracion.direccionAsociacion}
    - Ubicación: ${configuracion.ubicacionEspecifica}
    - Presidente: ${configuracion.presidente.nombre}
    - Secretario: ${configuracion.secretario.nombre}

    INFORMACIÓN DE LA REUNIÓN:
    - Título: ${acta.titulo}
    - Fecha: ${new Date(acta.fecha).toLocaleDateString('es-CO')}
    - Tipo de Reunión: ${getTipoReunionLegible(acta.tipoReunion)}
    - Lugar: ${acta.lugar}
    - Hora: ${acta.hora}
    - Asistentes: ${acta.asistentes.join(', ')}
    - Descripción: ${acta.reunionId?.descripcion || 'No especificada'}

    APUNTES TOMADOS:
    ${acta.apuntes || 'No se tomaron apuntes específicos'}

    GENERA UN ACTA SIGUIENDO EXACTAMENTE ESTE FORMATO:

    ${configuracion.nombreAsociacion}

    ACTA DE LA ${getTipoReunionLegible(acta.tipoReunion).toUpperCase()}

    En el ${acta.lugar}, la ${configuracion.nombreCompletoAsociacion} ubicado en el ${configuracion.ubicacionEspecifica}, y siendo las ${acta.hora} horas del ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}, debidamente convocados, los socios se reúnen en ${getTipoReunionLegible(acta.tipoReunion)}, respetando el quórum legalmente exigido, con la siguiente,

    COMPOSICIÓN DE LA MESA

    Conforme a las disposiciones legales y estatutarias, actúa como presidente de la Asamblea ${configuracion.presidente.nombre}, presidente de la Asociación, y como secretario a ${configuracion.secretario.nombre}.

    La Asamblea General se reúne con los siguientes,

    SOCIOS ASISTENTES

    Asisten a la ${getTipoReunionLegible(acta.tipoReunion)} un total de ${acta.asistentes.length} socios; se anexa asistencia:
    ${acta.asistentes.join(', ')}

    De acuerdo con la convocatoria efectuada, la ${getTipoReunionLegible(acta.tipoReunion)} tiene como,

    ORDEN DEL DÍA

    ${extraerOrdenDelDia(acta.apuntes)}

    Tras la lectura del Orden del Día, se procede a su tratamiento, dando lugar a la adopción por la Asamblea de las siguientes,

    DELIBERACIONES Y ACUERDOS

    ${acta.apuntes || 'No se tomaron apuntes específicos'}

    No habiendo más asuntos que tratar, se levanta la sesión siendo las ${acta.hora} horas del ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}, citado, de todo lo cual doy fe como secretario y firmo la presente con el presidente.

    ${configuracion.presidente.nombre}                    ${configuracion.secretario.nombre}
    PRESIDENTE                                           SECRETARIO

    INSTRUCCIONES ESPECÍFICAS:
    - Mantén EXACTAMENTE la estructura y formato mostrado
    - Usa la información de la configuración de la asociación
    - Para el ORDEN DEL DÍA, extrae los puntos principales de los apuntes (números seguidos de puntos)
    - En DELIBERACIONES Y ACUERDOS, incluye el desarrollo detallado de cada punto
    - Organiza las deliberaciones de manera clara y cronológica
    - Asegúrate de que todos los acuerdos y decisiones queden claramente documentados
    - Si no hay información específica para alguna sección, indícalo apropiadamente
    - Mantén el lenguaje formal y profesional
    - Respeta la sangría y formato del modelo`
    
    // Llamar a la API de Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Error de Gemini API:', errorData)
      return res.status(500).json({ error: 'Error al generar contenido con IA' })
    }
    
    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return res.status(500).json({ error: 'Respuesta inválida de la IA' })
    }
    
    const actaGenerada = data.candidates[0].content.parts[0].text
    
    // Actualizar la acta con el contenido generado
    const actaActualizada = await (Acta as any).findByIdAndUpdate(
      actaId,
      { 
        actaGenerada,
        estado: 'finalizada'
      },
      { new: true }
    ).exec()
    
    res.status(200).json({
      acta: actaActualizada,
      contenidoGenerado: actaGenerada
    })
    
  } catch (error) {
    console.error('Error al generar acta con IA:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 
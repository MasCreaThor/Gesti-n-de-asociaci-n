import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Acta from '../../../lib/models/Acta'

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
    
    // Preparar el prompt para la IA
    const prompt = `Eres un secretario experto en redactar actas de reuniones. 
    
    Basándote en la siguiente información de la reunión y los apuntes tomados, genera un acta formal y profesional:
    
    INFORMACIÓN DE LA REUNIÓN:
    - Título: ${acta.titulo}
    - Fecha: ${new Date(acta.fecha).toLocaleDateString('es-CO')}
    - Tipo de Reunión: ${acta.tipoReunion}
    - Lugar: ${acta.lugar}
    - Hora: ${acta.hora}
    - Asistentes: ${acta.asistentes.join(', ')}
    - Descripción: ${acta.reunionId?.descripcion || 'No especificada'}
    
    APUNTES TOMADOS:
    ${acta.apuntes || 'No se tomaron apuntes específicos'}
    
    Por favor, genera un acta que incluya:
    1. Encabezado formal con información de la reunión
    2. Lista de asistentes
    3. Orden del día basado en la descripción y apuntes
    4. Desarrollo de los temas discutidos
    5. Acuerdos y decisiones tomadas
    6. Tareas asignadas (si las hay)
    7. Próxima reunión (si se programó)
    8. Firma del secretario
    
    El acta debe ser profesional, clara y estructurada. Usa un lenguaje formal pero accesible.`
    
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
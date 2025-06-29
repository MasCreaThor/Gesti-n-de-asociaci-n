import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../lib/mongodb'
import Reunion from '../../../../lib/models/Reunion'

const ReunionModel: any = Reunion

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Método ${req.method} no permitido` })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de reunión requerido' })
  }

  try {
    await dbConnect()
    
    const reunion = await ReunionModel.findOne({ _id: id }).exec()
    
    if (!reunion) {
      return res.status(404).json({ error: 'Reunión no encontrada' })
    }

    // Formatear la fecha
    const fecha = new Date(reunion.fecha)
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Convertir hora de formato 24h a formato 12h (AM/PM)
    const horaFormateada = convertirHoraA12Horas(reunion.hora)

    // Generar el mensaje para WhatsApp sin emojis para máxima compatibilidad
    let mensaje = `*${getTipoReunion(reunion.tipo)}*\n\n`
    mensaje += `*${reunion.titulo}*\n\n`
    mensaje += `${reunion.descripcion}\n\n`
    mensaje += `Fecha: ${fechaFormateada}\n`
    mensaje += `Hora: ${horaFormateada}\n`
    mensaje += `Lugar: ${reunion.lugar}\n`

    if (reunion.anotaciones && reunion.anotaciones.trim()) {
      mensaje += `\nNota: ${reunion.anotaciones}\n`
    }

    mensaje += `\n---\n`
    mensaje += `*Asociación Domiflaz*\n`
    mensaje += `*Mantente informado de nuestras actividades*`

    // Crear el enlace de WhatsApp
    const mensajeCodificado = encodeURIComponent(mensaje)
    const whatsappLink = `https://wa.me/?text=${mensajeCodificado}`

    res.status(200).json({
      mensaje,
      whatsappLink,
      reunion
    })

  } catch (error) {
    console.error('Error al generar mensaje de WhatsApp:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

function getTipoReunion(tipo: string): string {
  const tipos = {
    'asamblea': 'ASAMBLEA GENERAL',
    'reunion_ordinaria': 'REUNIÓN ORDINARIA',
    'reunion_extraordinaria': 'REUNIÓN EXTRAORDINARIA'
  }
  return tipos[tipo as keyof typeof tipos] || tipo.toUpperCase()
}

function convertirHoraA12Horas(hora24: string): string {
  try {
    // Crear una fecha temporal para usar los métodos de formateo
    const [horas, minutos] = hora24.split(':')
    const fecha = new Date()
    fecha.setHours(parseInt(horas), parseInt(minutos), 0)
    
    // Formatear a 12 horas con AM/PM
    return fecha.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    // Si hay algún error, devolver la hora original
    return hora24
  }
} 
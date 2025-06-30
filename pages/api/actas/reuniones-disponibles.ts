import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Reunion from '../../../lib/models/Reunion'
import Acta from '../../../lib/models/Acta'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    await dbConnect()
    
    const { fecha, tipoReunion } = req.query
    
    // Obtener todas las reuniones
    let filter: any = {}
    
    if (fecha) {
      const fechaInicio = new Date(fecha as string)
      const fechaFin = new Date(fechaInicio)
      fechaFin.setDate(fechaFin.getDate() + 1)
      filter.fecha = {
        $gte: fechaInicio,
        $lt: fechaFin
      }
    }
    
    if (tipoReunion) {
      filter.tipo = { $regex: tipoReunion, $options: 'i' }
    }
    
    const reuniones = await (Reunion as any).find(filter)
      .sort({ fecha: -1 })
      .exec()
    
    // Obtener IDs de reuniones que ya tienen acta
    const actasExistentes = await (Acta as any).find({}, 'reunionId').exec()
    const reunionIdsConActa = actasExistentes.map((acta: any) => acta.reunionId.toString())
    
    // Filtrar reuniones que no tienen acta
    const reunionesDisponibles = reuniones.filter((reunion: any) => 
      !reunionIdsConActa.includes(reunion._id.toString())
    )
    
    res.status(200).json(reunionesDisponibles)
    
  } catch (error) {
    console.error('Error al obtener reuniones disponibles:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Acta from '../../../lib/models/Acta'
import Reunion from '../../../lib/models/Reunion'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await dbConnect()
      
      const { fecha, tipoReunion, estado } = req.query
      
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
        filter.tipoReunion = { $regex: tipoReunion, $options: 'i' }
      }
      
      if (estado) {
        filter.estado = estado
      }
      
      const actas = await (Acta as any).find(filter)
        .populate('reunionId', 'titulo fecha tipoReunion lugar hora')
        .sort({ fecha: -1 })
        .exec()
      
      res.status(200).json(actas)
    } catch (error) {
      console.error('Error al obtener actas:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect()
      
      const { reunionId, apuntes } = req.body
      
      // Verificar que la reunión existe
      const reunion = await (Reunion as any).findById(reunionId).exec()
      if (!reunion) {
        return res.status(404).json({ error: 'Reunión no encontrada' })
      }
      
      // Verificar si ya existe un acta para esta reunión
      const actaExistente = await (Acta as any).findOne({ reunionId }).exec()
      if (actaExistente) {
        return res.status(400).json({ error: 'Ya existe un acta para esta reunión' })
      }
      
      // Crear nueva acta
      const nuevaActa = new (Acta as any)({
        reunionId,
        titulo: reunion.titulo,
        fecha: reunion.fecha,
        tipoReunion: reunion.tipo,
        lugar: reunion.lugar,
        hora: reunion.hora,
        asistentes: reunion.asistentes || [],
        apuntes: apuntes || '',
        estado: 'borrador'
      })
      
      await nuevaActa.save()
      
      res.status(201).json(nuevaActa)
    } catch (error) {
      console.error('Error al crear acta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Acta from '../../../lib/models/Acta'
import Reunion from '../../../lib/models/Reunion'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await dbConnect()
      // Listar todas las actas, incluyendo información de la reunión
      const actas = await (Acta as any).find()
        .populate('reunionId', 'titulo fecha tipo lugar hora asistentes descripcion tipo estado')
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
      if (!reunionId) {
        return res.status(400).json({ error: 'ID de reunión requerido' })
      }
      // Buscar la reunión para poblar los datos del acta
      const reunion = await (Reunion as any).findById(reunionId).exec()
      if (!reunion) {
        return res.status(404).json({ error: 'Reunión no encontrada' })
      }
      // Crear la nueva acta
      const nuevaActa = await (Acta as any).create({
        reunionId: reunion._id,
        titulo: reunion.titulo,
        fecha: reunion.fecha,
        tipoReunion: reunion.tipo,
        lugar: reunion.lugar,
        hora: reunion.hora,
        asistentes: reunion.asistentes || [],
        apuntes: apuntes || '',
        actaGenerada: '',
        estado: 'borrador',
      })
      // Poblar los datos de la reunión en la respuesta
      await nuevaActa.populate('reunionId', 'titulo fecha tipo lugar hora asistentes descripcion tipo estado')
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
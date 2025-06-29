import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Reunion from '../../../lib/models/Reunion'

const ReunionModel: any = Reunion

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await dbConnect()
      
      const reuniones = await ReunionModel.find({})
        .sort({ fecha: 1, hora: 1 })
        .lean()
        .exec()
      
      res.status(200).json(reuniones)
    } catch (error) {
      console.error('Error al obtener reuniones:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect()
      
      const { titulo, descripcion, fecha, hora, lugar, tipo, anotaciones } = req.body
      
      // Validar campos requeridos
      if (!titulo || !descripcion || !fecha || !hora || !lugar || !tipo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos excepto anotaciones' })
      }
      
      // Crear la reunión
      const reunion = new ReunionModel({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha: new Date(fecha),
        hora,
        lugar: lugar.trim(),
        tipo,
        anotaciones: anotaciones?.trim() || '',
        estado: 'programada',
        asistentes: []
      })
      
      await reunion.save()
      
      res.status(201).json(reunion)
    } catch (error) {
      console.error('Error al crear reunión:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ error: `Método ${req.method} no permitido` })
  }
} 
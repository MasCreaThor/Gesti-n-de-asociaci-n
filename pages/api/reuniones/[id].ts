import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Reunion from '../../../lib/models/Reunion'

const ReunionModel: any = Reunion

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de reunión requerido' })
  }

  await dbConnect()

  if (req.method === 'GET') {
    try {
      const reunion = await ReunionModel.findOne({ _id: id }).exec()
      
      if (!reunion) {
        return res.status(404).json({ error: 'Reunión no encontrada' })
      }
      
      res.status(200).json(reunion)
    } catch (error) {
      console.error('Error al obtener reunión:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { titulo, descripcion, fecha, hora, lugar, tipo, anotaciones, estado } = req.body
      
      // Validar campos requeridos
      if (!titulo || !descripcion || !fecha || !hora || !lugar || !tipo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos excepto anotaciones' })
      }
      
      const reunion = await ReunionModel.findOneAndUpdate(
        { _id: id },
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: new Date(fecha),
          hora,
          lugar: lugar.trim(),
          tipo,
          anotaciones: anotaciones?.trim() || '',
          estado: estado || 'programada'
        },
        { new: true, runValidators: true }
      ).exec()
      
      if (!reunion) {
        return res.status(404).json({ error: 'Reunión no encontrada' })
      }
      
      res.status(200).json(reunion)
    } catch (error) {
      console.error('Error al actualizar reunión:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const reunion = await ReunionModel.findOneAndDelete({ _id: id }).exec()
      
      if (!reunion) {
        return res.status(404).json({ error: 'Reunión no encontrada' })
      }
      
      res.status(200).json({ message: 'Reunión eliminada exitosamente' })
    } catch (error) {
      console.error('Error al eliminar reunión:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).json({ error: `Método ${req.method} no permitido` })
  }
} 
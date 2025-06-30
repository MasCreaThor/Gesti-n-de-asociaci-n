import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Acta from '../../../lib/models/Acta'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      await dbConnect()
      
      const acta = await (Acta as any).findById(id)
        .populate('reunionId', 'titulo fecha tipoReunion lugar hora asistentes')
        .exec()
      
      if (!acta) {
        return res.status(404).json({ error: 'Acta no encontrada' })
      }
      
      res.status(200).json(acta)
    } catch (error) {
      console.error('Error al obtener acta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'PUT') {
    try {
      await dbConnect()
      
      const { apuntes, actaGenerada, estado } = req.body
      
      const acta = await (Acta as any).findById(id).exec()
      if (!acta) {
        return res.status(404).json({ error: 'Acta no encontrada' })
      }
      
      const updateData: any = {}
      if (apuntes !== undefined) updateData.apuntes = apuntes
      if (actaGenerada !== undefined) updateData.actaGenerada = actaGenerada
      if (estado !== undefined) updateData.estado = estado
      
      const actaActualizada = await (Acta as any).findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).exec()
      
      res.status(200).json(actaActualizada)
    } catch (error) {
      console.error('Error al actualizar acta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await dbConnect()
      
      const acta = await (Acta as any).findByIdAndDelete(id).exec()
      
      if (!acta) {
        return res.status(404).json({ error: 'Acta no encontrada' })
      }
      
      res.status(200).json({ message: 'Acta eliminada correctamente' })
    } catch (error) {
      console.error('Error al eliminar acta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
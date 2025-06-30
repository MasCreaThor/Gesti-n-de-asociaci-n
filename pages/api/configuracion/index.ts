import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Configuracion from '../../../lib/models/Configuracion'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await dbConnect()
      
      // Obtener la configuración existente o crear una por defecto
      let configuracion = await (Configuracion as any).findOne().exec()
      
      if (!configuracion) {
        // Crear configuración por defecto
        configuracion = new (Configuracion as any)()
        await configuracion.save()
      }
      
      res.status(200).json(configuracion)
    } catch (error) {
      console.error('Error al obtener configuración:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'PUT') {
    try {
      await dbConnect()
      
      const datosConfiguracion = req.body
      
      // Buscar configuración existente o crear nueva
      let configuracion = await (Configuracion as any).findOne().exec()
      
      if (configuracion) {
        // Actualizar configuración existente
        configuracion = await (Configuracion as any).findOneAndUpdate(
          {},
          datosConfiguracion,
          { new: true, upsert: true }
        ).exec()
      } else {
        // Crear nueva configuración
        configuracion = new (Configuracion as any)(datosConfiguracion)
        await configuracion.save()
      }
      
      res.status(200).json(configuracion)
    } catch (error) {
      console.error('Error al actualizar configuración:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
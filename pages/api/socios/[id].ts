import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Socio from '../../../lib/models/Socio'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de socio requerido' })
  }

  try {
    await dbConnect()

    if (req.method === 'PUT') {
      // Actualizar socio
      const {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        fechaNacimiento,
        estado,
        documentoIdentidad,
        documentoPDF,
        observaciones,
      } = req.body

      // Validar campos requeridos
      if (!nombre || !apellido || !fechaNacimiento || !documentoIdentidad) {
        return res.status(400).json({
          message: 'Los campos nombre, apellido, fecha de nacimiento y documento de identidad son requeridos'
        })
      }

      // Preparar operaciones de actualización
      const updateOperations: any = {
        $set: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          fechaNacimiento: new Date(fechaNacimiento),
          estado: estado || 'activo',
          documentoIdentidad: documentoIdentidad.trim(),
        },
        $unset: {}
      }

      // Manejar campos opcionales
      const optionalFields = ['email', 'telefono', 'direccion', 'documentoPDF', 'observaciones']
      
      optionalFields.forEach(field => {
        const value = req.body[field]
        
        if (value === null || value === undefined || value === '') {
          // Si el campo está vacío, lo eliminamos de la base de datos
          updateOperations.$unset[field] = 1
        } else {
          // Si el campo tiene valor, lo actualizamos
          updateOperations.$set[field] = value.trim()
        }
      })

      // Si no hay campos para unset, eliminar la operación
      if (Object.keys(updateOperations.$unset).length === 0) {
        delete updateOperations.$unset
      }

      console.log('Operaciones de actualización:', updateOperations) // Para debugging

      // Actualización normal sin problemas de índice único
      const result = await Socio.updateOne(
        { _id: id },
        updateOperations,
        { runValidators: true }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Socio no encontrado' })
      }

      // Obtener el socio actualizado
      const socioActualizado = await Socio.findById(id)

      if (!socioActualizado) {
        return res.status(404).json({ message: 'Socio no encontrado después de actualizar' })
      }

      console.log('Socio actualizado:', socioActualizado) // Para debugging

      return res.status(200).json({
        message: 'Socio actualizado exitosamente',
        socio: socioActualizado
      })

    } else if (req.method === 'DELETE') {
      // Eliminar socio
      const socioEliminado = await Socio.findByIdAndDelete(id)

      if (!socioEliminado) {
        return res.status(404).json({ message: 'Socio no encontrado' })
      }

      return res.status(200).json({
        message: 'Socio eliminado exitosamente'
      })

    } else {
      return res.status(405).json({ message: 'Método no permitido' })
    }

  } catch (error) {
    console.error('Error en API de socios:', error)
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  }
} 
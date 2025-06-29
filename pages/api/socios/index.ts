import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Socio from '../../../lib/models/Socio'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect()

  switch (req.method) {
    case 'GET':
      try {
        const socios = await (Socio as any).find({}).sort({ createdAt: -1 })
        res.status(200).json(socios)
      } catch (error) {
        console.error('Error fetching socios:', error)
        res.status(500).json({ message: 'Error al obtener socios' })
      }
      break

    case 'POST':
      try {
        const socioData = req.body
        
        // Validar datos requeridos
        if (!socioData.nombre || !socioData.apellido || !socioData.documentoIdentidad || !socioData.fechaNacimiento) {
          return res.status(400).json({ 
            message: 'Nombre, apellido, documento de identidad y fecha de nacimiento son requeridos' 
          })
        }

        // Verificar si el documento de identidad ya existe
        const existingSocioDoc = await (Socio as any).findOne({ documentoIdentidad: socioData.documentoIdentidad })
        if (existingSocioDoc) {
          return res.status(400).json({ 
            message: 'Ya existe un socio con ese documento de identidad' 
          })
        }

        // Verificar si el email ya existe (solo si se proporciona y no está vacío)
        if (socioData.email && socioData.email.trim() !== '') {
          const existingSocioEmail = await (Socio as any).findOne({ email: socioData.email })
          if (existingSocioEmail) {
            return res.status(400).json({ 
              message: 'Ya existe un socio con ese email' 
            })
          }
        }

        // Limpiar datos opcionales - convertir strings vacíos a undefined
        const cleanData = {
          nombre: socioData.nombre.trim(),
          apellido: socioData.apellido.trim(),
          documentoIdentidad: socioData.documentoIdentidad.trim(),
          fechaNacimiento: new Date(socioData.fechaNacimiento),
          estado: 'activo',
          fechaRegistro: new Date(),
          // Campos opcionales - solo incluir si tienen valor
          ...(socioData.email && socioData.email.trim() !== '' && { email: socioData.email.trim() }),
          ...(socioData.telefono && socioData.telefono.trim() !== '' && { telefono: socioData.telefono.trim() }),
          ...(socioData.direccion && socioData.direccion.trim() !== '' && { direccion: socioData.direccion.trim() }),
          ...(socioData.documentoPDF && socioData.documentoPDF.trim() !== '' && { documentoPDF: socioData.documentoPDF }),
          ...(socioData.observaciones && socioData.observaciones.trim() !== '' && { observaciones: socioData.observaciones.trim() }),
        }

        console.log('Datos limpios para crear socio:', cleanData)

        // Crear el socio
        const socio = new Socio(cleanData)
        await socio.save()

        res.status(201).json({
          message: 'Socio creado exitosamente',
          socio: {
            id: socio._id,
            nombre: socio.nombre,
            apellido: socio.apellido,
            email: socio.email,
            estado: socio.estado,
            documentoPDF: socio.documentoPDF,
          },
        })
      } catch (error) {
        console.error('Error creating socio:', error)
        res.status(500).json({ message: 'Error al crear socio' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
      break
  }
} 
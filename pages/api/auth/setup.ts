import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import User from '../../../lib/models/User'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Email, contraseña y nombre son requeridos' 
      })
    }

    // Verificar si ya existe un usuario admin
    const existingUser = await (User as any).findOne({ role: 'admin' })

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario administrador' 
      })
    }

    // Crear el usuario administrador
    const adminUser = new User({
      email,
      password,
      name,
      role: 'admin',
    })

    await adminUser.save()

    res.status(201).json({
      message: 'Usuario administrador creado exitosamente',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
} 
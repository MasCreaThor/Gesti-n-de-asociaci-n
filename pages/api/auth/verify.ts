import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import User from '../../../lib/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    await dbConnect()

    // Buscar usuario en la base de datos
    const user = await (User as any).findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    // Enviar información del usuario
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    res.status(200).json(userResponse)
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({ message: 'Token inválido' })
  }
} 
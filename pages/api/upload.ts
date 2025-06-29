import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { file, fileName } = req.body

    if (!file || !fileName) {
      return res.status(400).json({ message: 'Archivo y nombre requeridos' })
    }

    // Verificar que sea un PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Solo se permiten archivos PDF' })
    }

    // Decodificar el archivo base64
    const base64Data = file.replace(/^data:application\/pdf;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${fileName}`
    const filePath = join(uploadDir, uniqueFileName)

    // Guardar el archivo
    await fs.writeFile(filePath, buffer)

    // Retornar la URL del archivo
    const fileUrl = `/uploads/${uniqueFileName}`

    res.status(200).json({
      message: 'Archivo subido exitosamente',
      fileUrl,
      fileName: uniqueFileName,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ message: 'Error al subir el archivo' })
  }
} 
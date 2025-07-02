import type { NextApiRequest, NextApiResponse } from 'next'
import { bucket } from '../../lib/firebase'
import { v4 as uuidv4 } from 'uuid'

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

    // Nombre único para evitar colisiones
    const uniqueFileName = `${uuidv4()}_${fileName}`
    const fileRef = bucket.file(`socios/pdfs/${uniqueFileName}`)

    // Subir a Firebase Storage
    await fileRef.save(buffer, {
      metadata: {
        contentType: 'application/pdf',
      },
      public: true, // Hace el archivo accesible públicamente
    })

    // Obtener URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/socios/pdfs/${uniqueFileName}`

    res.status(200).json({
      message: 'Archivo subido exitosamente',
      fileUrl: publicUrl,
      fileName: uniqueFileName,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ message: 'Error al subir el archivo' })
  }
} 
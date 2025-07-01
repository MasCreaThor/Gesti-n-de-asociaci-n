import type { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
})

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

    // Subir a Cloudinary
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // Para PDF y otros archivos
          folder: 'asociacion/pdfs',
          public_id: fileName.replace(/\.pdf$/i, ''),
          format: 'pdf',
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      ).end(buffer)
    })

    res.status(200).json({
      message: 'Archivo subido exitosamente',
      fileUrl: uploadResponse.secure_url,
      fileName: uploadResponse.public_id + '.pdf',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ message: 'Error al subir el archivo' })
  }
} 
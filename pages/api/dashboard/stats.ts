import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Socio from '../../../lib/models/Socio'
import Reunion from '../../../lib/models/Reunion'
import Acta from '../../../lib/models/Acta'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    // Obtener estadísticas de socios
    const totalSocios = await Socio.countDocuments()
    const sociosActivos = await Socio.countDocuments({ estado: 'activo' })
    const sociosInactivos = await Socio.countDocuments({ estado: 'inactivo' })

    // Obtener estadísticas de reuniones
    const totalReuniones = await Reunion.countDocuments()
    
    // Reuniones del mes actual
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const reunionesEsteMes = await Reunion.countDocuments({
      fecha: { $gte: inicioMes }
    })

    // Reuniones del mes anterior para comparación
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
    const reunionesMesAnterior = await Reunion.countDocuments({
      fecha: { $gte: inicioMesAnterior, $lte: finMesAnterior }
    })

    // Calcular porcentaje de cambio
    const cambioReuniones = reunionesMesAnterior > 0 
      ? ((reunionesEsteMes - reunionesMesAnterior) / reunionesMesAnterior * 100).toFixed(1)
      : 0

    // Obtener actividad reciente
    const sociosRecientes = await Socio.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('nombre apellido createdAt')

    const reunionesRecientes = await (Reunion as any).find()
      .sort({ fecha: -1 })
      .limit(3)
      .select('titulo fecha')

    const actasRecientes = await (Acta as any).find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('titulo createdAt')

    // Calcular porcentaje de participación (socios activos vs total)
    const porcentajeParticipacion = totalSocios > 0 
      ? Math.round((sociosActivos / totalSocios) * 100)
      : 0

    // Calcular crecimiento de socios (últimos 30 días)
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sociosNuevos30Dias = await Socio.countDocuments({
      createdAt: { $gte: hace30Dias }
    })

    const sociosAntes30Dias = totalSocios - sociosNuevos30Dias
    const crecimientoSocios = sociosAntes30Dias > 0 
      ? ((sociosNuevos30Dias / sociosAntes30Dias) * 100).toFixed(1)
      : sociosNuevos30Dias > 0 ? '100' : '0'

    res.status(200).json({
      stats: {
        totalSocios,
        sociosActivos,
        sociosInactivos,
        totalReuniones,
        reunionesEsteMes,
        reunionesMesAnterior,
        porcentajeParticipacion,
        crecimientoSocios: parseFloat(crecimientoSocios),
        cambioReuniones: parseFloat(cambioReuniones.toString())
      },
      actividad: {
        sociosRecientes: sociosRecientes.map(s => ({
          nombre: `${s.nombre} ${s.apellido}`,
          fecha: s.createdAt,
          tipo: 'nuevo_socio'
        })),
        reunionesRecientes: reunionesRecientes.map(r => ({
          titulo: r.titulo,
          fecha: r.fecha,
          tipo: 'reunion'
        })),
        actasRecientes: actasRecientes.map(a => ({
          titulo: a.titulo,
          fecha: a.createdAt,
          tipo: 'acta'
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' })
  }
} 
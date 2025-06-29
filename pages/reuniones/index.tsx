import React, { useState, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'

interface Reunion {
  _id: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  lugar: string
  tipo: string
  estado: string
}

export default function ReunionesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [reuniones, setReuniones] = useState<Reunion[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadReuniones()
    }
  }, [isAuthenticated])

  const loadReuniones = async () => {
    // Datos de ejemplo
    const mockReuniones: Reunion[] = [
      {
        _id: '1',
        titulo: 'Asamblea General',
        descripcion: 'Reunión mensual de la asociación',
        fecha: '2024-02-15',
        hora: '19:00',
        lugar: 'Sede principal',
        tipo: 'asamblea',
        estado: 'programada',
      },
      {
        _id: '2',
        titulo: 'Reunión de Comité',
        descripcion: 'Planificación de actividades',
        fecha: '2024-02-20',
        hora: '18:00',
        lugar: 'Sala de reuniones',
        tipo: 'reunion_ordinaria',
        estado: 'programada',
      },
    ]
    setReuniones(mockReuniones)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Cargando...
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Gestión de Reuniones</h1>
          <button
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/reuniones/nueva')}
          >
            Nueva Reunión
          </button>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {reuniones.map((reunion) => (
            <div
              key={reunion._id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {reunion.titulo}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    {reunion.descripcion}
                  </p>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>📅 {new Date(reunion.fecha).toLocaleDateString()} a las {reunion.hora}</div>
                    <div>📍 {reunion.lugar}</div>
                    <div style={{ marginTop: '5px' }}>
                      <span
                        style={{
                          backgroundColor: reunion.estado === 'programada' ? '#48bb78' : '#ed8936',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      >
                        {reunion.estado}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    style={{
                      backgroundColor: '#48bb78',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    onClick={() => router.push(`/reuniones/${reunion._id}`)}
                  >
                    Ver
                  </button>
                  <button
                    style={{
                      backgroundColor: '#ed8936',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    onClick={() => router.push(`/reuniones/${reunion._id}/editar`)}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reuniones.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No hay reuniones programadas
          </div>
        )}
      </div>
    </MainLayout>
  )
} 
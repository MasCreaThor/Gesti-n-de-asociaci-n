import React, { useState, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'
import { useTheme } from '../../context/ThemeContext'
import ReunionViewModal from '../../components/ReunionViewModal'
import ReunionEditModal from '../../components/ReunionEditModal'
import ReunionDeleteModal from '../../components/ReunionDeleteModal'

interface Reunion {
  _id: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  lugar: string
  tipo: string
  estado: string
  anotaciones?: string
  createdAt: string
  updatedAt: string
}

export default function ReunionesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [reuniones, setReuniones] = useState<Reunion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Colores para modo oscuro usando el contexto
  const { isDark } = useTheme()
  const bgColor = isDark ? '#2D3748' : 'white'
  const borderColor = isDark ? '#4A5568' : '#E2E8F0'
  const textColor = isDark ? 'white' : '#2D3748'
  const labelColor = isDark ? '#A0AEC0' : '#4A5568'

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
    try {
      setLoading(true)
      const response = await fetch('/api/reuniones')
      if (!response.ok) {
        throw new Error('Error al cargar reuniones')
      }
      const data = await response.json()
      setReuniones(data)
    } catch (error) {
      console.error('Error al cargar reuniones:', error)
      alert('Error al cargar las reuniones')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (reunion: Reunion) => {
    setSelectedReunion(reunion)
    setViewModalOpen(true)
  }

  const handleEdit = (reunion: Reunion) => {
    setSelectedReunion(reunion)
    setViewModalOpen(false)
    setEditModalOpen(true)
  }

  const handleDelete = (reunion: Reunion) => {
    setSelectedReunion(reunion)
    setViewModalOpen(false)
    setDeleteModalOpen(true)
  }

  const handleWhatsApp = async (reunion: Reunion) => {
    try {
      const response = await fetch(`/api/reuniones/${reunion._id}/whatsapp`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Error al generar mensaje de WhatsApp')
      }
      
      const data = await response.json()
      
      // Abrir WhatsApp en nueva pestaña
      window.open(data.whatsappLink, '_blank')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar el mensaje de WhatsApp')
    }
  }

  const handleSaveEdit = async (formData: Partial<Reunion>) => {
    if (!selectedReunion) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/reuniones/${selectedReunion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la reunión')
      }

      await loadReuniones()
      setEditModalOpen(false)
      setSelectedReunion(null)
      alert('Reunión actualizada exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar la reunión')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedReunion) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/reuniones/${selectedReunion._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar la reunión')
      }

      await loadReuniones()
      setDeleteModalOpen(false)
      setSelectedReunion(null)
      alert('Reunión eliminada exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la reunión')
    } finally {
      setActionLoading(false)
    }
  }

  const getTipoReunion = (tipo: string) => {
    const tipos = {
      'asamblea': 'Asamblea General',
      'reunion_ordinaria': 'Reunión Ordinaria',
      'reunion_extraordinaria': 'Reunión Extraordinaria'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const getEstadoReunion = (estado: string) => {
    const estados = {
      'programada': '🟢 Programada',
      'en_curso': '🟡 En Curso',
      'finalizada': '🔵 Finalizada',
      'cancelada': '🔴 Cancelada'
    }
    return estados[estado as keyof typeof estados] || estado
  }

  const convertirHoraA12Horas = (hora24: string): string => {
    try {
      // Crear una fecha temporal para usar los métodos de formateo
      const [horas, minutos] = hora24.split(':')
      const fecha = new Date()
      fecha.setHours(parseInt(horas), parseInt(minutos), 0)
      
      // Formatear a 12 horas con AM/PM
      return fecha.toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      // Si hay algún error, devolver la hora original
      return hora24
    }
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: textColor }}>Gestión de Reuniones</h1>
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
            📅 Nueva Reunión
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: labelColor }}>
            Cargando reuniones...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {reuniones.map((reunion) => (
              <div
                key={reunion._id}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: bgColor,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: textColor }}>
                      {reunion.titulo}
                    </h3>
                    <p style={{ color: labelColor, marginBottom: '10px', lineHeight: '1.4' }}>
                      {reunion.descripcion}
                    </p>
                    <div style={{ fontSize: '14px', color: labelColor }}>
                      <div>📅 {new Date(reunion.fecha).toLocaleDateString()} a las {convertirHoraA12Horas(reunion.hora)}</div>
                      <div>📍 {reunion.lugar}</div>
                      <div>📝 {getTipoReunion(reunion.tipo)}</div>
                      <div style={{ marginTop: '5px' }}>
                        <span
                          style={{
                            backgroundColor: reunion.estado === 'programada' ? '#48bb78' : 
                                           reunion.estado === 'en_curso' ? '#ed8936' :
                                           reunion.estado === 'finalizada' ? '#3182ce' : '#e53e3e',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }}
                        >
                          {getEstadoReunion(reunion.estado)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        backgroundColor: '#25D366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                      onClick={() => handleWhatsApp(reunion)}
                      title="Enviar a WhatsApp"
                    >
                      📱
                    </button>
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
                      onClick={() => handleView(reunion)}
                    >
                      👁️ Ver
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
                      onClick={() => handleEdit(reunion)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      style={{
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                      onClick={() => handleDelete(reunion)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && reuniones.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: labelColor }}>
            No hay reuniones programadas
          </div>
        )}

        {/* Modales */}
        <ReunionViewModal
          reunion={selectedReunion}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setSelectedReunion(null)
          }}
          onEdit={() => handleEdit(selectedReunion!)}
          onDelete={() => handleDelete(selectedReunion!)}
          onWhatsApp={() => handleWhatsApp(selectedReunion!)}
        />

        <ReunionEditModal
          reunion={selectedReunion}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedReunion(null)
          }}
          onSave={handleSaveEdit}
          isLoading={actionLoading}
        />

        <ReunionDeleteModal
          reunion={selectedReunion}
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setSelectedReunion(null)
          }}
          onConfirm={handleConfirmDelete}
          isLoading={actionLoading}
        />
      </div>
    </MainLayout>
  )
} 
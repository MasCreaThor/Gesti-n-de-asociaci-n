import React from 'react'
import { useTheme } from '../context/ThemeContext'

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

interface ReunionViewModalProps {
  reunion: Reunion | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onWhatsApp: () => void
}

export default function ReunionViewModal({
  reunion,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onWhatsApp
}: ReunionViewModalProps) {
  const { isDark } = useTheme()
  
  const bgColor = isDark ? '#2D3748' : 'white'
  const borderColor = isDark ? '#4A5568' : '#E2E8F0'
  const textColor = isDark ? 'white' : '#2D3748'
  const labelColor = isDark ? '#A0AEC0' : '#4A5568'

  if (!isOpen || !reunion) return null

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

  const fecha = new Date(reunion.fecha)
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: bgColor,
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: `1px solid ${borderColor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: textColor }}>
            📋 Detalles de la Reunión
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: labelColor,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: textColor, marginBottom: '10px' }}>
            {reunion.titulo}
          </h3>
          <div style={{ color: labelColor, fontSize: '14px', marginBottom: '15px' }}>
            {getEstadoReunion(reunion.estado)}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', color: labelColor, marginBottom: '5px' }}>
              📅 Fecha y Hora
            </label>
            <div style={{ color: textColor }}>
              {fechaFormateada} a las {convertirHoraA12Horas(reunion.hora)}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', color: labelColor, marginBottom: '5px' }}>
              📍 Lugar
            </label>
            <div style={{ color: textColor }}>
              {reunion.lugar}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', color: labelColor, marginBottom: '5px' }}>
              📝 Tipo de Reunión
            </label>
            <div style={{ color: textColor }}>
              {getTipoReunion(reunion.tipo)}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', color: labelColor, marginBottom: '5px' }}>
              📄 Descripción
            </label>
            <div style={{ color: textColor, lineHeight: '1.5' }}>
              {reunion.descripcion}
            </div>
          </div>

          {reunion.anotaciones && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: labelColor, marginBottom: '5px' }}>
                📌 Anotaciones Adicionales
              </label>
              <div style={{ color: textColor, lineHeight: '1.5' }}>
                {reunion.anotaciones}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={onWhatsApp}
            style={{
              backgroundColor: '#25D366',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            📱 Enviar a WhatsApp
          </button>
          <button
            onClick={onEdit}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ✏️ Editar
          </button>
          <button
            onClick={onDelete}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🗑️ Eliminar
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#666',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
} 
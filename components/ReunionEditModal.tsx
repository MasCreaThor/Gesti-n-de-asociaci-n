import React, { useState, useEffect } from 'react'
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
}

interface ReunionEditModalProps {
  reunion: Reunion | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Reunion>) => void
  isLoading?: boolean
}

export default function ReunionEditModal({
  reunion,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: ReunionEditModalProps) {
  const { isDark } = useTheme()
  
  const bgColor = isDark ? '#2D3748' : 'white'
  const borderColor = isDark ? '#4A5568' : '#E2E8F0'
  const textColor = isDark ? 'white' : '#2D3748'
  const labelColor = isDark ? '#A0AEC0' : '#4A5568'
  const inputBgColor = isDark ? '#4A5568' : 'white'
  const inputBorderColor = isDark ? '#718096' : '#E2E8F0'

  const [formData, setFormData] = useState<Partial<Reunion>>({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    lugar: '',
    tipo: 'reunion_ordinaria',
    estado: 'programada',
    anotaciones: ''
  })

  useEffect(() => {
    if (reunion) {
      const fecha = new Date(reunion.fecha)
      const fechaFormateada = fecha.toISOString().split('T')[0]
      
      setFormData({
        titulo: reunion.titulo,
        descripcion: reunion.descripcion,
        fecha: fechaFormateada,
        hora: reunion.hora,
        lugar: reunion.lugar,
        tipo: reunion.tipo,
        estado: reunion.estado,
        anotaciones: reunion.anotaciones || ''
      })
    }
  }, [reunion])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen || !reunion) return null

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
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: `1px solid ${borderColor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: textColor }}>
            ✏️ Editar Reunión
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Información Básica */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#3182ce' }}>
                Información de la Reunión
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Título *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Asamblea General Mensual"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Descripción detallada de la reunión..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Tipo de Reunión *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                >
                  <option value="reunion_ordinaria">Reunión Ordinaria</option>
                  <option value="asamblea">Asamblea General</option>
                  <option value="reunion_extraordinaria">Reunión Extraordinaria</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                >
                  <option value="programada">🟢 Programada</option>
                  <option value="en_curso">🟡 En Curso</option>
                  <option value="finalizada">🔵 Finalizada</option>
                  <option value="cancelada">🔴 Cancelada</option>
                </select>
              </div>
            </div>

            {/* Fecha y Lugar */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#38a169' }}>
                Fecha y Lugar
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Hora *
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
                  Lugar *
                </label>
                <input
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Sede principal, Sala de reuniones"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: inputBgColor,
                    color: textColor
                  }}
                />
              </div>
            </div>
          </div>

          {/* Anotaciones */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: labelColor }}>
              Anotaciones Adicionales
            </label>
            <textarea
              name="anotaciones"
              value={formData.anotaciones}
              onChange={handleInputChange}
              rows={4}
              placeholder="Información adicional, puntos a tratar, materiales necesarios..."
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                backgroundColor: inputBgColor,
                color: textColor
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                backgroundColor: '#666',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#ccc' : '#38a169',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
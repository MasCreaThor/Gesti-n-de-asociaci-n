import React from 'react'
import { useTheme } from '../context/ThemeContext'

interface ReunionDeleteModalProps {
  reunion: { _id: string; titulo: string } | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export default function ReunionDeleteModal({
  reunion,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: ReunionDeleteModalProps) {
  const { isDark } = useTheme()
  
  const bgColor = isDark ? '#2D3748' : 'white'
  const borderColor = isDark ? '#4A5568' : '#E2E8F0'
  const textColor = isDark ? 'white' : '#2D3748'
  const labelColor = isDark ? '#A0AEC0' : '#4A5568'

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
          maxWidth: '500px',
          width: '90%',
          border: `1px solid ${borderColor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: textColor, marginBottom: '10px' }}>
            Confirmar Eliminación
          </h2>
          <p style={{ color: labelColor, lineHeight: '1.5' }}>
            ¿Estás seguro de que deseas eliminar la reunión:
          </p>
          <p style={{ 
            color: textColor, 
            fontWeight: 'bold', 
            fontSize: '16px', 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: isDark ? '#4A5568' : '#F7FAFC',
            borderRadius: '4px'
          }}>
            "{reunion.titulo}"
          </p>
          <p style={{ color: '#e53e3e', fontSize: '14px', marginTop: '10px' }}>
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
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
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#ccc' : '#e53e3e',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Reunión'}
          </button>
        </div>
      </div>
    </div>
  )
} 
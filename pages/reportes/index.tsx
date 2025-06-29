import React, { useState, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'

interface ReporteStats {
  totalSocios: number
  sociosActivos: number
  sociosInactivos: number
  totalReuniones: number
  reunionesEsteMes: number
  promedioAsistencia: number
  sociosNuevosEsteMes: number
}

export default function ReportesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ReporteStats>({
    totalSocios: 0,
    sociosActivos: 0,
    sociosInactivos: 0,
    totalReuniones: 0,
    reunionesEsteMes: 0,
    promedioAsistencia: 0,
    sociosNuevosEsteMes: 0,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    }
  }, [isAuthenticated])

  const loadStats = async () => {
    // Datos de ejemplo
    setStats({
      totalSocios: 25,
      sociosActivos: 22,
      sociosInactivos: 3,
      totalReuniones: 12,
      reunionesEsteMes: 2,
      promedioAsistencia: 85,
      sociosNuevosEsteMes: 3,
    })
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          Reportes y Estadísticas
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {/* Tarjeta de Socios */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#3182ce' }}>
              👥 Socios
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.totalSocios}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>✅ Activos: {stats.sociosActivos}</div>
              <div>❌ Inactivos: {stats.sociosInactivos}</div>
              <div>🆕 Nuevos este mes: {stats.sociosNuevosEsteMes}</div>
            </div>
          </div>

          {/* Tarjeta de Reuniones */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#38a169' }}>
              📅 Reuniones
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.totalReuniones}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>📊 Total realizadas</div>
              <div>📈 Este mes: {stats.reunionesEsteMes}</div>
            </div>
          </div>

          {/* Tarjeta de Asistencia */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#d69e2e' }}>
              ✅ Asistencia
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.promedioAsistencia}%
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>📊 Promedio general</div>
              <div>🎯 Meta: 90%</div>
            </div>
          </div>
        </div>

        {/* Gráficos y Análisis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Gráfico de Asistencia */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
              Asistencia por Reunión
            </h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '10px', padding: '20px 0' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  backgroundColor: '#3182ce', 
                  width: '30px', 
                  height: '120px',
                  borderRadius: '4px 4px 0 0'
                }}></div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>Ene</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  backgroundColor: '#3182ce', 
                  width: '30px', 
                  height: '150px',
                  borderRadius: '4px 4px 0 0'
                }}></div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>Feb</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  backgroundColor: '#3182ce', 
                  width: '30px', 
                  height: '90px',
                  borderRadius: '4px 4px 0 0'
                }}></div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>Mar</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  backgroundColor: '#3182ce', 
                  width: '30px', 
                  height: '180px',
                  borderRadius: '4px 4px 0 0'
                }}></div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>Abr</div>
              </div>
            </div>
          </div>

          {/* Análisis de Crecimiento */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
              Análisis de Crecimiento
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '4px' }}>
                <span>Nuevos socios este mes:</span>
                <span style={{ fontWeight: 'bold', color: '#38a169' }}>+{stats.sociosNuevosEsteMes}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '4px' }}>
                <span>Reuniones programadas:</span>
                <span style={{ fontWeight: 'bold', color: '#3182ce' }}>{stats.reunionesEsteMes}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '4px' }}>
                <span>Tasa de retención:</span>
                <span style={{ fontWeight: 'bold', color: '#d69e2e' }}>88%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/socios')}
          >
            Ver Socios
          </button>
          <button
            style={{
              backgroundColor: '#38a169',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/reuniones')}
          >
            Ver Reuniones
          </button>
          <button
            style={{
              backgroundColor: '#d69e2e',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => window.print()}
          >
            Exportar Reporte
          </button>
        </div>
      </div>
    </MainLayout>
  )
} 
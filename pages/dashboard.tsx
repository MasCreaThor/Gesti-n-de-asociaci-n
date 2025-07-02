import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import MainLayout from '../components/layout/MainLayout'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

interface DashboardStats {
  totalSocios: number
  sociosActivos: number
  sociosInactivos: number
  totalReuniones: number
  reunionesEsteMes: number
  reunionesMesAnterior: number
  porcentajeParticipacion: number
  crecimientoSocios: number
  cambioReuniones: number
}

interface ActividadItem {
  nombre?: string
  titulo?: string
  fecha: Date
  tipo: 'nuevo_socio' | 'reunion' | 'acta'
}

interface DashboardData {
  stats: DashboardStats
  actividad: {
    sociosRecientes: ActividadItem[]
    reunionesRecientes: ActividadItem[]
    actasRecientes: ActividadItem[]
  }
}

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Colores para modo oscuro
  const cardBg = useColorModeValue('white', 'gray.700')
  const cardBorder = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400')
  const activityBg = useColorModeValue('gray.50', 'gray.600')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Error al cargar las estadísticas')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`
  }

  const getActivityText = (item: ActividadItem) => {
    switch (item.tipo) {
      case 'nuevo_socio':
        return `${item.nombre} se registró ${formatTimeAgo(item.fecha)}`
      case 'reunion':
        return `Reunión: ${item.titulo} - ${new Date(item.fecha).toLocaleDateString('es-CO', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        })}`
      case 'acta':
        return `Acta: ${item.titulo} creada ${formatTimeAgo(item.fecha)}`
      default:
        return 'Actividad reciente'
    }
  }

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'nuevo_socio':
        return '👤'
      case 'reunion':
        return '📅'
      case 'acta':
        return '📄'
      default:
        return '📋'
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Cargando...</Text>
        </Box>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <MainLayout>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Cargando estadísticas...</Text>
        </Box>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Alert status="error" mb={6}>
          <AlertIcon />
          Error al cargar las estadísticas: {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </MainLayout>
    )
  }

  if (!dashboardData) {
    return (
      <MainLayout>
        <Box textAlign="center" py={10}>
          <Text>No se pudieron cargar las estadísticas</Text>
        </Box>
      </MainLayout>
    )
  }

  const { stats, actividad } = dashboardData

  // Combinar toda la actividad reciente y ordenar por fecha
  const actividadReciente = [
    ...actividad.sociosRecientes,
    ...actividad.reunionesRecientes,
    ...actividad.actasRecientes
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)

  return (
    <MainLayout>
      <Box>
        <Heading size="lg" mb={6}>
          Dashboard
        </Heading>
        
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
          <GridItem>
            <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
              <HStack>
                <Box fontSize="2xl" color="#3182CE">👥</Box>
                <Box>
                  <Text fontSize="sm" color={textColor}>Total de Socios</Text>
                  <Text fontSize="2xl" fontWeight="bold">{stats.totalSocios}</Text>
                  <Text fontSize="xs" color={stats.crecimientoSocios >= 0 ? "green.500" : "red.500"}>
                    {stats.crecimientoSocios >= 0 ? '+' : ''}{stats.crecimientoSocios}% este mes
                  </Text>
                </Box>
              </HStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
              <HStack>
                <Box fontSize="2xl" color="#38A169">📈</Box>
                <Box>
                  <Text fontSize="sm" color={textColor}>Socios Activos</Text>
                  <Text fontSize="2xl" fontWeight="bold">{stats.sociosActivos}</Text>
                  <Text fontSize="xs" color="green.500">{stats.porcentajeParticipacion}% de participación</Text>
                </Box>
              </HStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
              <HStack>
                <Box fontSize="2xl" color="#3182CE">📅</Box>
                <Box>
                  <Text fontSize="sm" color={textColor}>Total Reuniones</Text>
                  <Text fontSize="2xl" fontWeight="bold">{stats.totalReuniones}</Text>
                  <Text fontSize="xs" color="blue.500">Este año</Text>
                </Box>
              </HStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
              <HStack>
                <Box fontSize="2xl" color="#805AD5">📄</Box>
                <Box>
                  <Text fontSize="sm" color={textColor}>Reuniones Este Mes</Text>
                  <Text fontSize="2xl" fontWeight="bold">{stats.reunionesEsteMes}</Text>
                  <Text fontSize="xs" color={stats.cambioReuniones >= 0 ? "green.500" : "red.500"}>
                    {stats.cambioReuniones >= 0 ? '+' : ''}{stats.cambioReuniones}% vs mes anterior
                  </Text>
                </Box>
              </HStack>
            </Box>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
              <Heading size="md" mb={4}>
                Actividad Reciente
              </Heading>
              <VStack align="stretch" gap={3}>
                {actividadReciente.length > 0 ? (
                  actividadReciente.map((item, index) => (
                    <Box key={index} p={3} bg={activityBg} borderRadius="md">
                      <HStack>
                        <Text fontSize="lg">{getActivityIcon(item.tipo)}</Text>
                        <Box flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {getActivityText(item)}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))
                ) : (
                  <Text color={mutedTextColor} textAlign="center" py={4}>
                    No hay actividad reciente
                  </Text>
                )}
              </VStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
              <Heading size="md" mb={4}>
                Acciones Rápidas
              </Heading>
              <VStack gap={3}>
                <Button
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/socios/nuevo')}
                >
                  Registrar Nuevo Socio
                </Button>
                <Button
                  colorScheme="green"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/reuniones/nueva')}
                >
                  Crear Reunión
                </Button>
                <Button
                  colorScheme="purple"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/reportes')}
                >
                  Ver Reportes
                </Button>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </MainLayout>
  )
} 
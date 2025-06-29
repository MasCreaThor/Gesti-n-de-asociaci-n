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
} from '@chakra-ui/react'
import MainLayout from '../components/layout/MainLayout'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

interface DashboardStats {
  totalSocios: number
  sociosActivos: number
  totalReuniones: number
  reunionesEsteMes: number
}

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalSocios: 0,
    sociosActivos: 0,
    totalReuniones: 0,
    reunionesEsteMes: 0,
  })

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
    // Aquí cargaríamos las estadísticas desde la API
    // Por ahora usamos datos de ejemplo
    setStats({
      totalSocios: 25,
      sociosActivos: 22,
      totalReuniones: 12,
      reunionesEsteMes: 2,
    })
  }, [])

  if (isLoading) {
    return (
      <MainLayout>
        <Box textAlign="center" py={10}>
          <Text>Cargando...</Text>
        </Box>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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
                  <Text fontSize="xs" color="green.500">+23.36%</Text>
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
                  <Text fontSize="xs" color="green.500">88% de participación</Text>
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
                  <Text fontSize="xs" color="red.500">1 menos que el mes pasado</Text>
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
                <Box p={3} bg={activityBg} borderRadius="md">
                  <Text fontWeight="medium">Nuevo socio registrado</Text>
                  <Text fontSize="sm" color={textColor}>
                    Juan Pérez se registró hace 2 horas
                  </Text>
                </Box>
                <Box p={3} bg={activityBg} borderRadius="md">
                  <Text fontWeight="medium">Reunión programada</Text>
                  <Text fontSize="sm" color={textColor}>
                    Asamblea general el próximo viernes
                  </Text>
                </Box>
                <Box p={3} bg={activityBg} borderRadius="md">
                  <Text fontWeight="medium">Documento actualizado</Text>
                  <Text fontSize="sm" color={textColor}>
                    María García actualizó su documento de identidad
                  </Text>
                </Box>
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
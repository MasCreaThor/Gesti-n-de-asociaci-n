import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Input,
  Textarea,
  Badge,
  Divider,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import MainLayout from '../../components/layout/MainLayout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'
import ActaViewModal from '../../components/ActaViewModal'

interface Reunion {
  _id: string
  titulo: string
  fecha: string
  tipo: string
  lugar: string
  hora: string
  descripcion?: string
  asistentes?: string[]
}

interface Acta {
  _id: string
  reunionId: string
  titulo: string
  fecha: string
  tipoReunion: string
  lugar: string
  hora: string
  apuntes: string
  actaGenerada: string
  estado: 'borrador' | 'finalizada'
  createdAt: string
}

const ActasPage = () => {
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isViewOpen, 
    onOpen: onViewOpen, 
    onClose: onViewClose 
  } = useDisclosure()
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('gray.50', 'gray.700')

  const [reuniones, setReuniones] = useState<Reunion[]>([])
  const [actas, setActas] = useState<Acta[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null)
  
  // Estados para el modal de nueva acta
  const [selectedReunion, setSelectedReunion] = useState<string>('')
  const [apuntes, setApuntes] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  // Función para convertir tipos de reunión a formato legible
  const getTipoReunionLegible = (tipo: string) => {
    const tipos = {
      'asamblea': 'Asamblea',
      'reunion_ordinaria': 'Reunión Ordinaria',
      'reunion_extraordinaria': 'Reunión Extraordinaria'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Cargar datos
  useEffect(() => {
    if (user) {
      cargarReunionesDisponibles()
      cargarActas()
    }
  }, [user])

  const cargarReunionesDisponibles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filtroFecha) params.append('fecha', filtroFecha)
      if (filtroTipo) params.append('tipoReunion', filtroTipo)
      
      const response = await fetch(`/api/actas/reuniones-disponibles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReuniones(data)
      }
    } catch (error) {
      console.error('Error al cargar reuniones:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reuniones',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const cargarActas = async () => {
    try {
      const response = await fetch('/api/actas')
      if (response.ok) {
        const data = await response.json()
        setActas(data)
      }
    } catch (error) {
      console.error('Error al cargar actas:', error)
    }
  }

  const crearActa = async () => {
    if (!selectedReunion) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar una reunión',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/actas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reunionId: selectedReunion,
          apuntes: apuntes
        })
      })

      if (response.ok) {
        const nuevaActa = await response.json()
        setActas(prev => [nuevaActa, ...prev])
        setReuniones(prev => prev.filter(r => r._id !== selectedReunion))
        
        toast({
          title: 'Éxito',
          description: 'Acta creada correctamente',
          status: 'success',
          duration: 3000,
        })
        
        onClose()
        setSelectedReunion('')
        setApuntes('')
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al crear acta',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al crear acta:', error)
      toast({
        title: 'Error',
        description: 'Error al crear acta',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const generarConIA = async (actaId: string) => {
    try {
      setGenerating(true)
      const response = await fetch('/api/actas/generar-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actaId })
      })

      if (response.ok) {
        const { acta } = await response.json()
        setActas(prev => prev.map(a => a._id === actaId ? acta : a))
        
        toast({
          title: 'Éxito',
          description: 'Acta generada con IA correctamente',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al generar con IA',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al generar con IA:', error)
      toast({
        title: 'Error',
        description: 'Error al generar con IA',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setGenerating(false)
    }
  }

  const actualizarApuntes = async (actaId: string, nuevosApuntes: string) => {
    try {
      const response = await fetch(`/api/actas/${actaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apuntes: nuevosApuntes })
      })

      if (response.ok) {
        const actaActualizada = await response.json()
        setActas(prev => prev.map(a => a._id === actaId ? actaActualizada : a))
        
        toast({
          title: 'Éxito',
          description: 'Apuntes actualizados correctamente',
          status: 'success',
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('Error al actualizar apuntes:', error)
    }
  }

  const handleViewActa = (acta: Acta) => {
    setSelectedActa(acta)
    onViewOpen()
  }

  const handleUpdateActa = (actaId: string, actaActualizada: Acta) => {
    setActas(prev => prev.map(a => a._id === actaId ? actaActualizada : a))
  }

  if (!user) {
    return null
  }

  return (
    <MainLayout>
      <Box maxW="container.xl" mx="auto">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              Gestión de Actas
            </Heading>
            <Text color={textColor}>
              Administra las actas de las reuniones de la asociación con ayuda de IA
            </Text>
          </Box>

          {/* Filtros */}
          <Box
            bg={bg}
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <GridItem>
                <Text mb={2} fontWeight="medium">Filtrar por fecha:</Text>
                <Input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  onBlur={cargarReunionesDisponibles}
                />
              </GridItem>
              <GridItem>
                <Text mb={2} fontWeight="medium">Filtrar por tipo:</Text>
                <Input
                  placeholder="Tipo de reunión"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  onBlur={cargarReunionesDisponibles}
                />
              </GridItem>
            </Grid>
          </Box>

          {/* Botón para crear nueva acta */}
          <Box>
            <Button colorScheme="blue" size="lg" onClick={onOpen}>
              Crear Nueva Acta
            </Button>
          </Box>

          {/* Lista de actas existentes */}
          <Box>
            <Heading size="md" mb={4}>
              Actas Existentes ({actas.length})
            </Heading>
            <VStack spacing={4} align="stretch">
              {actas.map((acta) => (
                <Box
                  key={acta._id}
                  bg={bg}
                  p={4}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                  shadow="sm"
                >
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="sm">{acta.titulo}</Heading>
                        <Text fontSize="sm" color={textColor}>
                          {new Date(acta.fecha).toLocaleDateString('es-CO')} - {acta.hora}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {acta.lugar} • {getTipoReunionLegible(acta.tipoReunion)}
                        </Text>
                      </Box>
                      <Badge colorScheme={acta.estado === 'finalizada' ? 'green' : 'yellow'}>
                        {acta.estado === 'finalizada' ? 'Finalizada' : 'Borrador'}
                      </Badge>
                    </HStack>
                    
                    <Divider />
                    
                    <Box>
                      <Text fontWeight="medium" mb={2}>Apuntes:</Text>
                      <Textarea
                        value={acta.apuntes}
                        onChange={(e) => actualizarApuntes(acta._id, e.target.value)}
                        placeholder="Agrega o edita los apuntes de la reunión..."
                        size="sm"
                        rows={3}
                      />
                    </Box>
                    
                    {acta.actaGenerada && (
                      <Box>
                        <Text fontWeight="medium" mb={2}>Acta Generada:</Text>
                        <Box
                          bg={cardBg}
                          p={3}
                          borderRadius="md"
                          maxH="200px"
                          overflowY="auto"
                          fontSize="sm"
                          whiteSpace="pre-wrap"
                          fontFamily="monospace"
                          border="1px"
                          borderColor={borderColor}
                        >
                          {acta.actaGenerada}
                        </Box>
                        <Text fontSize="xs" color={textColor} mt={1}>
                          💡 Haz clic en "Ver Completa" para editar o exportar el acta
                        </Text>
                      </Box>
                    )}
                    
                    <HStack spacing={2}>
                      {!acta.actaGenerada && (
                        <Button
                          size="sm"
                          colorScheme="purple"
                          onClick={() => generarConIA(acta._id)}
                          isLoading={generating}
                          loadingText="Generando..."
                        >
                          Generar con IA
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewActa(acta)}
                      >
                        Ver Completa
                      </Button>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ))}
              
              {actas.length === 0 && (
                <Box
                  bg={bg}
                  p={6}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                  textAlign="center"
                >
                  <Text color={textColor}>No hay actas creadas aún</Text>
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>

        {/* Modal para crear nueva acta */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Crear Nueva Acta</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Box w="full">
                  <Text mb={2} fontWeight="medium">Seleccionar Reunión:</Text>
                  <Select
                    value={selectedReunion}
                    onChange={(e) => setSelectedReunion(e.target.value)}
                    placeholder="Selecciona una reunión"
                  >
                    {reuniones.map((reunion) => (
                      <option key={reunion._id} value={reunion._id}>
                        {reunion.titulo} - {new Date(reunion.fecha).toLocaleDateString('es-CO')} - {getTipoReunionLegible(reunion.tipo)}
                      </option>
                    ))}
                  </Select>
                </Box>
                
                {selectedReunion && (
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">Apuntes de la Reunión:</Text>
                    <Textarea
                      value={apuntes}
                      onChange={(e) => setApuntes(e.target.value)}
                      placeholder="Escribe los apuntes que tomaste durante la reunión. La IA usará esta información para generar el acta formal..."
                      rows={6}
                    />
                    <Text fontSize="sm" color={textColor} mt={2}>
                      💡 Consejo: Incluye los temas discutidos, acuerdos tomados, decisiones importantes y tareas asignadas.
                    </Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={crearActa}
                isLoading={loading}
                loadingText="Creando..."
                isDisabled={!selectedReunion}
              >
                Crear Acta
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para ver acta completa */}
        {selectedActa && (
          <ActaViewModal
            isOpen={isViewOpen}
            onClose={onViewClose}
            acta={selectedActa}
            onUpdate={handleUpdateActa}
          />
        )}
      </Box>
    </MainLayout>
  )
}

export default ActasPage 
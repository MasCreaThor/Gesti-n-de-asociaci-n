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

  FormLabel,
} from '@chakra-ui/react'
import { FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi'
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
  reunionId: {
    _id: string
    titulo: string
    fecha: string
    tipo: string
    lugar: string
    hora: string
  }
  titulo: string
  fecha: string
  tipoReunion: string
  lugar: string
  hora: string
  apuntes: string
  actaGenerada: string
  estructura?: any
  estado: 'borrador' | 'finalizada'
  createdAt: string
  generadaPorIA?: boolean
}

const ActasPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isViewOpen, 
    onOpen: onViewOpen, 
    onClose: onViewClose 
  } = useDisclosure()
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure()
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
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
  const [editingActa, setEditingActa] = useState<Acta | null>(null)
  const [deletingActa, setDeletingActa] = useState<Acta | null>(null)
  
  // Estados para el modal de nueva acta
  const [selectedReunion, setSelectedReunion] = useState<string>('')
  const [apuntes, setApuntes] = useState('')
  const [editApuntes, setEditApuntes] = useState('')
  // Filtros mejorados
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroGeneradaIA, setFiltroGeneradaIA] = useState('')
  const [actasFiltradas, setActasFiltradas] = useState<Acta[]>([])
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    if (!isLoading && !user) {
      if (typeof window !== 'undefined' && typeof (window as any).redirectToLoginWithOriginalPath === 'function') {
        (window as any).redirectToLoginWithOriginalPath()
      } else {
        router.push('/login')
      }
    }
  }, [isLoading, user, router])

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
        aplicarFiltros(data)
      }
    } catch (error) {
      console.error('Error al cargar actas:', error)
    }
  }

  // Función para aplicar filtros
  const aplicarFiltros = (actasData: Acta[] = actas) => {
    let filtradas = [...actasData]

    // Filtro por búsqueda en título
    if (filtroBusqueda) {
      filtradas = filtradas.filter(acta =>
        acta.titulo.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        acta.lugar.toLowerCase().includes(filtroBusqueda.toLowerCase())
      )
    }

    // Filtro por rango de fechas
    if (filtroFecha) {
      const fechaInicio = new Date(filtroFecha)
      fechaInicio.setHours(0, 0, 0, 0)
      filtradas = filtradas.filter(acta => new Date(acta.fecha) >= fechaInicio)
    }

    if (filtroFechaFin) {
      const fechaFin = new Date(filtroFechaFin)
      fechaFin.setHours(23, 59, 59, 999)
      filtradas = filtradas.filter(acta => new Date(acta.fecha) <= fechaFin)
    }

    // Filtro por tipo de reunión
    if (filtroTipo) {
      filtradas = filtradas.filter(acta => acta.tipoReunion === filtroTipo)
    }

    // Filtro por estado
    if (filtroEstado) {
      filtradas = filtradas.filter(acta => acta.estado === filtroEstado)
    }

    // Filtro por acta generada por IA
    if (filtroGeneradaIA === 'con_ia') {
      filtradas = filtradas.filter(acta => acta.actaGenerada && acta.actaGenerada.length > 0)
    } else if (filtroGeneradaIA === 'sin_ia') {
      filtradas = filtradas.filter(acta => !acta.actaGenerada || acta.actaGenerada.length === 0)
    }

    setActasFiltradas(filtradas)
  }

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroFecha('')
    setFiltroFechaFin('')
    setFiltroTipo('')
    setFiltroEstado('')
    setFiltroBusqueda('')
    setFiltroGeneradaIA('')
    setActasFiltradas(actas)
  }

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros()
  }, [filtroBusqueda, filtroFecha, filtroFechaFin, filtroTipo, filtroEstado, filtroGeneradaIA])

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
        const nuevasActas = [nuevaActa, ...actas]
        setActas(nuevasActas)
        aplicarFiltros(nuevasActas)
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
    const actasActualizadas = actas.map(acta => 
      acta._id === actaId ? actaActualizada : acta
    )
    setActas(actasActualizadas)
    aplicarFiltros(actasActualizadas)
  }

  // Función para exportar acta a DOCX
  const exportarDocx = async (actaId: string) => {
    try {
      setExporting(true)
      const response = await fetch('/api/actas/exportar-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actaId })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `acta-${new Date().toISOString().split('T')[0]}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'Éxito',
          description: 'Acta exportada correctamente',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al exportar acta',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al exportar acta:', error)
      toast({
        title: 'Error',
        description: 'Error al exportar acta',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setExporting(false)
    }
  }

  // Función para abrir modal de edición
  const handleEditActa = (acta: Acta) => {
    setEditingActa(acta)
    setEditApuntes(acta.apuntes)
    onEditOpen()
  }

  // Función para guardar cambios de edición
  const guardarEdicion = async () => {
    if (!editingActa) return

    try {
      setSaving(true)
      const response = await fetch(`/api/actas/${editingActa._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apuntes: editApuntes
        })
      })

      if (response.ok) {
        const actaActualizada = await response.json()
        handleUpdateActa(editingActa._id, actaActualizada)
        
        toast({
          title: 'Éxito',
          description: 'Apuntes actualizados correctamente',
          status: 'success',
          duration: 3000,
        })
        
        onEditClose()
        setEditingActa(null)
        setEditApuntes('')
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al actualizar apuntes',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al actualizar apuntes:', error)
      toast({
        title: 'Error',
        description: 'Error al actualizar apuntes',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  // Función para abrir modal de eliminación
  const handleDeleteActa = (acta: Acta) => {
    setDeletingActa(acta)
    onDeleteOpen()
  }

  // Función para confirmar eliminación
  const confirmarEliminacion = async () => {
    if (!deletingActa) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/actas/${deletingActa._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const actasActualizadas = actas.filter(acta => acta._id !== deletingActa._id)
        setActas(actasActualizadas)
        aplicarFiltros(actasActualizadas)
        
        toast({
          title: 'Éxito',
          description: 'Acta eliminada correctamente',
          status: 'success',
          duration: 3000,
        })
        
        onDeleteClose()
        setDeletingActa(null)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al eliminar acta',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al eliminar acta:', error)
      toast({
        title: 'Error',
        description: 'Error al eliminar acta',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setDeleting(false)
    }
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
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <Heading size="md">Filtros de Búsqueda</Heading>
                <Button size="sm" variant="outline" onClick={limpiarFiltros}>
                  Limpiar Filtros
                </Button>
              </HStack>
              
              {/* Búsqueda por texto */}
              <Box>
                <Text mb={2} fontWeight="medium">Buscar por título o lugar:</Text>
                <Input
                  placeholder="Buscar actas..."
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                />
              </Box>
              
              {/* Filtros en grid */}
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
                {/* Rango de fechas */}
                <GridItem>
                  <Text mb={2} fontWeight="medium">Fecha desde:</Text>
                  <Input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                  />
                </GridItem>
                <GridItem>
                  <Text mb={2} fontWeight="medium">Fecha hasta:</Text>
                  <Input
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                  />
                </GridItem>
                
                {/* Tipo de reunión */}
                <GridItem>
                  <Text mb={2} fontWeight="medium">Tipo de reunión:</Text>
                  <Select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    placeholder="Todos los tipos"
                  >
                    <option value="asamblea">Asamblea</option>
                    <option value="reunion_ordinaria">Reunión Ordinaria</option>
                    <option value="reunion_extraordinaria">Reunión Extraordinaria</option>
                  </Select>
                </GridItem>
                
                {/* Estado */}
                <GridItem>
                  <Text mb={2} fontWeight="medium">Estado:</Text>
                  <Select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    placeholder="Todos los estados"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="finalizada">Finalizada</option>
                  </Select>
                </GridItem>
              </Grid>
              
              {/* Filtro por IA */}
              <Box>
                <Text mb={2} fontWeight="medium">Acta generada por IA:</Text>
                <Select
                  value={filtroGeneradaIA}
                  onChange={(e) => setFiltroGeneradaIA(e.target.value)}
                  placeholder="Todas las actas"
                >
                  <option value="con_ia">Con IA generada</option>
                  <option value="sin_ia">Sin IA generada</option>
                </Select>
              </Box>
              
              {/* Resumen de filtros aplicados */}
              {(filtroBusqueda || filtroFecha || filtroFechaFin || filtroTipo || filtroEstado || filtroGeneradaIA) && (
                <Box bg={cardBg} p={3} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Filtros aplicados:</Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {filtroBusqueda && <Badge colorScheme="blue">Búsqueda: "{filtroBusqueda}"</Badge>}
                    {filtroFecha && <Badge colorScheme="green">Desde: {new Date(filtroFecha).toLocaleDateString()}</Badge>}
                    {filtroFechaFin && <Badge colorScheme="green">Hasta: {new Date(filtroFechaFin).toLocaleDateString()}</Badge>}
                    {filtroTipo && <Badge colorScheme="purple">Tipo: {getTipoReunionLegible(filtroTipo)}</Badge>}
                    {filtroEstado && <Badge colorScheme="orange">Estado: {filtroEstado}</Badge>}
                    {filtroGeneradaIA && <Badge colorScheme="teal">IA: {filtroGeneradaIA === 'con_ia' ? 'Generada' : 'No generada'}</Badge>}
                  </HStack>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Botón para crear nueva acta */}
          <Box>
            <Button colorScheme="blue" size="lg" onClick={onOpen}>
              Crear Nueva Acta
            </Button>
          </Box>

          {/* Lista de actas existentes */}
          <Box>
            <HStack justify="space-between" align="center" mb={6}>
              <Box>
                <Heading size="md">
                  Actas Existentes ({actasFiltradas.length} de {actas.length})
                </Heading>
                <Text fontSize="sm" color={textColor} mt={1}>
                  Gestiona y administra todas las actas de reuniones
                </Text>
              </Box>
            </HStack>

            {/* Grid de tarjetas de actas */}
            <Grid 
              templateColumns={{ 
                base: '1fr', 
                md: 'repeat(2, 1fr)', 
                lg: 'repeat(3, 1fr)' 
              }} 
              gap={6}
            >
              {actasFiltradas.map((acta) => (
                <Box
                  key={acta._id}
                  bg={bg}
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                  shadow="lg"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{
                    shadow: 'xl',
                    transform: 'translateY(-2px)',
                    borderColor: 'blue.300'
                  }}
                >
                  {/* Header de la tarjeta */}
                  <Box
                    bg={useColorModeValue(
                      acta.estado === 'finalizada' ? 'green.50' : 'yellow.50',
                      acta.estado === 'finalizada' ? 'green.900' : 'yellow.900'
                    )}
                    p={4}
                    borderBottom="1px"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between" align="start">
                      <Box flex="1">
                        <HStack spacing={2} mb={2}>
                          <Box
                            w={3}
                            h={3}
                            borderRadius="full"
                            bg={acta.estado === 'finalizada' ? 'green.400' : 'yellow.400'}
                          />
                          <Badge 
                            colorScheme={acta.estado === 'finalizada' ? 'green' : 'yellow'}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {acta.estado === 'finalizada' ? 'Finalizada' : 'Borrador'}
                          </Badge>
                          {acta.actaGenerada && (
                            <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                              IA Generada
                            </Badge>
                          )}
                        </HStack>
                        <Heading 
                          size="sm" 
                          mb={2} 
                          lineHeight="1.2"
                          color={useColorModeValue('gray.800', 'white')}
                        >
                          {acta.titulo}
                        </Heading>
                        <VStack spacing={1} align="start">
                          <HStack spacing={2} fontSize="sm" color={useColorModeValue('gray.600', 'green.200')}>
                            <span>📅</span>
                            <Text>{new Date(acta.fecha).toLocaleDateString('es-CO')}</Text>
                          </HStack>
                          <HStack spacing={2} fontSize="sm" color={useColorModeValue('gray.600', 'green.200')}>
                            <span>🕐</span>
                            <Text>{acta.hora}</Text>
                          </HStack>
                          <HStack spacing={2} fontSize="sm" color={useColorModeValue('gray.600', 'green.200')}>
                            <span>📍</span>
                            <Text>{acta.lugar}</Text>
                          </HStack>
                          <HStack spacing={2} fontSize="sm" color={useColorModeValue('gray.600', 'green.200')}>
                            <span>🏢</span>
                            <Text>{getTipoReunionLegible(acta.tipoReunion)}</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </HStack>
                  </Box>

                  {/* Contenido de la tarjeta */}
                  <Box p={4}>
                    {/* Resumen de apuntes */}
                    <Box mb={4}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium" fontSize="sm" color={textColor}>
                          📝 Apuntes
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          {acta.apuntes.length} caracteres
                        </Text>
                      </HStack>
                      <Box
                        bg={cardBg}
                        p={3}
                        borderRadius="md"
                        maxH="100px"
                        overflowY="auto"
                        fontSize="sm"
                        border="1px"
                        borderColor={borderColor}
                      >
                        {acta.apuntes ? (
                          <Text noOfLines={3} color={textColor}>
                            {acta.apuntes}
                          </Text>
                        ) : (
                          <Text color={textColor} fontStyle="italic">
                            Sin apuntes registrados
                          </Text>
                        )}
                      </Box>
                    </Box>

                    {/* Estado de IA */}
                    {acta.actaGenerada && (
                      <Box mb={4}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium" fontSize="sm" color={textColor}>
                            🤖 Acta Generada
                          </Text>
                          <Text fontSize="xs" color="green.500">
                            ✓ Completa
                          </Text>
                        </HStack>
                        <Box
                          bg={useColorModeValue('green.50', 'green.900')}
                          p={3}
                          borderRadius="md"
                          border="1px"
                          borderColor={useColorModeValue('green.200', 'green.700')}
                        >
                          <Text 
                            fontSize="sm" 
                            color={useColorModeValue('green.700', 'green.200')} 
                            noOfLines={2}
                          >
                            Acta generada exitosamente con IA
                          </Text>
                        </Box>
                      </Box>
                    )}

                    {/* Acciones */}
                    <VStack spacing={2} align="stretch">
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="solid"
                          flex="1"
                          onClick={() => handleViewActa(acta)}
                          leftIcon={<span>👁️</span>}
                        >
                          Ver Completa
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="yellow"
                          leftIcon={<span>✏️</span>}
                          onClick={() => handleEditActa(acta)}
                        >
                          Editar
                        </Button>
                      </HStack>

                      <HStack spacing={2}>
                        {!acta.actaGenerada ? (
                          <Button
                            size="sm"
                            colorScheme="purple"
                            variant="outline"
                            flex="1"
                            onClick={() => generarConIA(acta._id)}
                            isLoading={generating}
                            loadingText="Generando..."
                            leftIcon={<span>🤖</span>}
                          >
                            Generar con IA
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<span>📄</span>}
                            onClick={() => exportarDocx(acta._id)}
                            isLoading={exporting}
                            loadingText="Exportando..."
                          >
                            Exportar DOCX
                          </Button>
                        )}
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<span>🗑️</span>}
                          onClick={() => handleDeleteActa(acta)}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              ))}
            </Grid>

            {/* Mensaje cuando no hay actas */}
            {actasFiltradas.length === 0 && (
              <Box
                bg={bg}
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
                textAlign="center"
              >
                <Box fontSize="4xl" mb={4}>📋</Box>
                <Heading size="md" mb={2}>
                  {actas.length === 0 ? 'No hay actas creadas' : 'No se encontraron actas'}
                </Heading>
                <Text color={textColor} mb={4}>
                  {actas.length === 0 
                    ? 'Comienza creando tu primera acta de reunión'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </Text>
                {actas.length === 0 && (
                  <Button colorScheme="blue" onClick={onOpen}>
                    Crear Primera Acta
                  </Button>
                )}
              </Box>
            )}
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

        {/* Modal de Edición de Acta */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Apuntes del Acta</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Reunión: {editingActa?.reunionId?.titulo}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Fecha: {editingActa?.reunionId?.fecha ? new Date(editingActa.reunionId.fecha).toLocaleDateString('es-ES') : 'N/A'}
                  </Text>
                </Box>
                
                <Box>
                  <FormLabel fontWeight="bold">Apuntes de la Reunión</FormLabel>
                  <Textarea
                    value={editApuntes}
                    onChange={(e) => setEditApuntes(e.target.value)}
                    placeholder="Ingrese los apuntes de la reunión..."
                    rows={10}
                    resize="vertical"
                  />
                  <Text fontSize="xs" color={textColor} mt={1}>
                    Los apuntes se usarán para generar el acta final con IA
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={guardarEdicion}
                isLoading={saving}
                loadingText="Guardando..."
              >
                Guardar Cambios
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Confirmación de Eliminación */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirmar Eliminación</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>¡Atención!</AlertTitle>
                    <AlertDescription>
                      ¿Está seguro que desea eliminar el acta de la reunión "{deletingActa?.reunionId?.titulo}"?
                      Esta acción no se puede deshacer.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Box p={4} bg={cardBg} borderRadius="md">
                  <Text fontWeight="bold">Detalles del Acta:</Text>
                  <Text fontSize="sm" mt={1}>
                    <strong>Reunión:</strong> {deletingActa?.reunionId?.titulo}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Fecha:</strong> {deletingActa?.reunionId?.fecha ? new Date(deletingActa.reunionId.fecha).toLocaleDateString('es-ES') : 'N/A'}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Estado:</strong> {deletingActa?.generadaPorIA ? 'Generada por IA' : 'Borrador'}
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmarEliminacion}
                isLoading={deleting}
                loadingText="Eliminando..."
              >
                Eliminar Acta
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </MainLayout>
  )
}

export default ActasPage 
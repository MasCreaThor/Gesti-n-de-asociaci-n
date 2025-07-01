import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Button,
  Text,
  HStack,
  VStack,
  Input,
  Badge,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
} from '@chakra-ui/react'
import MainLayout from '../../components/layout/MainLayout'
import SocioViewModal from '../../components/SocioViewModal'
import SocioEditModal from '../../components/SocioEditModal'
import PDFViewerModal from '../../components/PDFViewerModal'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'

interface Socio {
  _id: string
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  direccion?: string
  fechaNacimiento: string
  fechaRegistro: string
  estado: 'activo' | 'inactivo'
  documentoIdentidad: string
  documentoPDF?: string
  observaciones?: string
}

export default function SociosPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [socios, setSocios] = useState<Socio[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Estados para modales
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [socioToDelete, setSocioToDelete] = useState<Socio | null>(null)
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)
  const [selectedPDFUrl, setSelectedPDFUrl] = useState('')
  const [selectedPDFName, setSelectedPDFName] = useState('')

  // Colores para modo oscuro
  const cardBg = useColorModeValue('white', 'gray.700')
  const cardBorder = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== 'undefined' && typeof (window as any).redirectToLoginWithOriginalPath === 'function') {
        (window as any).redirectToLoginWithOriginalPath()
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadSocios()
    }
  }, [isAuthenticated])

  const loadSocios = async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch('/api/socios')
      const data = await response.json()
      
      if (response.ok) {
        setSocios(data)
      } else {
        toast({
          title: 'Error al cargar socios',
          description: data.message || 'Error desconocido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const filteredSocios = socios.filter(socio =>
    `${socio.nombre} ${socio.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (socio.email && socio.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    socio.documentoIdentidad.includes(searchTerm)
  )

  const handleView = (socio: Socio) => {
    setSelectedSocio(socio)
    setIsViewModalOpen(true)
  }

  const handleEdit = (socio: Socio) => {
    setSelectedSocio(socio)
    setIsEditModalOpen(true)
  }

  const handleDelete = (socio: Socio) => {
    setSocioToDelete(socio)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!socioToDelete) return

    try {
      const response = await fetch(`/api/socios/${socioToDelete._id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSocios(socios.filter(socio => socio._id !== socioToDelete._id))
        toast({
          title: 'Socio eliminado',
          description: 'El socio ha sido eliminado exitosamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Error al eliminar',
          description: data.message || 'Error desconocido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSocioToDelete(null)
    }
  }

  const handleUpdateSuccess = () => {
    loadSocios() // Recargar la lista después de actualizar
  }

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
        <HStack justify="space-between" mb={6}>
          <Heading size="lg">Gestión de Socios</Heading>
          <Button
            colorScheme="brand"
            onClick={() => router.push('/socios/nuevo')}
          >
            ➕ Nuevo Socio
          </Button>
        </HStack>

        <VStack gap={4} align="stretch">
          <Input
            placeholder="Buscar socios por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {isLoadingData ? (
            <Box textAlign="center" py={10}>
              <Text>Cargando socios...</Text>
            </Box>
          ) : (
            <VStack gap={3} align="stretch">
              {filteredSocios.length === 0 ? (
                <Box textAlign="center" py={10} color={mutedTextColor}>
                  <Text>No se encontraron socios</Text>
                </Box>
              ) : (
                filteredSocios.map((socio) => (
                  <Box 
                    key={socio._id} 
                    p={4} 
                    bg={cardBg} 
                    borderRadius="lg" 
                    boxShadow="sm" 
                    border="1px solid" 
                    borderColor={cardBorder}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold">
                          {`${socio.nombre} ${socio.apellido}`}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {socio.email || 'Sin email'}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Tel: {socio.telefono || 'Sin teléfono'}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Doc: {socio.documentoIdentidad}
                        </Text>
                        <HStack>
                          <Badge
                            colorScheme={socio.estado === 'activo' ? 'green' : 'red'}
                          >
                            {socio.estado}
                          </Badge>
                          {socio.documentoPDF && (
                            <Badge colorScheme="blue">
                              📄 PDF
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color={mutedTextColor}>
                          Registro: {new Date(socio.fechaRegistro).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <HStack>
                        <Button size="sm" onClick={() => handleView(socio)}>
                          👁️ Ver
                        </Button>
                        <Button size="sm" colorScheme="blue" onClick={() => handleEdit(socio)}>
                          ✏️ Editar
                        </Button>
                        {socio.documentoPDF && (
                          <Button 
                            size="sm" 
                            colorScheme="purple" 
                            onClick={() => {
                              setSelectedPDFUrl(socio.documentoPDF)
                              setSelectedPDFName(`${socio.nombre}_${socio.apellido}_documento.pdf`)
                              setIsPDFModalOpen(true)
                            }}
                          >
                            📄 PDF
                          </Button>
                        )}
                        <Button size="sm" colorScheme="red" onClick={() => handleDelete(socio)}>
                          🗑️ Eliminar
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          )}
        </VStack>

        {/* Modal para ver socio */}
        <SocioViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedSocio(null)
          }}
          socio={selectedSocio}
        />

        {/* Modal para editar socio */}
        <SocioEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedSocio(null)
          }}
          socio={selectedSocio}
          onUpdate={handleUpdateSuccess}
        />

        {/* Diálogo de confirmación para eliminar */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSocioToDelete(null)
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Eliminar Socio
              </AlertDialogHeader>

              <AlertDialogBody>
                ¿Estás seguro de que quieres eliminar a{' '}
                <strong>{socioToDelete?.nombre} {socioToDelete?.apellido}</strong>?
                Esta acción no se puede deshacer.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSocioToDelete(null)
                }}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
                  </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal para visualizar PDF */}
      <PDFViewerModal
        isOpen={isPDFModalOpen}
        onClose={() => {
          setIsPDFModalOpen(false)
          setSelectedPDFUrl('')
          setSelectedPDFName('')
        }}
        pdfUrl={selectedPDFUrl}
        fileName={selectedPDFName}
      />
    </Box>
  </MainLayout>
)
}
 
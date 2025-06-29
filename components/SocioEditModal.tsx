import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Grid,
  GridItem,
  useToast,
} from '@chakra-ui/react'

interface Socio {
  _id: string
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  direccion?: string
  fechaNacimiento: string
  estado: 'activo' | 'inactivo'
  documentoIdentidad: string
  documentoPDF?: string
  observaciones?: string
}

interface SocioEditModalProps {
  isOpen: boolean
  onClose: () => void
  socio: Socio | null
  onUpdate: () => void
}

export default function SocioEditModal({ isOpen, onClose, socio, onUpdate }: SocioEditModalProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    documentoIdentidad: '',
    observaciones: '',
    estado: 'activo' as 'activo' | 'inactivo',
  })

  // Cargar datos del socio cuando se abre el modal
  useEffect(() => {
    if (socio) {
      setFormData({
        nombre: socio.nombre,
        apellido: socio.apellido,
        email: socio.email || '',
        telefono: socio.telefono || '',
        direccion: socio.direccion || '',
        fechaNacimiento: socio.fechaNacimiento.split('T')[0], // Convertir a formato date
        documentoIdentidad: socio.documentoIdentidad,
        observaciones: socio.observaciones || '',
        estado: socio.estado,
      })
      setSelectedFile(null)
    }
  }, [socio])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Tipo de archivo no válido',
          description: 'Solo se permiten archivos PDF',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: 'Archivo demasiado grande',
          description: 'El archivo no debe superar 10MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      
      // Convertir archivo a base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result)
        }
      })
      reader.readAsDataURL(file)
      const base64Data = await base64Promise

      // Subir archivo
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64Data,
          fileName: file.name,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        return data.fileUrl
      } else {
        toast({
          title: 'Error al subir archivo',
          description: data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return null
      }
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo subir el archivo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!socio) return

    setIsSubmitting(true)

    try {
      let documentoPDFUrl = socio.documentoPDF || ''
      
      // Subir archivo si se seleccionó uno nuevo
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile)
        if (uploadedUrl) {
          documentoPDFUrl = uploadedUrl
        } else {
          setIsSubmitting(false)
          return
        }
      }

      const updateData = {
        ...formData,
        documentoPDF: documentoPDFUrl,
      }

      const response = await fetch(`/api/socios/${socio._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Socio actualizado exitosamente',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        onUpdate()
        onClose()
      } else {
        toast({
          title: 'Error al actualizar socio',
          description: data.message,
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
      setIsSubmitting(false)
    }
  }

  if (!socio) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Editar Socio: {socio.nombre} {socio.apellido}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
            {/* Información Personal */}
            <GridItem>
              <Heading size="md" mb={4} color="brand.600">
                Información Personal
              </Heading>
              
              <VStack gap={4}>
                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Nombre *</Text>
                  <Input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Apellido *</Text>
                  <Input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Fecha de Nacimiento *</Text>
                  <Input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    required
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Documento de Identidad *</Text>
                  <Input
                    type="text"
                    name="documentoIdentidad"
                    value={formData.documentoIdentidad}
                    onChange={handleInputChange}
                    required
                    placeholder="Número de documento"
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Estado</Text>
                  <Input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    placeholder="activo o inactivo"
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Documento PDF (Reemplazar)</Text>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {selectedFile && (
                    <Text fontSize="sm" color="green.600" mt={1}>
                      📄 {selectedFile.name} seleccionado
                    </Text>
                  )}
                  {socio.documentoPDF && !selectedFile && (
                    <Text fontSize="sm" color="blue.600" mt={1}>
                      📄 Documento actual: {socio.documentoPDF.split('/').pop()}
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Máximo 10MB, solo archivos PDF
                  </Text>
                </Box>
              </VStack>
            </GridItem>

            {/* Información de Contacto */}
            <GridItem>
              <Heading size="md" mb={4} color="green.600">
                Información de Contacto
              </Heading>
              
              <VStack gap={4}>
                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Email (Opcional)</Text>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@email.com"
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Teléfono (Opcional)</Text>
                  <Input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Número de teléfono"
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Dirección (Opcional)</Text>
                  <Input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                  />
                </Box>

                <Box w="100%">
                  <Text mb={1} fontWeight="semibold">Observaciones (Opcional)</Text>
                  <Input
                    type="text"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    placeholder="Información adicional"
                  />
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting || isUploading}
            loadingText={isUploading ? "Subiendo archivo..." : "Actualizando..."}
          >
            Actualizar Socio
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 
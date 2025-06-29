import React, { useState } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Container,
  useToast,
  Grid,
  GridItem,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import MainLayout from '../../components/layout/MainLayout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'

interface FormData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  fechaNacimiento: string
  documentoIdentidad: string
  documentoPDF: string
  observaciones: string
}

export default function NuevoSocioPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    documentoIdentidad: '',
    documentoPDF: '',
    observaciones: '',
  })

  // Colores para modo oscuro
  const cardBg = useColorModeValue('white', 'gray.700')
  const cardBorder = useColorModeValue('gray.200', 'gray.600')
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let documentoPDFUrl = ''
      
      // Subir archivo si se seleccionó uno
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile)
        if (uploadedUrl) {
          documentoPDFUrl = uploadedUrl
        } else {
          setIsSubmitting(false)
          return
        }
      }

      const socioData = {
        ...formData,
        documentoPDF: documentoPDFUrl,
      }

      const response = await fetch('/api/socios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socioData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Socio registrado exitosamente',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        router.push('/socios')
      } else {
        toast({
          title: 'Error al registrar socio',
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
      <Container maxW="container.lg" py={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Registrar Nuevo Socio</Heading>
          <Button onClick={() => router.back()}>
            Volver
          </Button>
        </Box>

        <Box p={8} bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={cardBorder}>
          <form onSubmit={handleSubmit}>
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
                    <Text mb={1} fontWeight="semibold">Documento PDF (Opcional)</Text>
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
                    <Text fontSize="xs" color={mutedTextColor} mt={1}>
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

            <Box mt={8} textAlign="center">
              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="full"
                isLoading={isSubmitting || isUploading}
                loadingText={isUploading ? "Subiendo archivo..." : "Registrando socio..."}
              >
                Registrar Socio
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </MainLayout>
  )
} 
import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import MainLayout from '../../components/layout/MainLayout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'

interface Configuracion {
  _id?: string
  // Información básica de la asociación
  nombreAsociacion: string
  nombreCompletoAsociacion: string
  direccionAsociacion: string
  ubicacionEspecifica: string
  
  // Información de contacto
  telefono: string
  email: string
  sitioWeb: string
  
  // Información legal
  nit: string
  numeroRegistro: string
  fechaConstitucion: string
  
  // Cargos de la junta directiva
  presidente: {
    nombre: string
    cedula: string
    telefono: string
    email: string
  }
  secretario: {
    nombre: string
    cedula: string
    telefono: string
    email: string
  }
  tesorero: {
    nombre: string
    cedula: string
    telefono: string
    email: string
  }
  
  // Configuración de actas
  formatoActa: 'modelo_original' | 'modelo_profesional'
  incluirQuorum: boolean
  incluirFirmas: boolean
  incluirAnexos: boolean
  
  // Configuración del sistema
  logoAsociacion: string
  colorPrimario: string
  colorSecundario: string
  
  // Información adicional
  mision: string
  vision: string
  objetivos: string[]
}

const ConfiguracionPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('gray.50', 'gray.700')

  const [configuracion, setConfiguracion] = useState<Configuracion>({
    nombreAsociacion: '',
    nombreCompletoAsociacion: '',
    direccionAsociacion: '',
    ubicacionEspecifica: '',
    telefono: '',
    email: '',
    sitioWeb: '',
    nit: '',
    numeroRegistro: '',
    fechaConstitucion: '',
    presidente: { nombre: '', cedula: '', telefono: '', email: '' },
    secretario: { nombre: '', cedula: '', telefono: '', email: '' },
    tesorero: { nombre: '', cedula: '', telefono: '', email: '' },
    formatoActa: 'modelo_original',
    incluirQuorum: true,
    incluirFirmas: true,
    incluirAnexos: true,
    logoAsociacion: '',
    colorPrimario: '#3182CE',
    colorSecundario: '#2B6CB0',
    mision: '',
    vision: '',
    objetivos: []
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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

  // Cargar configuración
  useEffect(() => {
    if (user) {
      cargarConfiguracion()
    }
  }, [user])

  const cargarConfiguracion = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracion')
      if (response.ok) {
        const data = await response.json()
        setConfiguracion({
          ...data,
          fechaConstitucion: data.fechaConstitucion ? new Date(data.fechaConstitucion).toISOString().split('T')[0] : ''
        })
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const guardarConfiguracion = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuracion)
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Configuración guardada correctamente',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al guardar configuración',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      toast({
        title: 'Error',
        description: 'Error al guardar configuración',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setConfiguracion(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCargoChange = (cargo: string, field: string, value: string) => {
    setConfiguracion(prev => ({
      ...prev,
      [cargo]: {
        ...(prev[cargo as keyof typeof prev] as any),
        [field]: value
      }
    }))
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
              Configuración del Sistema
            </Heading>
            <Text color={textColor}>
              Personaliza la información de la asociación y configuración del sistema
            </Text>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Información importante</AlertTitle>
              <AlertDescription>
                Esta configuración se utilizará automáticamente en la generación de actas y documentos del sistema.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Formulario de configuración */}
          <VStack spacing={6} align="stretch">
            {/* Información básica de la asociación */}
            <Card bg={bg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Información Básica de la Asociación</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Nombre de la Asociación (MAYÚSCULAS)</FormLabel>
                      <Input
                        value={configuracion.nombreAsociacion}
                        onChange={(e) => handleInputChange('nombreAsociacion', e.target.value)}
                        placeholder="ASOCIACIÓN DE LA COMUNIDAD"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Nombre Completo de la Asociación</FormLabel>
                      <Input
                        value={configuracion.nombreCompletoAsociacion}
                        onChange={(e) => handleInputChange('nombreCompletoAsociacion', e.target.value)}
                        placeholder="Asociación de la Comunidad"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Dirección de la Asociación</FormLabel>
                      <Input
                        value={configuracion.direccionAsociacion}
                        onChange={(e) => handleInputChange('direccionAsociacion', e.target.value)}
                        placeholder="Dirección completa"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Ubicación Específica</FormLabel>
                      <Input
                        value={configuracion.ubicacionEspecifica}
                        onChange={(e) => handleInputChange('ubicacionEspecifica', e.target.value)}
                        placeholder="Ej: auditorio municipal de Villagarzón"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Información de contacto */}
            <Card bg={bg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Información de Contacto</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Teléfono</FormLabel>
                      <Input
                        value={configuracion.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        placeholder="Teléfono de contacto"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={configuracion.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Email de contacto"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Sitio Web</FormLabel>
                      <Input
                        value={configuracion.sitioWeb}
                        onChange={(e) => handleInputChange('sitioWeb', e.target.value)}
                        placeholder="https://www.asociacion.com"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Información legal */}
            <Card bg={bg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Información Legal</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>NIT</FormLabel>
                      <Input
                        value={configuracion.nit}
                        onChange={(e) => handleInputChange('nit', e.target.value)}
                        placeholder="Número de identificación tributaria"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Número de Registro</FormLabel>
                      <Input
                        value={configuracion.numeroRegistro}
                        onChange={(e) => handleInputChange('numeroRegistro', e.target.value)}
                        placeholder="Número de registro legal"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Fecha de Constitución</FormLabel>
                      <Input
                        type="date"
                        value={configuracion.fechaConstitucion}
                        onChange={(e) => handleInputChange('fechaConstitucion', e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Junta Directiva */}
            <Card bg={bg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Junta Directiva</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {/* Presidente */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>Presidente</Text>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>Nombre Completo</FormLabel>
                          <Input
                            value={configuracion.presidente.nombre}
                            onChange={(e) => handleCargoChange('presidente', 'nombre', e.target.value)}
                            placeholder="Nombre del presidente"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Cédula</FormLabel>
                          <Input
                            value={configuracion.presidente.cedula}
                            onChange={(e) => handleCargoChange('presidente', 'cedula', e.target.value)}
                            placeholder="Número de cédula"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Teléfono</FormLabel>
                          <Input
                            value={configuracion.presidente.telefono}
                            onChange={(e) => handleCargoChange('presidente', 'telefono', e.target.value)}
                            placeholder="Teléfono"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={configuracion.presidente.email}
                            onChange={(e) => handleCargoChange('presidente', 'email', e.target.value)}
                            placeholder="Email"
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Secretario */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>Secretario</Text>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>Nombre Completo</FormLabel>
                          <Input
                            value={configuracion.secretario.nombre}
                            onChange={(e) => handleCargoChange('secretario', 'nombre', e.target.value)}
                            placeholder="Nombre del secretario"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Cédula</FormLabel>
                          <Input
                            value={configuracion.secretario.cedula}
                            onChange={(e) => handleCargoChange('secretario', 'cedula', e.target.value)}
                            placeholder="Número de cédula"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Teléfono</FormLabel>
                          <Input
                            value={configuracion.secretario.telefono}
                            onChange={(e) => handleCargoChange('secretario', 'telefono', e.target.value)}
                            placeholder="Teléfono"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={configuracion.secretario.email}
                            onChange={(e) => handleCargoChange('secretario', 'email', e.target.value)}
                            placeholder="Email"
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Tesorero */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>Tesorero</Text>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Nombre Completo</FormLabel>
                          <Input
                            value={configuracion.tesorero.nombre}
                            onChange={(e) => handleCargoChange('tesorero', 'nombre', e.target.value)}
                            placeholder="Nombre del tesorero"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Cédula</FormLabel>
                          <Input
                            value={configuracion.tesorero.cedula}
                            onChange={(e) => handleCargoChange('tesorero', 'cedula', e.target.value)}
                            placeholder="Número de cédula"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Teléfono</FormLabel>
                          <Input
                            value={configuracion.tesorero.telefono}
                            onChange={(e) => handleCargoChange('tesorero', 'telefono', e.target.value)}
                            placeholder="Teléfono"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={configuracion.tesorero.email}
                            onChange={(e) => handleCargoChange('tesorero', 'email', e.target.value)}
                            placeholder="Email"
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Configuración de actas */}
            <Card bg={bg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Configuración de Actas</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Formato de Acta</FormLabel>
                    <Select
                      value={configuracion.formatoActa}
                      onChange={(e) => handleInputChange('formatoActa', e.target.value)}
                    >
                      <option value="modelo_original">Modelo Original (Formato Profesional)</option>
                      <option value="modelo_profesional">Modelo Profesional (Formato Estructurado)</option>
                    </Select>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Incluir Verificación de Quórum</FormLabel>
                    <Switch
                      isChecked={configuracion.incluirQuorum}
                      onChange={(e) => handleInputChange('incluirQuorum', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Incluir Espacios para Firmas</FormLabel>
                    <Switch
                      isChecked={configuracion.incluirFirmas}
                      onChange={(e) => handleInputChange('incluirFirmas', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Incluir Sección de Anexos</FormLabel>
                    <Switch
                      isChecked={configuracion.incluirAnexos}
                      onChange={(e) => handleInputChange('incluirAnexos', e.target.checked)}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Información adicional */}
            <Card bg={bg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Información Adicional</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Misión</FormLabel>
                    <Textarea
                      value={configuracion.mision}
                      onChange={(e) => handleInputChange('mision', e.target.value)}
                      placeholder="Misión de la asociación"
                      rows={3}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Visión</FormLabel>
                    <Textarea
                      value={configuracion.vision}
                      onChange={(e) => handleInputChange('vision', e.target.value)}
                      placeholder="Visión de la asociación"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Botones de acción */}
          <HStack spacing={4} justify="center">
            <Button
              colorScheme="blue"
              size="lg"
              onClick={guardarConfiguracion}
              isLoading={saving}
              loadingText="Guardando..."
            >
              Guardar Configuración
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={cargarConfiguracion}
              isLoading={loading}
              loadingText="Cargando..."
            >
              Recargar
            </Button>
          </HStack>
        </VStack>
      </Box>
    </MainLayout>
  )
}

export default ConfiguracionPage 
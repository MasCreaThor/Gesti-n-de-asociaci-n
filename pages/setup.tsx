import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Container,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Configuración exitosa',
          description: 'Usuario administrador creado correctamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        setIsCompleted(true)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Error al crear el usuario',
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
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <Container maxW="container.sm" py={10}>
        <Box textAlign="center">
          <Heading size="lg" color="green.600" mb={4}>
            ✅ Configuración Completada
          </Heading>
          <Text mb={6}>
            El usuario administrador ha sido creado exitosamente.
          </Text>
          <Button
            colorScheme="brand"
            size="lg"
            onClick={() => router.push('/login')}
          >
            Ir al Login
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.sm" py={10}>
      <Box textAlign="center" mb={8}>
        <Heading size="lg" color="brand.600">
          Configuración Inicial
        </Heading>
        <Text color="gray.600" mt={2}>
          Crea el primer usuario administrador
        </Text>
      </Box>

      <Box p={8} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <Box w="100%">
              <Text mb={1} fontWeight="semibold">Nombre Completo</Text>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Administrador Principal"
                required
              />
            </Box>

            <Box w="100%">
              <Text mb={1} fontWeight="semibold">Correo Electrónico</Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@asociacion.com"
                required
              />
            </Box>

            <Box w="100%">
              <Text mb={1} fontWeight="semibold">Contraseña</Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña segura"
                required
                minLength={6}
              />
            </Box>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Creando administrador..."
            >
              Crear Usuario Administrador
            </Button>
          </VStack>
        </form>
      </Box>

      <Box mt={6} p={4} bg="blue.50" borderRadius="md">
        <Text fontSize="sm" color="blue.700">
          <strong>Nota:</strong> Esta página solo se puede usar una vez para crear el primer usuario administrador. 
          Una vez creado, no podrás acceder a esta página nuevamente.
        </Text>
      </Box>
    </Container>
  )
} 
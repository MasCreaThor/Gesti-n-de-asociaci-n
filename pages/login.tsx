import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Container,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    try {
      const success = await login(email, password)
      if (success) {
        setMessage({ type: 'success', text: 'Inicio de sesión exitoso' })
      } else {
        setMessage({ type: 'error', text: 'Credenciales incorrectas' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocurrió un error durante el inicio de sesión' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <Box textAlign="center" mb={8}>
        <Heading size="lg" color="brand.600">
          Sistema de Gestión de Asociación
        </Heading>
        <Text color="gray.600" mt={2}>
          Inicia sesión para continuar
        </Text>
      </Box>

      <Box p={8} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
        {message && (
          <Box mb={4} color={message.type === 'success' ? 'green.600' : 'red.600'} fontWeight="bold" textAlign="center">
            {message.text}
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
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
                placeholder="Ingresa tu contraseña"
                required
              />
            </Box>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Iniciando sesión..."
            >
              Iniciar Sesión
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  )
} 
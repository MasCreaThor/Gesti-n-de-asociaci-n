import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import MainLayout from '../components/layout/MainLayout'
import { useAuth } from '../context/AuthContext'

export default function PDFViewerPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const toast = useToast()
  const [isPdfLoading, setIsPdfLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { url, fileName } = router.query

  useEffect(() => {
    if (url && typeof url === 'string') {
      setIsPdfLoading(false)
    }
  }, [url])

  const handleDownload = () => {
    if (url && typeof url === 'string') {
      const link = document.createElement('a')
      link.href = url
      link.download = (fileName as string) || 'documento.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <MainLayout>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Cargando visualizador...</Text>
        </Box>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!url || typeof url !== 'string') {
    return (
      <MainLayout>
        <Container maxW="container.md" py={8}>
          <VStack spacing={6}>
            <Heading>Error</Heading>
            <Text>No se proporcionó una URL válida para el PDF.</Text>
            <Button onClick={handleBack}>Volver</Button>
          </VStack>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="lg">Visualizador de PDF</Heading>
                {fileName && (
                  <Text color="gray.600" fontSize="sm">
                    Archivo: {fileName}
                  </Text>
                )}
              </VStack>
              <HStack spacing={3}>
                <Button colorScheme="green" onClick={handleDownload}>
                  ⬇️ Descargar
                </Button>
                <Button variant="outline" onClick={handleBack}>
                  ← Volver
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* PDF Viewer */}
          <Box
            w="full"
            h="80vh"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
          >
            <iframe
              src={url}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="PDF Viewer"
              onLoad={() => setIsPdfLoading(false)}
              onError={() => {
                setError('No se pudo cargar el PDF')
                setIsPdfLoading(false)
              }}
            />
          </Box>

          {/* Error Message */}
          {error && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              p={4}
              textAlign="center"
            >
              <Text color="red.600" fontWeight="semibold">
                {error}
              </Text>
              <Text fontSize="sm" color="red.500" mt={2}>
                Intenta descargar el archivo o abrirlo en una nueva pestaña.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </MainLayout>
  )
} 
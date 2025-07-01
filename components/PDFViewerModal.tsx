import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

interface PDFViewerModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  fileName?: string
}

export default function PDFViewerModal({ isOpen, onClose, pdfUrl, fileName }: PDFViewerModalProps) {
  const toast = useToast()
  const router = useRouter()

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName || 'documento.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank')
  }

  const handleOpenInApp = () => {
    const viewerUrl = `/pdf-viewer?url=${encodeURIComponent(pdfUrl)}&fileName=${encodeURIComponent(fileName || 'documento.pdf')}`
    router.push(viewerUrl)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalHeader>
          <HStack justify="space-between" w="full">
            <Text>Visualizador de PDF</Text>
            <HStack spacing={2}>
              <Button size="sm" colorScheme="blue" onClick={handleOpenInNewTab}>
                Abrir en Nueva Pestaña
              </Button>
              <Button size="sm" colorScheme="green" onClick={handleDownload}>
                Descargar
              </Button>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Box 
            w="full" 
            h="70vh" 
            border="1px solid" 
            borderColor="gray.200" 
            borderRadius="md"
            overflow="hidden"
            bg="gray.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            p={8}
          >
            <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
              📄 Documento PDF
            </Text>
            <Text mb={6} textAlign="center" color="gray.600">
              Selecciona cómo quieres ver el documento
            </Text>
            <VStack spacing={4} w="full" maxW="400px">
              <Button 
                colorScheme="purple" 
                size="lg" 
                w="full"
                onClick={handleOpenInApp}
                leftIcon={<span>👁️</span>}
              >
                Ver en la Aplicación
              </Button>
              <Button 
                colorScheme="blue" 
                size="lg" 
                w="full"
                onClick={handleOpenInNewTab}
                leftIcon={<span>🔗</span>}
              >
                Abrir en Nueva Pestaña
              </Button>
              <Button 
                colorScheme="green" 
                size="lg" 
                w="full"
                onClick={handleDownload}
                leftIcon={<span>⬇️</span>}
              >
                Descargar Archivo
              </Button>
            </VStack>
            <Text fontSize="sm" color="gray.500" mt={6} textAlign="center">
              Archivo: {fileName}
            </Text>
            <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
              El PDF se abrirá directamente desde Cloudinary
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 
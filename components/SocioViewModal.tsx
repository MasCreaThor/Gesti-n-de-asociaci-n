import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Divider,
} from '@chakra-ui/react'
import PDFViewerModal from './PDFViewerModal'

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

interface SocioViewModalProps {
  isOpen: boolean
  onClose: () => void
  socio: Socio | null
}

export default function SocioViewModal({ isOpen, onClose, socio }: SocioViewModalProps) {
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)

  if (!socio) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Información del Socio
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Información Personal */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={3} color="brand.600">
                Información Personal
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Nombre Completo:</Text>
                  <Text>{`${socio.nombre} ${socio.apellido}`}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Documento de Identidad:</Text>
                  <Text>{socio.documentoIdentidad}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Fecha de Nacimiento:</Text>
                  <Text>{new Date(socio.fechaNacimiento).toLocaleDateString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Estado:</Text>
                  <Badge colorScheme={socio.estado === 'activo' ? 'green' : 'red'}>
                    {socio.estado}
                  </Badge>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Información de Contacto */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={3} color="green.600">
                Información de Contacto
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Email:</Text>
                  <Text>{socio.email || 'No registrado'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Teléfono:</Text>
                  <Text>{socio.telefono || 'No registrado'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Dirección:</Text>
                  <Text>{socio.direccion || 'No registrada'}</Text>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Documento PDF */}
            {socio.documentoPDF && (
              <>
                <Box>
                  <Text fontWeight="bold" fontSize="lg" mb={3} color="purple.600">
                    Documento PDF
                  </Text>
                  <Button
                    colorScheme="purple"
                    size="sm"
                    onClick={() => setIsPDFModalOpen(true)}
                    leftIcon={<span>📄</span>}
                  >
                    Ver Documento PDF
                  </Button>
                </Box>
                <Divider />
              </>
            )}

            {/* Información Adicional */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={3} color="gray.600">
                Información Adicional
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Fecha de Registro:</Text>
                  <Text>{new Date(socio.fechaRegistro).toLocaleDateString()}</Text>
                </HStack>
                {socio.observaciones && (
                  <Box>
                    <Text fontWeight="semibold" mb={1}>Observaciones:</Text>
                    <Text fontSize="sm" color="gray.600" bg="gray.50" p={2} borderRadius="md">
                      {socio.observaciones}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
      
      {/* Modal para visualizar PDF */}
      <PDFViewerModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        pdfUrl={socio.documentoPDF}
        fileName={`${socio.nombre}_${socio.apellido}_documento.pdf`}
      />
    </Modal>
  )
} 
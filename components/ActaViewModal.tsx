import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Textarea,
  Badge,
  useColorModeValue,
  useToast,
  Divider,
} from '@chakra-ui/react'

interface ActaViewModalProps {
  isOpen: boolean
  onClose: () => void
  acta: any
  onUpdate: (actaId: string, data: any) => void
}

const ActaViewModal = ({ isOpen, onClose, acta, onUpdate }: ActaViewModalProps) => {
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedActa, setEditedActa] = useState('')
  const [saving, setSaving] = useState(false)
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('gray.50', 'gray.700')

  React.useEffect(() => {
    if (acta) {
      setEditedActa(acta.actaGenerada || '')
    }
  }, [acta])

  const handleSave = async () => {
    if (!acta) return

    try {
      setSaving(true)
      const response = await fetch(`/api/actas/${acta._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actaGenerada: editedActa })
      })

      if (response.ok) {
        const actaActualizada = await response.json()
        onUpdate(acta._id, actaActualizada)
        setIsEditing(false)
        
        toast({
          title: 'Éxito',
          description: 'Acta actualizada correctamente',
          status: 'success',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al actualizar acta:', error)
      toast({
        title: 'Error',
        description: 'Error al actualizar acta',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    if (!acta) return

    const contenido = `
ACTA DE REUNIÓN

${acta.titulo}
Fecha: ${new Date(acta.fecha).toLocaleDateString('es-CO')}
Hora: ${acta.hora}
Lugar: ${acta.lugar}
Tipo de Reunión: ${acta.tipoReunion}

${acta.actaGenerada}

---
Generado el: ${new Date().toLocaleDateString('es-CO')}
    `.trim()

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acta-${acta.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date(acta.fecha).toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Éxito',
      description: 'Acta exportada correctamente',
      status: 'success',
      duration: 3000,
    })
  }

  if (!acta) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="lg" fontWeight="bold">{acta.titulo}</Text>
            <HStack spacing={4}>
              <Text fontSize="sm" color={textColor}>
                {new Date(acta.fecha).toLocaleDateString('es-CO')} - {acta.hora}
              </Text>
              <Text fontSize="sm" color={textColor}>
                {acta.lugar} • {acta.tipoReunion}
              </Text>
              <Badge colorScheme={acta.estado === 'finalizada' ? 'green' : 'yellow'}>
                {acta.estado === 'finalizada' ? 'Finalizada' : 'Borrador'}
              </Badge>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Información de la reunión */}
            <Box
              bg={cardBg}
              p={4}
              borderRadius="md"
              border="1px"
              borderColor={borderColor}
            >
              <Text fontWeight="medium" mb={2}>Información de la Reunión:</Text>
              <VStack spacing={2} align="stretch" fontSize="sm">
                <Text><strong>Título:</strong> {acta.titulo}</Text>
                <Text><strong>Fecha:</strong> {new Date(acta.fecha).toLocaleDateString('es-CO')}</Text>
                <Text><strong>Hora:</strong> {acta.hora}</Text>
                <Text><strong>Lugar:</strong> {acta.lugar}</Text>
                <Text><strong>Tipo:</strong> {acta.tipoReunion}</Text>
                {acta.asistentes && acta.asistentes.length > 0 && (
                  <Text><strong>Asistentes:</strong> {acta.asistentes.join(', ')}</Text>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Apuntes */}
            <Box>
              <Text fontWeight="medium" mb={2}>Apuntes Originales:</Text>
              <Box
                bg={cardBg}
                p={3}
                borderRadius="md"
                fontSize="sm"
                whiteSpace="pre-wrap"
                maxH="150px"
                overflowY="auto"
              >
                {acta.apuntes || 'No se tomaron apuntes específicos'}
              </Box>
            </Box>

            <Divider />

            {/* Acta generada */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="medium">Acta Generada:</Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </HStack>
              
              {isEditing ? (
                <Textarea
                  value={editedActa}
                  onChange={(e) => setEditedActa(e.target.value)}
                  rows={15}
                  fontSize="sm"
                />
              ) : (
                <Box
                  bg={cardBg}
                  p={4}
                  borderRadius="md"
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                  maxH="400px"
                  overflowY="auto"
                  border="1px"
                  borderColor={borderColor}
                >
                  {acta.actaGenerada || 'No se ha generado el acta aún'}
                </Box>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
            {isEditing && (
              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={saving}
                loadingText="Guardando..."
              >
                Guardar Cambios
              </Button>
            )}
            {acta.actaGenerada && (
              <Button
                colorScheme="green"
                onClick={handleExport}
              >
                Exportar
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ActaViewModal 
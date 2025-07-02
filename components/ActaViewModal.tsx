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
  Heading,
  Input,
  Textarea as ChakraTextarea,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

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
  const [exporting, setExporting] = useState(false)
  const [mostrarFormatoLimpio, setMostrarFormatoLimpio] = useState(false)
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('gray.50', 'gray.700')
  const headingColor = useColorModeValue('gray.800', 'white')

  // Configurar el editor TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Underline,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        'data-placeholder': 'Escribe aquí el contenido del acta...',
      },
    },
    onUpdate: ({ editor }) => {
      // Actualizar el contenido cuando cambie
      setEditedActa(editor.getHTML())
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  React.useEffect(() => {
    if (acta && editor) {
      // Convertir HTML a contenido del editor preservando formato
      const contenido = acta.actaGenerada || ''
      
      // Si el contenido está vacío, crear estructura básica
      if (!contenido.trim()) {
        const estructuraBasica = `
          <h1 style="text-align: center"><strong>ASOCIACIÓN DE TRABAJADORES INDEPENDIENTES DOMIFLAZHVILLA</strong></h1>
          <h1 style="text-align: center"><strong>ACTA DE REUNIÓN</strong></h1>
          <p style="text-align: center"><strong>COMPOSICIÓN DE LA MESA:</strong></p>
          <p style="text-align: center"><strong>ORDEN DEL DÍA:</strong></p>
          <p style="text-align: center"><strong>DELIBERACIONES Y ACUERDOS:</strong></p>
        `
        editor.commands.setContent(estructuraBasica)
        setEditedActa(estructuraBasica)
      } else {
        // Convertir el formato HTML para que sea compatible con TipTap
        const contenidoConvertido = contenido
          .replace(/<p[^>]*align="center"[^>]*>/g, '<p style="text-align: center">')
          .replace(/<p[^>]*align="right"[^>]*>/g, '<p style="text-align: right">')
          .replace(/<p[^>]*align="left"[^>]*>/g, '<p style="text-align: left">')
          .replace(/<h1[^>]*>/g, '<h1 style="text-align: center">')
          .replace(/<h2[^>]*>/g, '<h2 style="text-align: center">')
          .replace(/<h3[^>]*>/g, '<h3>')
        
        editor.commands.setContent(contenidoConvertido)
        setEditedActa(contenidoConvertido)
      }
    }
  }, [acta, editor])

  // Función para limpiar HTML y formatear el texto
  const limpiarYFormatearTexto = (htmlText: string) => {
    if (!htmlText) return ''
    
    // Crear un elemento temporal para parsear el HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlText
    
    // Obtener el texto limpio
    let textoLimpio = tempDiv.textContent || tempDiv.innerText || ''
    
    // Limpiar espacios extra y saltos de línea
    textoLimpio = textoLimpio
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
      .replace(/\n\s*\n/g, '\n\n') // Reemplazar múltiples saltos de línea con dos
      .trim()
    
    return textoLimpio
  }

  // Función para renderizar el texto formateado
  const renderizarTextoFormateado = (texto: string) => {
    if (!texto) return null
    
    const lineas = texto.split('\n')
    const elementos = []
    
    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i].trim()
      if (!linea) {
        elementos.push(<Box key={i} h={2} />)
        continue
      }
      
      // Detectar títulos principales (todo en mayúsculas y centrados)
      if (linea === linea.toUpperCase() && linea.length > 3 && !linea.includes(':') && !linea.includes('.')) {
        elementos.push(
          <Heading key={i} size="md" color={headingColor} textAlign="center" mb={4} mt={6} fontWeight="bold">
            {linea}
          </Heading>
        )
      }
      // Detectar subtítulos (terminan con : y son importantes)
      else if (linea.endsWith(':') && linea.length > 5 && (linea.includes('COMPOSICIÓN') || linea.includes('ORDEN') || linea.includes('DELIBERACIONES') || linea.includes('ACUERDOS'))) {
        elementos.push(
          <Heading key={i} size="sm" color={headingColor} mt={4} mb={3} fontWeight="semibold">
            {linea}
          </Heading>
        )
      }
      // Detectar subtítulos generales
      else if (linea.endsWith(':') && linea.length > 5) {
        elementos.push(
          <Text key={i} fontWeight="semibold" mt={3} mb={2} color={headingColor}>
            {linea}
          </Text>
        )
      }
      // Detectar listas numeradas
      else if (/^\d+\./.test(linea)) {
        elementos.push(
          <Text key={i} ml={6} mb={2} fontSize="sm">
            {linea}
          </Text>
        )
      }
      // Detectar listas con guiones
      else if (linea.startsWith('-') || linea.startsWith('•')) {
        elementos.push(
          <Text key={i} ml={6} mb={2} fontSize="sm">
            {linea}
          </Text>
        )
      }
      // Detectar texto con sangría (probablemente párrafos del cuerpo)
      else if (linea.startsWith('     ') || linea.startsWith('\t')) {
        elementos.push(
          <Text key={i} mb={3} textAlign="justify" fontSize="sm" pl={4}>
            {linea.trim()}
          </Text>
        )
      }
      // Párrafos normales
      else {
        elementos.push(
          <Text key={i} mb={3} textAlign="justify" fontSize="sm">
            {linea}
          </Text>
        )
      }
    }
    
    return elementos
  }

  const handleSave = async () => {
    if (!acta || !editor) return

    try {
      setSaving(true)
      // Obtener el contenido HTML del editor con formato preservado
      const htmlParaGuardar = editor.getHTML()
      
      // Asegurar que el contenido tenga el formato correcto para la exportación
      const contenidoFormateado = htmlParaGuardar
        .replace(/<h1[^>]*>/g, '<p align="center"><strong>')
        .replace(/<\/h1>/g, '</strong></p>')
        .replace(/<h2[^>]*>/g, '<p align="center"><strong>')
        .replace(/<\/h2>/g, '</strong></p>')
        .replace(/<h3[^>]*>/g, '<p><strong>')
        .replace(/<\/h3>/g, '</strong></p>')
        .replace(/<p[^>]*style="text-align: center"[^>]*>/g, '<p align="center">')
        .replace(/<p[^>]*style="text-align: right"[^>]*>/g, '<p align="right">')
        .replace(/<p[^>]*style="text-align: left"[^>]*>/g, '<p>')
        .replace(/<p[^>]*class="[^"]*"[^>]*>/g, '<p>')
        .replace(/<p[^>]*>/g, (match) => {
          // Preservar alineación si existe
          if (match.includes('text-align: center')) {
            return '<p align="center">'
          } else if (match.includes('text-align: right')) {
            return '<p align="right">'
          } else if (match.includes('text-align: left')) {
            return '<p>'
          }
          return '<p>'
        })
      
      const response = await fetch(`/api/actas/${acta._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actaGenerada: contenidoFormateado })
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

  const handleExportTXT = () => {
    if (!acta) return

    const contenido = `
ACTA DE REUNIÓN

${acta.titulo}
Fecha: ${new Date(acta.fecha).toLocaleDateString('es-CO')}
Hora: ${acta.hora}
Lugar: ${acta.lugar}
Tipo de Reunión: ${acta.tipoReunion}

${limpiarYFormatearTexto(acta.actaGenerada)}

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
      description: 'Acta exportada en formato TXT',
      status: 'success',
      duration: 3000,
    })
  }

  const handleExportDOCX = async () => {
    if (!acta) return

    try {
      setExporting(true)
      const response = await fetch('/api/actas/exportar-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actaId: acta._id })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `acta-${acta.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date(acta.fecha).toISOString().split('T')[0]}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: 'Éxito',
          description: 'Acta exportada en formato DOCX',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error al exportar DOCX',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error al exportar DOCX:', error)
      toast({
        title: 'Error',
        description: 'Error al exportar DOCX',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setExporting(false)
    }
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
                {new Date(acta.fecha).toLocaleDateString('es-CO', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
            })} - {acta.hora}
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
                <Text><strong>Fecha:</strong> {new Date(acta.fecha).toLocaleDateString('es-CO', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC'
                })}</Text>
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
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Acta Generada:</Text>
                {!isEditing && acta.actaGenerada && (
                  <Badge 
                    size="sm" 
                    colorScheme={mostrarFormatoLimpio ? "green" : "blue"}
                    variant="subtle"
                  >
                    {mostrarFormatoLimpio ? "Texto Plano" : "Estructurado"}
                  </Badge>
                )}
              </VStack>
              
              <HStack justify="space-between" mb={2}>
                <HStack spacing={2}>
                  {!isEditing && acta.actaGenerada && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMostrarFormatoLimpio(!mostrarFormatoLimpio)}
                    >
                      {mostrarFormatoLimpio ? 'Ver Estructurado' : 'Ver Texto Plano'}
                    </Button>
                  )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
                </HStack>
              </HStack>
              
              {isEditing ? (
                <VStack spacing={4} align="stretch">
                  <Text fontSize="xs" color={textColor} fontStyle="italic">
                    💡 Edita el contenido manteniendo la estructura. Usa las herramientas de formato para dar estilo al texto.
                  </Text>
                  
                  {/* Barra de herramientas del editor */}
                  {editor && (
                    <VStack spacing={2} align="stretch">
                      <HStack spacing={1} p={2} bg={cardBg} borderRadius="md" flexWrap="wrap">
                        <Tooltip label="Negrita">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('bold') ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            aria-label="Negrita"
                          >
                            <span style={{ fontWeight: 'bold' }}>B</span>
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip label="Cursiva">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('italic') ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            aria-label="Cursiva"
                          >
                            <span style={{ fontStyle: 'italic' }}>I</span>
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip label="Subrayado">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('underline') ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            aria-label="Subrayado"
                          >
                            <span style={{ textDecoration: 'underline' }}>U</span>
                          </IconButton>
                        </Tooltip>
                        
                        <Divider orientation="vertical" />
                        
                        <Tooltip label="Título 1">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('heading', { level: 1 }) ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            aria-label="Título 1"
                          >
                            H1
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip label="Título 2">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('heading', { level: 2 }) ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            aria-label="Título 2"
                          >
                            H2
                          </IconButton>
                        </Tooltip>
                        
                        <Divider orientation="vertical" />
                        
                        <Tooltip label="Lista con viñetas">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('bulletList') ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            aria-label="Lista con viñetas"
                          >
                            •
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip label="Lista numerada">
                          <IconButton
                            size="sm"
                            variant={editor.isActive('orderedList') ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            aria-label="Lista numerada"
                          >
                            1.
                          </IconButton>
                        </Tooltip>
                        
                        <Divider orientation="vertical" />
                        
                        <Tooltip label="Alinear izquierda">
                          <IconButton
                            size="sm"
                            variant={editor.isActive({ textAlign: 'left' }) ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            aria-label="Alinear izquierda"
                          >
                            ⬅️
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip label="Centrar">
                          <IconButton
                            size="sm"
                            variant={editor.isActive({ textAlign: 'center' }) ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            aria-label="Centrar"
                          >
                            ↔️
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip label="Alinear derecha">
                          <IconButton
                            size="sm"
                            variant={editor.isActive({ textAlign: 'right' }) ? 'solid' : 'outline'}
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            aria-label="Alinear derecha"
                          >
                            ➡️
                          </IconButton>
                        </Tooltip>
                      </HStack>
                      
                      <Text fontSize="xs" color={textColor} fontStyle="italic">
                        💡 Usa Ctrl+B para negrita, Ctrl+I para cursiva, Ctrl+U para subrayado
                      </Text>
                    </VStack>
                  )}
                  
                  {/* Editor TipTap */}
                  <Box
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    minH="400px"
                    bg="white"
                    _dark={{ bg: 'gray.800' }}
                  >
                    {editor && <EditorContent editor={editor} />}
                  </Box>
                </VStack>
              ) : (
                <Box
                  bg={cardBg}
                  p={4}
                  borderRadius="md"
                  fontSize="sm"
                  maxH="500px"
                  overflowY="auto"
                  border="1px"
                  borderColor={borderColor}
                >
                  {acta.actaGenerada ? (
                    mostrarFormatoLimpio ? (
                      renderizarTextoFormateado(limpiarYFormatearTexto(acta.actaGenerada))
                    ) : (
                      <Box
                        dangerouslySetInnerHTML={{ __html: acta.actaGenerada }}
                        fontSize="sm"
                        lineHeight="1.6"
                      />
                    )
                  ) : (
                    <Text color={textColor} fontStyle="italic">
                      No se ha generado el acta aún
                    </Text>
                  )}
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
              <>
                <Button
                  colorScheme="green"
                  onClick={handleExportTXT}
                >
                  Exportar TXT
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={handleExportDOCX}
                  isLoading={exporting}
                  loadingText="Exportando..."
                >
                  Exportar DOCX
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ActaViewModal 
import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Acta from '../../../lib/models/Acta'
import Configuracion from '../../../lib/models/Configuracion'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from 'docx'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    await dbConnect()
    
    const { actaId } = req.body
    
    if (!actaId) {
      return res.status(400).json({ error: 'ID de acta requerido' })
    }
    
    // Obtener la acta con información de la reunión
    const acta = await (Acta as any).findById(actaId)
      .populate('reunionId', 'titulo fecha tipoReunion lugar hora asistentes descripcion')
      .exec()
    
    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' })
    }

    // Obtener la configuración del sistema
    const configuracion = await (Configuracion as any).findOne().exec()
    if (!configuracion) {
      return res.status(500).json({ error: 'Configuración del sistema no encontrada' })
    }

    // Función para convertir tipos de reunión
    const getTipoReunionLegible = (tipo: string) => {
      const tipos = {
        'asamblea': 'Asamblea General',
        'reunion_ordinaria': 'Reunión Ordinaria',
        'reunion_extraordinaria': 'Reunión Extraordinaria'
      }
      return tipos[tipo as keyof typeof tipos] || tipo
    }

    // Función para obtener el nombre del mes
    const getNombreMes = (fecha: Date) => {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
      return meses[fecha.getMonth()]
    }

    // Si existe actaGenerada, usar el contenido real editado
    if (acta.actaGenerada) {
      // Función para parsear el contenido HTML del acta a formato DOCX
      const parseActaGeneradaToDocx = (texto: string) => {
        // Eliminar etiquetas HTML y convertirlas a formato Word
        texto = texto.replace(/<p[^>]*>/gi, '\n').replace(/<\/p>/gi, '\n')
        texto = texto.replace(/<br\s*\/?>/gi, '\n')
        texto = texto.replace(/&nbsp;/g, ' ')
        // Convertir encabezados centrados
        texto = texto.replace(/<p[^>]*align="center"[^>]*><strong>(.*?)<\/strong><\/p>/gi, '##$1##')
        texto = texto.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        // Quitar cualquier otra etiqueta HTML
        texto = texto.replace(/<[^>]+>/g, '')
        // Normalizar saltos de línea
        texto = texto.replace(/\n{2,}/g, '\n')
        // Separar por líneas
        const lineas = texto.split(/\n/).map(l => l.trim()).filter(Boolean)
        const parrafos: Paragraph[] = []
        
        lineas.forEach(linea => {
          // Encabezados centrados
          if (/^##.*##$/.test(linea)) {
            parrafos.push(new Paragraph({
              children: [new TextRun({ text: linea.replace(/##/g, ''), bold: true, size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }))
          } else if (/^\d+\.\s*/.test(linea)) {
            // Lista numerada
            const textoLimpio = linea.replace(/^\d+\.\s*/, '')
            parrafos.push(new Paragraph({
              text: textoLimpio,
              numbering: { reference: 'numbered-list', level: 0 },
              spacing: { after: 100 },
            }))
          } else if (/^\* |- /.test(linea)) {
            // Lista con viñetas
            const textoLimpio = linea.replace(/^\* |- /, '')
            parrafos.push(new Paragraph({
              text: textoLimpio,
              bullet: { level: 0 },
              spacing: { after: 100 },
            }))
          } else if (/^\*\*(.*?)\*\*$/.test(linea)) {
            // Negrita
            parrafos.push(new Paragraph({
              children: [new TextRun({ text: linea.replace(/\*\*/g, ''), bold: true })],
              spacing: { after: 200 },
            }))
          } else {
            // Párrafo normal, procesar negritas internas
            const runs: TextRun[] = []
            let lastIndex = 0
            const boldRegex = /\*\*(.*?)\*\*/g
            let match
            while ((match = boldRegex.exec(linea)) !== null) {
              if (match.index > lastIndex) {
                runs.push(new TextRun({ text: linea.substring(lastIndex, match.index) }))
              }
              runs.push(new TextRun({ text: match[1], bold: true }))
              lastIndex = match.index + match[0].length
            }
            if (lastIndex < linea.length) {
              runs.push(new TextRun({ text: linea.substring(lastIndex) }))
            }
            parrafos.push(new Paragraph({ 
              children: runs.length ? runs : [new TextRun({ text: linea, size: 24 })], 
              spacing: { after: 200 } 
            }))
          }
        })
        return parrafos
      }
      
      // Parsear todo el contenido del acta
      const contenidoDocx = parseActaGeneradaToDocx(acta.actaGenerada)
      
      const doc = new Document({
        numbering: {
          config: [
            {
              reference: 'numbered-list',
              levels: [
                {
                  level: 0,
                  format: 'decimal',
                  text: '%1.',
                  alignment: AlignmentType.LEFT,
                },
              ],
            },
          ],
        },
        sections: [
          {
            properties: {
              page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
            },
            children: [
              ...contenidoDocx,
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: configuracion.presidente.nombre, bold: true })] }),
                          new Paragraph({ children: [new TextRun({ text: 'PRESIDENTE', bold: true })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: configuracion.secretario.nombre, bold: true })] }),
                          new Paragraph({ children: [new TextRun({ text: 'SECRETARIO', bold: true })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ],
      })
      const buffer = await Packer.toBuffer(doc)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      res.setHeader('Content-Disposition', `attachment; filename="acta-${acta.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date(acta.fecha).toISOString().split('T')[0]}.docx"`)
      return res.send(buffer)
    }

    // Si no existe actaGenerada, usar el formato antiguo con apuntes
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            // Título principal - Nombre de la asociación
            new Paragraph({
              children: [
                new TextRun({
                  text: configuracion.nombreAsociacion,
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 400,
              },
            }),

            // Subtítulo - Tipo de acta
            new Paragraph({
              children: [
                new TextRun({
                  text: `ACTA DE LA ${getTipoReunionLegible(acta.tipoReunion).toUpperCase()}`,
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 400,
              },
            }),

            // Párrafo introductorio
            new Paragraph({
              children: [
                new TextRun({
                  text: `En el ${acta.lugar}, la ${configuracion.nombreCompletoAsociacion} ubicado en el ${configuracion.ubicacionEspecifica}, y siendo las ${acta.hora} horas del ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}, debidamente convocados, los socios se reúnen en ${getTipoReunionLegible(acta.tipoReunion)}, respetando el quórum legalmente exigido.`,
                  size: 24,
                }),
              ],
              spacing: { before: 200, after: 300 },
            }),

            // Sección de composición de la mesa
            new Paragraph({
              children: [
                new TextRun({
                  text: "COMPOSICIÓN DE LA MESA",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 300, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Conforme a las disposiciones legales y estatutarias, actúa como presidente de la Asamblea ${configuracion.presidente.nombre}, presidente de la Asociación, y como secretario ${configuracion.secretario.nombre}.`,
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            // Sección de socios asistentes
            new Paragraph({
              children: [
                new TextRun({
                  text: "SOCIOS ASISTENTES",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Asisten a la ${getTipoReunionLegible(acta.tipoReunion)} un total de ${(acta.asistentes && acta.asistentes.length) || 0} socios.`,
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 200 },
            }),

            // Sección de orden del día
            new Paragraph({
              children: [
                new TextRun({
                  text: "ORDEN DEL DÍA",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: acta.apuntes || 'No se especificó el orden del día',
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            // Sección de deliberaciones y acuerdos
            new Paragraph({
              children: [
                new TextRun({
                  text: "DELIBERACIONES Y ACUERDOS",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: acta.apuntes || 'No se tomaron apuntes específicos',
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            // Tabla de firmas
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ children: [new TextRun({ text: configuracion.presidente.nombre, bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: 'PRESIDENTE', bold: true })] }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.CENTER,
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ children: [new TextRun({ text: configuracion.secretario.nombre, bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: 'SECRETARIO', bold: true })] }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.CENTER,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="acta-${acta.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date(acta.fecha).toISOString().split('T')[0]}.docx"`)
    return res.send(buffer)

  } catch (error) {
    console.error('Error al exportar DOCX:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
} 
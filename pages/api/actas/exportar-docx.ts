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

    // Extraer puntos del orden del día de los apuntes
    const extraerOrdenDelDia = (apuntes: string) => {
      if (!apuntes) return 'No se especificó el orden del día'
      
      // Buscar números seguidos de puntos en los apuntes
      const puntos = apuntes.match(/\d+\.\s*[^.\n]+/g)
      if (puntos && puntos.length > 0) {
        return puntos.join('\n')
      }
      
      // Si no hay números, buscar líneas que parezcan puntos del orden del día
      const lineas = apuntes.split('\n').filter(linea => 
        linea.trim().length > 0 && 
        !linea.trim().startsWith('•') && 
        !linea.trim().startsWith('-')
      )
      
      if (lineas.length > 0) {
        return lineas.slice(0, 5).join('\n') // Máximo 5 puntos
      }
      
      return 'No se especificó el orden del día'
    }

    // Si existe actaGenerada, usar formato profesional y parser mejorado
    let contenidoActa = acta.actaGenerada
    let estructura = acta.estructura // Suponiendo que guardas el JSON estructurado aquí
    if (contenidoActa) {
      // 1. Secciones previas (centrado, negrita, dinámico)
      const encabezados = [
        new Paragraph({
          children: [new TextRun({ text: configuracion.nombreAsociacion.toUpperCase(), bold: true, size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `ACTA DE LA ${getTipoReunionLegible(acta.tipoReunion).toUpperCase()}`, bold: true, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: `En el ${acta.lugar}, la ${configuracion.nombreCompletoAsociacion} ubicado en el ${configuracion.ubicacionEspecifica}, y siendo las ${acta.hora} horas del ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}, debidamente convocados, los socios se reúnen en ${getTipoReunionLegible(acta.tipoReunion)}, respetando el quórum legalmente exigido.`,
            size: 24,
          })],
          spacing: { before: 200, after: 300 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'COMPOSICIÓN DE LA MESA', bold: true, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: `Conforme a las disposiciones legales y estatutarias, actúa como presidente de la Asamblea ${configuracion.presidente.nombre}, presidente de la Asociación, y como secretario ${configuracion.secretario.nombre}.`,
            size: 24,
          })],
          spacing: { before: 100, after: 300 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ASISTENCIA', bold: true, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: `Asisten a la reunión un total de ${(acta.asistentes && acta.asistentes.length) || 0} socios.`,
            size: 24,
          })],
          spacing: { before: 100, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ORDEN DEL DÍA', bold: true, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        }),
      ]
      // 2. Insertar el 'ORDEN DEL DÍA' como lista numerada
      let ordenDelDiaDocx: Paragraph[] = []
      if (estructura && estructura.ordenDelDia) {
        ordenDelDiaDocx = (estructura.ordenDelDia || []).map((item: string, idx: number) => {
          // Limpiar cualquier numeración existente en el item
          const itemLimpio = item.replace(/^\d+\.\s*/, '')
          return new Paragraph({
            text: itemLimpio,
            numbering: { reference: 'numbered-list', level: 0 },
            spacing: { after: 100 },
          })
        })
      }
      let deliberacionesDocx: Paragraph[] = []
      // 3. Insertar 'DELIBERACIONES Y ACUERDOS' con parser mejorado
      
      // NUEVO PARSER ROBUSTO PARA actaGenerada
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
        // ELIMINAR tabla de firmas si existe en el texto generado por la IA
        texto = texto.replace(/\|[\s\S]*?\|[\s\S]*?\|[\s\S]*?\|[\s\S]*?\|[\s\S]*?\|[\s\S]*?\|/g, '')
        texto = texto.replace(/PRESIDENTE.*SECRETARIO/gi, '')
        texto = texto.replace(/_{3,}.*_{3,}/g, '')
        // Normalizar saltos de línea
        texto = texto.replace(/\n{2,}/g, '\n')
        // Separar por líneas
        const lineas = texto.split(/\n/).map(l => l.trim()).filter(Boolean)
        const parrafos: Paragraph[] = []
        let enSeccionAcuerdos = false
        let contadorLetras = 0
        lineas.forEach(linea => {
          // Detectar si estamos en la sección de ACUERDOS Y TAREAS (más flexible)
          if (/acuerdos.*tareas|tareas.*acuerdos/i.test(linea)) {
            enSeccionAcuerdos = true
            contadorLetras = 0
          }
          
          // Encabezados centrados
          if (/^##.*##$/.test(linea)) {
            parrafos.push(new Paragraph({
              children: [new TextRun({ text: linea.replace(/##/g, ''), bold: true, size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }))
          } else if (/^\d+\.\s*/.test(linea)) {
            // Lista numerada - ELIMINAR el número existente para evitar duplicación
             const textoLimpio = linea.replace(/^\d+\.\s*/, '')
            if (enSeccionAcuerdos) {
              // En ACUERDOS Y TAREAS, usar guiones en lugar de numeración
              parrafos.push(new Paragraph({
                text: textoLimpio,
                bullet: { level: 0 },
                spacing: { after: 100 },
              }))
            } else {
              // En otras secciones, usar numeración normal
              parrafos.push(new Paragraph({
                text: textoLimpio,
                numbering: { reference: 'numbered-list', level: 0 },
                spacing: { after: 100 },
              }))
            }
          } else if (/^\* |- /.test(linea)) {
            // Lista con viñetas - ELIMINAR el símbolo existente
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
            parrafos.push(new Paragraph({ children: runs.length ? runs : [new TextRun(linea)], spacing: { after: 200 } }))
          }
        })
        return parrafos
      }
      // Buscar el inicio de 'ORDEN DEL DÍA' y 'DELIBERACIONES Y ACUERDOS' en el acta generada
      let partes = contenidoActa.split(/\n{2,}/g)
      let idxOrden = partes.findIndex(p => /orden del d[ií]a/i.test(p))
      let idxDeliberaciones = partes.findIndex(p => /deliberaciones.*acuerdos/i.test(p))
      if (idxOrden !== -1 && idxDeliberaciones !== -1) {
        // Orden del día: desde idxOrden+1 hasta idxDeliberaciones-1
        const orden = partes.slice(idxOrden + 1, idxDeliberaciones).join('\n')
        ordenDelDiaDocx = parseActaGeneradaToDocx(orden)
        // Deliberaciones: desde idxDeliberaciones+1 hasta el final
        const deliberaciones = partes.slice(idxDeliberaciones + 1).join('\n')
        deliberacionesDocx = parseActaGeneradaToDocx(deliberaciones)
      } else {
        // Si no se encuentran, parsear todo el contenido
        ordenDelDiaDocx = []
        deliberacionesDocx = parseActaGeneradaToDocx(contenidoActa)
      }
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
              ...encabezados,
              ...ordenDelDiaDocx,
              new Paragraph({
                children: [new TextRun({ text: 'DELIBERACIONES Y ACUERDOS', bold: true, size: 24 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 },
              }),
              ...deliberacionesDocx,
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
    // Crear el documento Word con el nuevo formato
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 pulgada
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
                  text: `En el ${acta.lugar}, la ${configuracion.nombreCompletoAsociacion} ubicado en el ${configuracion.ubicacionEspecifica}, y siendo las ${acta.hora} horas del ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}, debidamente convocados, los socios se reúnen en ${getTipoReunionLegible(acta.tipoReunion)}, respetando el quórum legalmente exigido, con la siguiente,`,
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
                  text: `Conforme a las disposiciones legales y estatutarias, actúa como presidente de la Asamblea ${configuracion.presidente.nombre}, presidente de la Asociación, y como secretario a ${configuracion.secretario.nombre}.`,
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `La Asamblea General se reúne con los siguientes,`,
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
                  text: `Asisten a la ${getTipoReunionLegible(acta.tipoReunion)} un total de ${acta.asistentes.length} socios; se anexa asistencia:`,
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: acta.asistentes.join(', '),
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `De acuerdo con la convocatoria efectuada, la ${getTipoReunionLegible(acta.tipoReunion)} tiene como,`,
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
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
                  text: extraerOrdenDelDia(acta.apuntes),
                  size: 24,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Tras la lectura del Orden del Día, se procede a su tratamiento, dando lugar a la adopción por la Asamblea de las siguientes,`,
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

            // Párrafo de cierre
            new Paragraph({
              children: [
                new TextRun({
                  text: `No habiendo más asuntos que tratar, se levanta la sesión siendo las ${acta.hora} horas del ${new Date(acta.fecha).getDate()} de ${getNombreMes(new Date(acta.fecha))} de ${new Date(acta.fecha).getFullYear()}, citado, de todo lo cual doy fe como secretario y firmo la presente con el presidente.`,
                  size: 24,
                }),
              ],
              spacing: { before: 200, after: 400 },
            }),

            // Tabla de firmas
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text: configuracion.presidente.nombre, bold: true })]
                        }),
                        new Paragraph({ 
                          children: [new TextRun({ text: "PRESIDENTE", bold: true })]
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.CENTER,
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text: configuracion.secretario.nombre, bold: true })]
                        }),
                        new Paragraph({ 
                          children: [new TextRun({ text: "SECRETARIO", bold: true })]
                        }),
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

    // Generar el archivo
    const buffer = await Packer.toBuffer(doc)
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="acta-${acta.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date(acta.fecha).toISOString().split('T')[0]}.docx"`)
    
    res.send(buffer)
    
  } catch (error) {
    console.error('Error al exportar acta a DOCX:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 
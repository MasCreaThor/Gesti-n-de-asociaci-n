import mongoose, { Schema, Document } from 'mongoose'

export interface IActa extends Document {
  reunionId: mongoose.Types.ObjectId
  titulo: string
  fecha: Date
  tipoReunion: string
  lugar: string
  hora: string
  asistentes: string[]
  apuntes: string
  actaGenerada: string
  estado: 'borrador' | 'finalizada'
  createdAt: Date
  updatedAt: Date
}

const ActaSchema = new Schema<IActa>({
  reunionId: {
    type: Schema.Types.ObjectId,
    ref: 'Reunion',
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  tipoReunion: {
    type: String,
    required: true
  },
  lugar: {
    type: String,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  asistentes: [{
    type: String
  }],
  apuntes: {
    type: String,
    default: ''
  },
  actaGenerada: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ['borrador', 'finalizada'],
    default: 'borrador'
  }
}, {
  timestamps: true
})

// Índices para búsquedas eficientes
ActaSchema.index({ reunionId: 1 })
ActaSchema.index({ fecha: -1 })
ActaSchema.index({ tipoReunion: 1 })
ActaSchema.index({ estado: 1 })

export default mongoose.models.Acta || mongoose.model<IActa>('Acta', ActaSchema) 
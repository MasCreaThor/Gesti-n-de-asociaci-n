import mongoose from 'mongoose'

export interface IReunion extends mongoose.Document {
  titulo: string
  descripcion: string
  fecha: Date
  hora: string
  lugar: string
  tipo: 'asamblea' | 'reunion_ordinaria' | 'reunion_extraordinaria'
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada'
  asistentes: mongoose.Types.ObjectId[]
  anotaciones?: string
  createdAt: Date
  updatedAt: Date
}

const reunionSchema = new mongoose.Schema<IReunion>(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ['asamblea', 'reunion_ordinaria', 'reunion_extraordinaria'],
      default: 'reunion_ordinaria',
    },
    estado: {
      type: String,
      enum: ['programada', 'en_curso', 'finalizada', 'cancelada'],
      default: 'programada',
    },
    asistentes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Socio',
    }],
    anotaciones: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for date queries
reunionSchema.index({ fecha: 1 })

const Reunion = mongoose.models.Reunion || mongoose.model<IReunion>('Reunion', reunionSchema)
export default Reunion 
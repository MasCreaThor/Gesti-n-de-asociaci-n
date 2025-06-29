import mongoose from 'mongoose'

export interface IAsistencia extends mongoose.Document {
  socio: mongoose.Types.ObjectId
  reunion: mongoose.Types.ObjectId
  asistio: boolean
  fechaRegistro: Date
  observaciones?: string
  createdAt: Date
  updatedAt: Date
}

const asistenciaSchema = new mongoose.Schema<IAsistencia>(
  {
    socio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Socio',
      required: true,
    },
    reunion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reunion',
      required: true,
    },
    asistio: {
      type: Boolean,
      required: true,
      default: false,
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
    observaciones: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure unique socio-reunion combinations
asistenciaSchema.index({ socio: 1, reunion: 1 }, { unique: true })

const Asistencia = mongoose.models.Asistencia || mongoose.model<IAsistencia>('Asistencia', asistenciaSchema)
export default Asistencia 
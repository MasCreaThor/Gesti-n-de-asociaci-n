import mongoose from 'mongoose'

export interface ISocio extends mongoose.Document {
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  direccion?: string
  fechaNacimiento: Date
  fechaRegistro: Date
  estado: 'activo' | 'inactivo'
  documentoIdentidad: string
  documentoPDF?: string // URL o ruta del archivo PDF
  observaciones?: string
  createdAt: Date
  updatedAt: Date
}

const socioSchema = new mongoose.Schema<ISocio>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      default: undefined, // Asegura que el valor por defecto sea undefined
    },
    telefono: {
      type: String,
      required: false,
      trim: true,
    },
    direccion: {
      type: String,
      required: false,
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
      required: true,
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo',
    },
    documentoIdentidad: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    documentoPDF: {
      type: String,
      required: false,
      trim: true,
    },
    observaciones: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Virtual for full name
socioSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellido}`
})

// Ensure virtual fields are serialized
socioSchema.set('toJSON', {
  virtuals: true,
})

// Middleware para manejar campos opcionales antes de guardar
socioSchema.pre('save', function(next) {
  // Convertir strings vacíos a undefined para campos opcionales
  if (this.email === '') this.email = undefined
  if (this.telefono === '') this.telefono = undefined
  if (this.direccion === '') this.direccion = undefined
  if (this.documentoPDF === '') this.documentoPDF = undefined
  if (this.observaciones === '') this.observaciones = undefined
  next()
})

// Middleware para manejar campos opcionales antes de actualizar
socioSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any
  if (update) {
    // Convertir strings vacíos a undefined para campos opcionales
    if (update.email === '') update.email = undefined
    if (update.telefono === '') update.telefono = undefined
    if (update.direccion === '') update.direccion = undefined
    if (update.documentoPDF === '') update.documentoPDF = undefined
    if (update.observaciones === '') update.observaciones = undefined
  }
  next()
})

// Middleware para updateOne
socioSchema.pre('updateOne', function(next) {
  const update = this.getUpdate() as any
  if (update) {
    // Convertir strings vacíos a undefined para campos opcionales
    if (update.email === '') update.email = undefined
    if (update.telefono === '') update.telefono = undefined
    if (update.direccion === '') update.direccion = undefined
    if (update.documentoPDF === '') update.documentoPDF = undefined
    if (update.observaciones === '') update.observaciones = undefined
  }
  next()
})

// Forzar la recreación del modelo para evitar caché
if (mongoose.models.Socio) {
  delete mongoose.models.Socio
}

const Socio = mongoose.model<ISocio>('Socio', socioSchema)
export default Socio 
import mongoose, { Schema, Document } from 'mongoose'

export interface IConfiguracion extends Document {
  // Información básica de la asociación
  nombreAsociacion: string
  nombreCompletoAsociacion: string
  direccionAsociacion: string
  ubicacionEspecifica: string
  
  // Información de contacto
  telefono: string
  email: string
  sitioWeb: string
  
  // Información legal
  nit: string
  numeroRegistro: string
  fechaConstitucion: Date
  
  // Cargos de la junta directiva
  presidente: {
    nombre: string
    cedula: string
    telefono: string
    email: string
  }
  secretario: {
    nombre: string
    cedula: string
    telefono: string
    email: string
  }
  tesorero: {
    nombre: string
    cedula: string
    telefono: string
    email: string
  }
  
  // Configuración de actas
  formatoActa: 'modelo_original' | 'modelo_profesional'
  incluirQuorum: boolean
  incluirFirmas: boolean
  incluirAnexos: boolean
  
  // Configuración del sistema
  logoAsociacion: string
  colorPrimario: string
  colorSecundario: string
  
  // Información adicional
  mision: string
  vision: string
  objetivos: string[]
  
  createdAt: Date
  updatedAt: Date
}

const ConfiguracionSchema = new Schema<IConfiguracion>({
  // Información básica de la asociación
  nombreAsociacion: {
    type: String,
    required: true,
    default: 'ASOCIACIÓN DE LA COMUNIDAD'
  },
  nombreCompletoAsociacion: {
    type: String,
    required: true,
    default: 'Asociación de la Comunidad'
  },
  direccionAsociacion: {
    type: String,
    required: true,
    default: 'Dirección de la Asociación'
  },
  ubicacionEspecifica: {
    type: String,
    required: true,
    default: 'Ubicación específica de la asociación'
  },
  
  // Información de contacto
  telefono: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  sitioWeb: {
    type: String,
    default: ''
  },
  
  // Información legal
  nit: {
    type: String,
    default: ''
  },
  numeroRegistro: {
    type: String,
    default: ''
  },
  fechaConstitucion: {
    type: Date,
    default: Date.now
  },
  
  // Cargos de la junta directiva
  presidente: {
    nombre: {
      type: String,
      required: true,
      default: 'Nombre del Presidente'
    },
    cedula: {
      type: String,
      default: ''
    },
    telefono: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  secretario: {
    nombre: {
      type: String,
      required: true,
      default: 'Nombre del Secretario'
    },
    cedula: {
      type: String,
      default: ''
    },
    telefono: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  tesorero: {
    nombre: {
      type: String,
      default: 'Nombre del Tesorero'
    },
    cedula: {
      type: String,
      default: ''
    },
    telefono: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  
  // Configuración de actas
  formatoActa: {
    type: String,
    enum: ['modelo_original', 'modelo_profesional'],
    default: 'modelo_original'
  },
  incluirQuorum: {
    type: Boolean,
    default: true
  },
  incluirFirmas: {
    type: Boolean,
    default: true
  },
  incluirAnexos: {
    type: Boolean,
    default: true
  },
  
  // Configuración del sistema
  logoAsociacion: {
    type: String,
    default: ''
  },
  colorPrimario: {
    type: String,
    default: '#3182CE'
  },
  colorSecundario: {
    type: String,
    default: '#2B6CB0'
  },
  
  // Información adicional
  mision: {
    type: String,
    default: 'Misión de la asociación'
  },
  vision: {
    type: String,
    default: 'Visión de la asociación'
  },
  objetivos: [{
    type: String
  }]
}, {
  timestamps: true
})

// Solo debe existir una configuración en el sistema
ConfiguracionSchema.index({}, { unique: true })

export default mongoose.models.Configuracion || mongoose.model<IConfiguracion>('Configuracion', ConfiguracionSchema) 
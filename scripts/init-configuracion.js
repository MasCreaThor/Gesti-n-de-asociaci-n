const mongoose = require('mongoose')
require('dotenv').config()

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asociacion')

// Definir el esquema de configuración
const ConfiguracionSchema = new mongoose.Schema({
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

const Configuracion = mongoose.model('Configuracion', ConfiguracionSchema)

async function inicializarConfiguracion() {
  try {
    console.log('🔧 Inicializando configuración del sistema...')
    
    // Verificar si ya existe una configuración
    const configuracionExistente = await Configuracion.findOne()
    
    if (configuracionExistente) {
      console.log('✅ La configuración ya existe en el sistema')
      console.log('📋 Configuración actual:')
      console.log('- Nombre de la Asociación:', configuracionExistente.nombreAsociacion)
      console.log('- Presidente:', configuracionExistente.presidente.nombre)
      console.log('- Secretario:', configuracionExistente.secretario.nombre)
      return
    }
    
    // Crear configuración por defecto
    const configuracionPorDefecto = new Configuracion({
      nombreAsociacion: 'ASOCIACIÓN DE TRABAJADORES INDEPENDIENTES DOMIFLAZHVILLA',
      nombreCompletoAsociacion: 'Asociación de Trabajadores Independientes Domiflazhvilla',
      direccionAsociacion: 'Villagarzón, Putumayo, Colombia',
      ubicacionEspecifica: 'auditorio municipal de Villagarzón',
      telefono: '',
      email: '',
      sitioWeb: '',
      nit: '',
      numeroRegistro: '',
      fechaConstitucion: new Date('2024-01-01'),
      presidente: {
        nombre: 'Nombre del Presidente',
        cedula: '',
        telefono: '',
        email: ''
      },
      secretario: {
        nombre: 'Nombre del Secretario',
        cedula: '',
        telefono: '',
        email: ''
      },
      tesorero: {
        nombre: 'Nombre del Tesorero',
        cedula: '',
        telefono: '',
        email: ''
      },
      formatoActa: 'modelo_original',
      incluirQuorum: true,
      incluirFirmas: true,
      incluirAnexos: true,
      colorPrimario: '#3182CE',
      colorSecundario: '#2B6CB0',
      mision: 'Promover el desarrollo y bienestar de los trabajadores independientes de Villagarzón',
      vision: 'Ser una asociación líder en la representación y apoyo a los trabajadores independientes',
      objetivos: [
        'Defender los derechos de los trabajadores independientes',
        'Promover la capacitación y desarrollo profesional',
        'Establecer alianzas estratégicas para el beneficio de los asociados',
        'Gestionar recursos y oportunidades de desarrollo'
      ]
    })
    
    await configuracionPorDefecto.save()
    
    console.log('✅ Configuración inicializada exitosamente')
    console.log('📋 Configuración creada:')
    console.log('- Nombre de la Asociación:', configuracionPorDefecto.nombreAsociacion)
    console.log('- Presidente:', configuracionPorDefecto.presidente.nombre)
    console.log('- Secretario:', configuracionPorDefecto.secretario.nombre)
    console.log('')
    console.log('💡 Puedes personalizar esta configuración desde la página de Configuración del Sistema')
    
  } catch (error) {
    console.error('❌ Error al inicializar configuración:', error)
  } finally {
    mongoose.connection.close()
  }
}

// Ejecutar el script
inicializarConfiguracion() 
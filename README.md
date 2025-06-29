# Sistema de Gestión de Asociación

Sistema web para gestionar una asociación, incluyendo registro de socios, reuniones, asistencia y documentación.

## Tecnologías Utilizadas

- **Frontend**: Next.js, React, TypeScript
- **UI**: Chakra UI
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Validación**: Zod
- **Iconos**: React Icons

## Funcionalidades

- 🔐 **Autenticación**: Login seguro para administrador
- 👥 **Gestión de Socios**: CRUD completo de miembros
- 📅 **Gestión de Reuniones**: Crear y gestionar reuniones
- ✅ **Control de Asistencia**: Registrar asistencia por reunión
- 📄 **Documentos**: Subida de documentos PDF
- 📊 **Dashboard**: Estadísticas y resumen del sistema
- 📱 **Responsive**: Diseño adaptable a móviles

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   
   Editar `.env.local` con tus configuraciones:
   ```env
   MONGODB_URI=mongodb://localhost:27017/asociacion
   JWT_SECRET=tu-clave-secreta-super-segura-para-jwt
   ```

4. **Configurar MongoDB**
   - Instalar MongoDB localmente o usar MongoDB Atlas
   - Crear una base de datos llamada `asociacion`

5. **Crear usuario administrador**
   ```bash
   # Ejecutar el servidor de desarrollo
   npm run dev
   ```
   
   Luego hacer una petición POST a `/api/auth/setup` con:
   ```json
   {
     "email": "admin@asociacion.com",
     "password": "tu-contraseña",
     "name": "Administrador"
   }
   ```

6. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
frontend/
├── components/          # Componentes reutilizables
│   ├── layout/         # Layouts y navegación
│   ├── ui/            # Componentes de UI
│   └── forms/         # Formularios
├── pages/             # Páginas de Next.js
│   ├── api/          # APIs del backend
│   ├── socios/       # Gestión de socios
│   ├── reuniones/    # Gestión de reuniones
│   └── dashboard/    # Dashboard principal
├── lib/              # Utilidades y configuración
│   ├── models/       # Modelos de MongoDB
│   └── mongodb.ts    # Configuración de BD
├── context/          # Contextos de React
└── public/           # Archivos estáticos
```

## Uso

1. **Acceder al sistema**: http://localhost:3000
2. **Login**: Usar las credenciales del administrador
3. **Dashboard**: Ver estadísticas y accesos rápidos
4. **Socios**: Gestionar miembros de la asociación
5. **Reuniones**: Crear y gestionar reuniones
6. **Reportes**: Ver estadísticas y análisis

## Scripts Disponibles

- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Construir para producción
- `npm run start`: Ejecutar en modo producción
- `npm run type-check`: Verificar tipos de TypeScript

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

# Configuración del Sistema de Gestión de Asociación

## Pasos para Configurar el Proyecto

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend` con el siguiente contenido:

```env
MONGODB_URI=mongodb://localhost:27017/asociacion
JWT_SECRET=tu-clave-secreta-super-segura-para-jwt-2024
NEXTAUTH_SECRET=tu-clave-secreta-para-nextauth-2024
NEXTAUTH_URL=http://localhost:3000
```

### 2. Configurar MongoDB

#### Opción A: MongoDB Local
1. Instalar MongoDB en tu sistema
2. Iniciar el servicio de MongoDB
3. Crear una base de datos llamada `asociacion`

#### Opción B: MongoDB Atlas (Recomendado)
1. Crear una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito
3. Obtener la cadena de conexión
4. Reemplazar `MONGODB_URI` en `.env.local` con tu cadena de conexión

### 3. Crear Usuario Administrador

Una vez que el proyecto esté ejecutándose, hacer una petición POST a `/api/auth/setup` con:

```json
{
  "email": "admin@asociacion.com",
  "password": "tu-contraseña-segura",
  "name": "Administrador"
}
```

Puedes usar Postman, curl, o cualquier cliente HTTP:

```bash
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@asociacion.com",
    "password": "tu-contraseña-segura",
    "name": "Administrador"
  }'
```

### 4. Ejecutar el Proyecto

```bash
cd frontend
npm run dev
```

### 5. Acceder al Sistema

1. Abrir http://localhost:3000
2. Usar las credenciales del administrador creado
3. Comenzar a usar el sistema

## Estructura de la Base de Datos

El sistema creará automáticamente las siguientes colecciones:

- **users**: Usuarios administradores
- **socios**: Miembros de la asociación
- **reuniones**: Reuniones programadas
- **asistencias**: Registro de asistencia a reuniones

## Funcionalidades Disponibles

- ✅ Login de administrador
- ✅ Dashboard con estadísticas
- ✅ Gestión de socios (CRUD)
- ✅ Gestión de reuniones (CRUD)
- ✅ Reportes y estadísticas
- ✅ Interfaz responsive

## Próximas Funcionalidades

- 📄 Subida de documentos PDF
- ✅ Control de asistencia por reunión
- 📊 Reportes avanzados
- 🔔 Notificaciones
- 📱 Aplicación móvil

## Solución de Problemas

### Error de Conexión a MongoDB
- Verificar que MongoDB esté ejecutándose
- Verificar la cadena de conexión en `.env.local`
- Verificar que la base de datos exista

### Error de Autenticación
- Verificar que el usuario administrador haya sido creado
- Verificar que las credenciales sean correctas
- Verificar que JWT_SECRET esté configurado

### Error de Compilación
- Verificar que todas las dependencias estén instaladas
- Ejecutar `npm install` si es necesario
- Verificar la versión de Node.js (recomendado 16+) 
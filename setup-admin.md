# 🔐 Configuración del Administrador Inicial

## Pasos para Configurar las Credenciales del Administrador

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend` con el siguiente contenido:

```env
MONGODB_URI=mongodb://localhost:27017/asociacion
JWT_SECRET=tu-clave-secreta-super-segura-para-jwt-cambiar-en-produccion
NEXTAUTH_SECRET=tu-clave-secreta-para-nextauth-cambiar-en-produccion
NEXTAUTH_URL=http://localhost:3000
```

### 2. Configurar MongoDB

**Opción A: MongoDB Local**
- Instalar MongoDB Community Edition
- Iniciar el servicio de MongoDB
- La base de datos se creará automáticamente

**Opción B: MongoDB Atlas (Recomendado)**
- Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- Crear un cluster gratuito
- Obtener la URL de conexión
- Reemplazar `MONGODB_URI` en `.env.local`

### 3. Crear Usuario Administrador

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Acceder a la página de configuración:**
   ```
   http://localhost:3000/setup
   ```

3. **Completar el formulario:**
   - **Nombre:** Tu nombre completo
   - **Email:** admin@asociacion.com (o el que prefieras)
   - **Contraseña:** Una contraseña segura (mínimo 6 caracteres)

4. **Hacer clic en "Crear Usuario Administrador"**

### 4. Iniciar Sesión

1. **Ir a la página de login:**
   ```
   http://localhost:3000/login
   ```

2. **Usar las credenciales creadas:**
   - Email: admin@asociacion.com
   - Contraseña: [la contraseña que configuraste]

3. **¡Listo! Ya puedes acceder al dashboard**

## 🔒 Seguridad

- **Cambia las claves secretas** en producción
- **Usa contraseñas fuertes** (mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos)
- **No compartas las credenciales**
- **Haz respaldos regulares** de la base de datos

## 🚨 Notas Importantes

- La página `/setup` solo se puede usar **UNA VEZ**
- Una vez creado el administrador, no podrás acceder a esta página nuevamente
- Si necesitas crear más administradores, hazlo desde el dashboard una vez logueado

## 🆘 Solución de Problemas

**Error de conexión a MongoDB:**
- Verifica que MongoDB esté ejecutándose
- Revisa la URL de conexión en `.env.local`
- Asegúrate de que el puerto 27017 esté disponible

**Error al crear usuario:**
- Verifica que todos los campos estén completos
- Asegúrate de que el email sea válido
- La contraseña debe tener al menos 6 caracteres 
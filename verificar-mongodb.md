# 🔍 Verificación y Configuración de MongoDB

## Diagnóstico del Problema

### ¿Por qué funcionó el administrador sin MongoDB?

**Posibles causas:**
1. **MongoDB como servicio de Windows** - Podría estar ejecutándose automáticamente
2. **MongoDB Atlas** - Podría estar usando una conexión en la nube
3. **Base de datos en memoria** - Fallback temporal
4. **Conexión a otra instancia** - Podría estar conectado a otro servidor

## 🔧 Verificación y Configuración

### Paso 1: Verificar si MongoDB está instalado

```bash
# Verificar si MongoDB está instalado
mongod --version

# Verificar si el servicio está ejecutándose
sc query MongoDB
```

### Paso 2: Instalar MongoDB Community (si no está instalado)

**Windows:**
1. Descargar desde: https://www.mongodb.com/try/download/community
2. Ejecutar el instalador
3. Seguir las instrucciones del wizard

**macOS:**
```bash
brew install mongodb-community
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install mongodb
```

### Paso 3: Iniciar MongoDB

**Windows (Servicio):**
```bash
# Iniciar el servicio
net start MongoDB

# O manualmente
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS/Linux:**
```bash
# Iniciar el servicio
sudo systemctl start mongod

# O manualmente
mongod --dbpath /var/lib/mongodb
```

### Paso 4: Verificar la conexión

```bash
# Verificar si el puerto 27017 está en uso
netstat -an | findstr :27017

# Conectar con MongoDB
mongosh
```

### Paso 5: Crear la base de datos

```javascript
// En mongosh
use asociacion
db.createCollection('users')
db.createCollection('socios')
db.createCollection('reuniones')
db.createCollection('asistencias')
```

## 🚨 Solución de Problemas

### Error: "MongoDB connection error"

**Causas comunes:**
1. MongoDB no está ejecutándose
2. Puerto 27017 bloqueado
3. Firewall bloqueando la conexión
4. Variables de entorno incorrectas

**Soluciones:**
1. **Verificar que MongoDB esté ejecutándose:**
   ```bash
   # Windows
   sc query MongoDB
   
   # Linux/macOS
   sudo systemctl status mongod
   ```

2. **Verificar el puerto:**
   ```bash
   netstat -an | findstr :27017
   ```

3. **Verificar variables de entorno:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/asociacion
   ```

4. **Probar conexión manual:**
   ```bash
   mongosh mongodb://localhost:27017/asociacion
   ```

### Error: "Permission denied"

**Solución:**
```bash
# Windows - Ejecutar como administrador
# Linux/macOS
sudo chown -R $USER /var/lib/mongodb
sudo chmod 755 /var/lib/mongodb
```

## 📊 Verificación de Datos

### Verificar que los datos se guardan correctamente

```javascript
// En mongosh
use asociacion

// Ver usuarios
db.users.find()

// Ver socios
db.socios.find()

// Ver estructura de un documento
db.users.findOne()
```

## 🔒 Configuración de Seguridad

### Variables de entorno recomendadas

```env
MONGODB_URI=mongodb://localhost:27017/asociacion
JWT_SECRET=tu-clave-super-secreta-de-al-menos-32-caracteres
NEXTAUTH_SECRET=otra-clave-super-secreta-de-al-menos-32-caracteres
NEXTAUTH_URL=http://localhost:3000
```

### Cambiar en producción

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/asociacion
JWT_SECRET=clave-super-secreta-de-produccion
NEXTAUTH_SECRET=clave-super-secreta-de-produccion
NEXTAUTH_URL=https://tu-dominio.com
```

## ✅ Checklist de Verificación

- [ ] MongoDB instalado y ejecutándose
- [ ] Puerto 27017 disponible
- [ ] Archivo `.env.local` configurado
- [ ] Base de datos `asociacion` creada
- [ ] Colecciones creadas (users, socios, reuniones, asistencias)
- [ ] Usuario administrador creado
- [ ] Registro de socios funcionando
- [ ] Datos persistiendo en la base de datos 
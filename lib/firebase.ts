import admin from 'firebase-admin'
import fs from 'fs'

let serviceAccount: any = undefined

console.log('FIREBASE_SERVICE_ACCOUNT_PATH:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT)

if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    console.log('Contenido del archivo de cuenta de servicio:', fileContent)
    serviceAccount = JSON.parse(fileContent)
  } catch (err) {
    console.error('Error leyendo o parseando el archivo de cuenta de servicio:', err)
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  } catch (err) {
    console.error('Error parseando FIREBASE_SERVICE_ACCOUNT:', err)
  }
}

// Fix: convertir \n a saltos de línea reales en la clave privada
if (serviceAccount && typeof serviceAccount.private_key === 'string') {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

console.log('Objeto serviceAccount final:', serviceAccount)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

const bucket = admin.storage().bucket()

export { admin, bucket } 
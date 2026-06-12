/**
 * TiendaTech — config/db.js
 * Conexión a MongoDB mediante Mongoose con reconexión automática
 * y manejo robusto de errores.
 *
 * Ubicación: /server/config/db.js
 */

import mongoose from 'mongoose';

/**
 * Opciones de conexión de Mongoose.
 * serverSelectionTimeoutMS: tiempo máximo esperando que el driver
 * encuentre un servidor MongoDB disponible (evita colgar indefinidamente).
 */
const MONGOOSE_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * connectDB()
 * Establece la conexión a MongoDB Atlas (o local).
 * Se llama UNA sola vez al iniciar el servidor.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI no definida en las variables de entorno.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, MONGOOSE_OPTIONS);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    // Terminar proceso con código de error para que el gestor de procesos
    // (PM2, Docker, etc.) pueda reiniciarlo automáticamente.
    process.exit(1);
  }
};

// ─── Eventos del ciclo de vida de la conexión ────────────────────────────────

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado. Intentando reconectar...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconectado exitosamente.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Error de conexión MongoDB: ${err.message}`);
});

// Cierre limpio al apagar el proceso (CTRL+C / SIGTERM de Docker/PM2)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n🛑 Conexión MongoDB cerrada correctamente. Servidor apagado.');
  process.exit(0);
});

export default connectDB;
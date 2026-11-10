const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const alertCron = require('./services/alertCron');

async function start() {
  env.validateEnv();
  await db.checkConnection();

  const stopAlertCron = alertCron.start();
  const server = app.listen(env.PORT, env.HOST);

  try {
    await new Promise((resolve, reject) => {
      const onListening = () => {
        server.off('error', onError);
        resolve();
      };
      const onError = (error) => {
        server.off('listening', onListening);
        reject(error);
      };

      server.once('listening', onListening);
      server.once('error', onError);
    });
  } catch (error) {
    await stopAlertCron();
    throw error;
  }

  console.log(`API escuchando en http://localhost:${env.PORT}`);

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      const shutdown = async () => {
        await stopAlertCron();
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        await db.pool.end();
      };

      shutdown().catch((error) => {
        console.error('Error al cerrar el backend:', error);
        process.exitCode = 1;
      });
    });
  }
}

if (require.main === module) {
  start().catch(async (error) => {
    const message = error.code === 'EADDRINUSE'
      ? `El puerto ${env.PORT} ya está ocupado en ${env.HOST}. Detén el proceso que lo usa o configura otro PORT en backend/.env y actualiza VITE_API_URL en frontend/.env.`
      : error.message;
    console.error('No se pudo iniciar el backend:', message);
    await db.pool.end();
    process.exitCode = 1;
  });
}

module.exports = { start };

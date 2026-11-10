const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const alertCron = require('./services/alertCron');

async function start() {
  env.validateEnv();
  await db.checkConnection();

  const stopAlertCron = alertCron.start();
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`API escuchando en http://localhost:${env.PORT}`);
  });

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
    console.error('No se pudo iniciar el backend:', error.message);
    await db.pool.end();
    process.exitCode = 1;
  });
}

module.exports = { start };

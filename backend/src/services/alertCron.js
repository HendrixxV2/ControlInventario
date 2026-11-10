const cron = require('node-cron');
const env = require('../config/env');
const alertService = require('./alertService');

function start() {
  if (!cron.validate(env.ALERTS_CRON_SCHEDULE)) {
    throw new Error(
      `ALERTS_CRON_SCHEDULE no es válida: ${env.ALERTS_CRON_SCHEDULE}`
    );
  }

  let activeRun = null;
  const task = cron.schedule(env.ALERTS_CRON_SCHEDULE, () => {
    if (activeRun) {
      console.warn('Se omite la revisión programada: la revisión anterior sigue activa');
      return activeRun;
    }

    activeRun = alertService
      .recheck()
      .then(() => {
        console.log('Revisión programada de alertas completada');
      })
      .catch((error) => {
        console.error('Falló la revisión programada de alertas:', error);
      })
      .finally(() => {
        activeRun = null;
      });
    return activeRun;
  });

  console.log(`Revisión automática de alertas programada: ${env.ALERTS_CRON_SCHEDULE}`);

  return async function stop() {
    task.stop();
    if (activeRun) await activeRun;
  };
}

module.exports = { start };

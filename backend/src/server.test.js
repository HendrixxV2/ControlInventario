jest.mock('./app', () => ({
  listen: jest.fn()
}));
jest.mock('./config/env', () => ({
  PORT: 4001,
  HOST: '127.0.0.1',
  validateEnv: jest.fn()
}));
jest.mock('./config/db', () => ({
  checkConnection: jest.fn(),
  pool: { end: jest.fn() }
}));
jest.mock('./services/alertCron', () => ({
  start: jest.fn()
}));

const { EventEmitter } = require('events');
const app = require('./app');
const db = require('./config/db');
const alertCron = require('./services/alertCron');
const { start } = require('./server');

describe('backend server startup', () => {
  test('stops scheduled alerts and rejects when the port is unavailable', async () => {
    const server = new EventEmitter();
    const stopAlertCron = jest.fn().mockResolvedValue();
    const bindError = Object.assign(new Error('address already in use'), {
      code: 'EADDRINUSE'
    });

    db.checkConnection.mockResolvedValue();
    alertCron.start.mockReturnValue(stopAlertCron);
    app.listen.mockImplementation(() => {
      queueMicrotask(() => server.emit('error', bindError));
      return server;
    });

    await expect(start()).rejects.toBe(bindError);

    expect(app.listen).toHaveBeenCalledWith(4001, '127.0.0.1');
    expect(stopAlertCron).toHaveBeenCalledTimes(1);
  });

});

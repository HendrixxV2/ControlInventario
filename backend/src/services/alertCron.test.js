jest.mock('node-cron', () => ({
  validate: jest.fn(() => true),
  schedule: jest.fn()
}));
jest.mock('./alertService', () => ({
  recheck: jest.fn()
}));

const cron = require('node-cron');
const env = require('../config/env');
const alertService = require('./alertService');
const alertCron = require('./alertCron');

describe('alertCron', () => {
  let tick;
  let task;

  beforeEach(() => {
    jest.clearAllMocks();
    cron.validate.mockReturnValue(true);
    env.ALERTS_CRON_SCHEDULE = '*/5 * * * *';
    task = { stop: jest.fn() };
    cron.schedule.mockImplementation((schedule, callback) => {
      tick = callback;
      return task;
    });
  });

  test('schedules automatic alert checks and stops the task', async () => {
    alertService.recheck.mockResolvedValue([]);

    const stop = alertCron.start();
    expect(cron.schedule).toHaveBeenCalledWith(env.ALERTS_CRON_SCHEDULE, expect.any(Function));

    await tick();
    expect(alertService.recheck).toHaveBeenCalledTimes(1);

    await stop();
    expect(task.stop).toHaveBeenCalledTimes(1);
  });

  test('rejects invalid cron expressions', () => {
    cron.validate.mockReturnValue(false);
    env.ALERTS_CRON_SCHEDULE = 'not-a-cron';

    expect(() => alertCron.start()).toThrow('ALERTS_CRON_SCHEDULE no es válida');
    expect(cron.schedule).not.toHaveBeenCalled();
  });

  test('does not overlap checks and waits for an active check when stopping', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    let finishCheck;
    alertService.recheck.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishCheck = resolve;
        })
    );
    const stop = alertCron.start();

    const firstCheck = tick();
    const overlappingCheck = tick();
    expect(alertService.recheck).toHaveBeenCalledTimes(1);

    let stopped = false;
    const stopping = stop().then(() => {
      stopped = true;
    });
    await Promise.resolve();
    expect(stopped).toBe(false);

    finishCheck([]);
    await Promise.all([firstCheck, overlappingCheck, stopping]);
    expect(stopped).toBe(true);
    expect(task.stop).toHaveBeenCalledTimes(1);
  });
});

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('backend port configuration', () => {
  const originalPort = process.env.PORT;
  const originalBackendPort = process.env.BACKEND_PORT;

  afterEach(() => {
    if (originalPort === undefined) delete process.env.PORT;
    else process.env.PORT = originalPort;
    if (originalBackendPort === undefined) delete process.env.BACKEND_PORT;
    else process.env.BACKEND_PORT = originalBackendPort;
  });

  test('does not use inherited PORT=4000, reserved for the frontend', () => {
    process.env.PORT = '4000';
    delete process.env.BACKEND_PORT;

    jest.isolateModules(() => {
      expect(require('./env').PORT).toBe(4001);
    });
  });

  test('prefers BACKEND_PORT when configured', () => {
    process.env.PORT = '4000';
    process.env.BACKEND_PORT = '4002';

    jest.isolateModules(() => {
      expect(require('./env').PORT).toBe(4002);
    });
  });
});

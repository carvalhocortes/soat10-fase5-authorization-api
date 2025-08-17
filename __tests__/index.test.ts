import { authHandler, createUserHandler } from '../src/index';

describe('Index exports', () => {
  it('should export authHandler', () => {
    expect(authHandler).toBeDefined();
    expect(typeof authHandler).toBe('function');
  });

  it('should export createUserHandler', () => {
    expect(createUserHandler).toBeDefined();
    expect(typeof createUserHandler).toBe('function');
  });

  it('should export handlers that are functions', () => {
    expect(authHandler).toBeInstanceOf(Function);
    expect(createUserHandler).toBeInstanceOf(Function);
  });

  it('should have correct handler signatures', () => {
    expect(authHandler.constructor.name).toBe('AsyncFunction');
    expect(createUserHandler.constructor.name).toBe('AsyncFunction');
  });
});

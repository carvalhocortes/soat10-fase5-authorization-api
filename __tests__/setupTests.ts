// Setup file for Jest tests

// Mock environment variables for all tests
process.env.AWS_REGION = 'us-east-1';
process.env.COGNITO_USER_POOL_ID = 'us-east-1_testpool';
process.env.COGNITO_CLIENT_ID = 'test-client-id';

// Setup global test timeout
jest.setTimeout(10000);

// Mock console.log to avoid noise in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

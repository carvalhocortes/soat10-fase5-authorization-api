// Setup file for Jest tests

// Mock environment variables for all tests
process.env.AWS_REGION = 'us-east-1';
process.env.COGNITO_USER_POOL_ID = 'us-east-1_testpool';
// Set up environment variables for tests
process.env.AWS_REGION = 'us-west-2';
process.env.COGNITO_USER_POOL_ID = 'test-pool-id';
process.env.COGNITO_CLIENT_ID = 'test-client-id';
process.env.JWT_SECRET_PARAM = 'test-jwt-secret-param';

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

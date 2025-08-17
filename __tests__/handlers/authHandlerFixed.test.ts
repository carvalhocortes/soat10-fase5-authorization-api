import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// Mock the dependencies BEFORE importing the handler
const mockExecute = jest.fn();
const MockAuthenticate = jest.fn().mockImplementation(() => ({
  execute: mockExecute,
}));

const MockCognitoClientRepository = jest.fn();

jest.mock('../../src/application/Authenticate', () => ({
  Authenticate: MockAuthenticate,
}));

jest.mock('../../src/infrastructure/CognitoClientRepository', () => ({
  CognitoClientRepository: MockCognitoClientRepository,
}));

// Now import the handler
import { AuthenticationError, ValidationError } from '../../src/domain/CustomErrors';
import { authHandler } from '../../src/handlers/authHandler';

describe('authHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (body: string): APIGatewayProxyEvent =>
    ({
      body,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/auth',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    }) as APIGatewayProxyEvent;

  const createMockContext = (): Context =>
    ({
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'test',
      functionVersion: '1',
      invokedFunctionArn: 'arn',
      memoryLimitInMB: '128',
      awsRequestId: 'request-id',
      logGroupName: 'log-group',
      logStreamName: 'log-stream',
      getRemainingTimeInMillis: () => 1000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    }) as Context;

  it('should successfully authenticate with valid credentials', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    });

    const mockAuthResult = {
      AccessToken: 'access-token',
      RefreshToken: 'refresh-token',
      IdToken: 'id-token',
    };

    mockExecute.mockResolvedValue(mockAuthResult);

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await authHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockAuthResult);
    expect(mockExecute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should return 400 when email is missing', async () => {
    const requestBody = JSON.stringify({
      password: 'password123',
    });

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await authHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'E-mail é obrigatório',
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should return 400 when password is missing', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
    });

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await authHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'Senha é obrigatória',
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should handle ValidationError from use case', async () => {
    const requestBody = JSON.stringify({
      email: 'invalid-email',
      password: 'password123',
    });

    mockExecute.mockRejectedValue(new ValidationError('E-mail inválido'));

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await authHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'E-mail inválido',
    });
  });

  it('should handle AuthenticationError from use case', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    mockExecute.mockRejectedValue(new AuthenticationError('Authentication failed'));

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await authHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(401);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 401,
      internalCode: 'UNAUTHORIZED',
      message: 'Authentication failed',
    });
  });

  it('should handle generic errors as 500', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    });

    mockExecute.mockRejectedValue(new Error('Generic error'));

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await authHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 500,
      internalCode: 'INTERNAL_SERVER_ERROR',
      message: 'Generic error',
    });
  });
});

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// Mock the dependencies BEFORE importing the handler
const mockExecute = jest.fn();
const MockCreateUser = jest.fn().mockImplementation(() => ({
  execute: mockExecute,
}));

const MockCognitoClientRepository = jest.fn();

jest.mock('../../src/application/CreateUser', () => ({
  CreateUser: MockCreateUser,
}));

jest.mock('../../src/infrastructure/CognitoClientRepository', () => ({
  CognitoClientRepository: MockCognitoClientRepository,
}));

// Now import the handler
import { ValidationError } from '../../src/domain/CustomErrors';
import { createUserHandler } from '../../src/infrastructure/handlers/createUserHandler';

describe('createUserHandler', () => {
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
      path: '/users',
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

  it('should successfully create user with all parameters', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    });

    const mockCreateUserResult = {
      userSub: 'user-sub-123',
      email: 'test@example.com',
      message: 'Usuário criado com sucesso',
    };

    mockExecute.mockResolvedValue(mockCreateUserResult);

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await createUserHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual(mockCreateUserResult);
    expect(mockExecute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should return 400 when email is missing', async () => {
    const requestBody = JSON.stringify({
      password: 'password123',
      name: 'Test User',
    });

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await createUserHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'Campo "email" é obrigatório',
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should return 400 when password is missing', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
      name: 'Test User',
    });

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await createUserHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'Campo "password" é obrigatório',
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

    const result = (await createUserHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'E-mail inválido',
    });
  });

  it('should handle generic errors as 500', async () => {
    const requestBody = JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    });

    mockExecute.mockRejectedValue(new Error('Cognito service error'));

    const event = createMockEvent(requestBody);
    const context = createMockContext();

    const result = (await createUserHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 500,
      internalCode: 'INTERNAL_SERVER_ERROR',
      message: 'Cognito service error',
    });
  });

  it('should return 400 when request body is null', async () => {
    const event = createMockEvent(null as any);
    const context = createMockContext();

    const result = (await createUserHandler(event, context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      httpCode: 400,
      internalCode: 'BAD_REQUEST',
      message: 'Request body is required',
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });
});

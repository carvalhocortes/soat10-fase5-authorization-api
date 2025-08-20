import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoClientRepository } from '../../src/infrastructure/CognitoClientRepository';

// Mock do AWS SDK
jest.mock('@aws-sdk/client-cognito-identity-provider');

const MockedCognitoClient = CognitoIdentityProviderClient as jest.MockedClass<typeof CognitoIdentityProviderClient>;
const MockedAdminCreateUserCommand = AdminCreateUserCommand as jest.MockedClass<typeof AdminCreateUserCommand>;
const MockedAdminInitiateAuthCommand = AdminInitiateAuthCommand as jest.MockedClass<typeof AdminInitiateAuthCommand>;
const MockedAdminSetUserPasswordCommand = AdminSetUserPasswordCommand as jest.MockedClass<
  typeof AdminSetUserPasswordCommand
>;

describe('CognitoClientRepository', () => {
  let repository: CognitoClientRepository;
  let mockSend: jest.MockedFunction<any>;

  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment variables
    process.env = {
      ...originalEnv,
      AWS_REGION: 'us-east-1',
      COGNITO_USER_POOL_ID: 'us-east-1_testpool',
      COGNITO_CLIENT_ID: 'test-client-id',
    };

    mockSend = jest.fn();
    MockedCognitoClient.mockImplementation(
      () =>
        ({
          send: mockSend,
        }) as any,
    );

    repository = new CognitoClientRepository();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('authorizeByLogin', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockAuthResult: AuthenticationResultType = {
        AccessToken: 'access-token-123',
        RefreshToken: 'refresh-token-123',
        IdToken: 'id-token-123',
        ExpiresIn: 3600,
      };

      mockSend.mockResolvedValue({
        AuthenticationResult: mockAuthResult,
      });

      const result = await repository.authorizeByLogin(email, password);

      expect(MockedCognitoClient).toHaveBeenCalledWith({
        region: 'us-east-1',
      });

      expect(MockedAdminInitiateAuthCommand).toHaveBeenCalledWith({
        UserPoolId: 'us-east-1_testpool',
        ClientId: 'test-client-id',
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResult);
    });

    it('should throw error when authentication result is undefined', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockSend.mockResolvedValue({
        AuthenticationResult: undefined,
      });

      await expect(repository.authorizeByLogin(email, password)).rejects.toThrow('Invalid email or password');
    });

    it('should handle different email formats', async () => {
      const email = 'user.name+tag@example.co.uk';
      const password = 'password123';

      const mockAuthResult: AuthenticationResultType = {
        AccessToken: 'access-token',
      };

      mockSend.mockResolvedValue({
        AuthenticationResult: mockAuthResult,
      });

      await repository.authorizeByLogin(email, password);

      expect(MockedAdminInitiateAuthCommand).toHaveBeenCalledWith({
        UserPoolId: 'us-east-1_testpool',
        ClientId: 'test-client-id',
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
    });
  });

  describe('createUser', () => {
    it('should successfully create user with all parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';

      // Mock para AdminCreateUserCommand
      mockSend.mockResolvedValueOnce({
        User: {
          Attributes: [
            { Name: 'sub', Value: 'user-sub-123' },
            { Name: 'email', Value: email },
            { Name: 'name', Value: name },
          ],
        },
      });

      // Mock para AdminSetUserPasswordCommand
      mockSend.mockResolvedValueOnce({});

      const result = await repository.createUser(email, password);

      expect(MockedAdminCreateUserCommand).toHaveBeenCalledWith({
        UserPoolId: 'us-east-1_testpool',
        Username: email,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      });

      expect(MockedAdminSetUserPasswordCommand).toHaveBeenCalledWith({
        UserPoolId: 'us-east-1_testpool',
        Username: email,
        Password: password,
        Permanent: true,
      });

      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        userSub: 'user-sub-123',
        email: email,
      });
    });

    it('should handle missing sub attribute', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockSend.mockResolvedValueOnce({
        User: {
          Attributes: [{ Name: 'email', Value: email }],
        },
      });
      mockSend.mockResolvedValueOnce({});

      const result = await repository.createUser(email, password);

      expect(result).toEqual({
        userSub: '',
        email: email,
      });
    });

    it('should handle missing user attributes', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockSend.mockResolvedValueOnce({
        User: {
          Attributes: undefined,
        },
      });
      mockSend.mockResolvedValueOnce({});

      const result = await repository.createUser(email, password);

      expect(result).toEqual({
        userSub: '',
        email: email,
      });
    });

    it('should handle missing user object', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockSend.mockResolvedValueOnce({
        User: undefined,
      });
      mockSend.mockResolvedValueOnce({});

      const result = await repository.createUser(email, password);

      expect(result).toEqual({
        userSub: '',
        email: email,
      });
    });

    it('should handle complex email formats', async () => {
      const email = 'user.name+tag@example.co.uk';
      const password = 'password123';

      mockSend.mockResolvedValueOnce({
        User: {
          Attributes: [
            { Name: 'sub', Value: 'user-sub-complex' },
            { Name: 'email', Value: email },
          ],
        },
      });
      mockSend.mockResolvedValueOnce({});

      await repository.createUser(email, password);

      expect(MockedAdminCreateUserCommand).toHaveBeenCalledWith({
        UserPoolId: 'us-east-1_testpool',
        Username: email,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      });

      expect(MockedAdminSetUserPasswordCommand).toHaveBeenCalledWith({
        UserPoolId: 'us-east-1_testpool',
        Username: email,
        Password: password,
        Permanent: true,
      });
    });
  });

  describe('environment variable handling', () => {
    it('should use environment variables for configuration', () => {
      new CognitoClientRepository();

      expect(MockedCognitoClient).toHaveBeenCalledWith({
        region: 'us-east-1',
      });
    });

    it('should handle missing AWS_REGION', () => {
      delete process.env.AWS_REGION;

      new CognitoClientRepository();

      expect(MockedCognitoClient).toHaveBeenCalledWith({
        region: undefined,
      });
    });
  });
});

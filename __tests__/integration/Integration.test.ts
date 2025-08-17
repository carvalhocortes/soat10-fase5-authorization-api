import { Authenticate } from '../../src/application/Authenticate';
import { CreateUser } from '../../src/application/CreateUser';
import { Client } from '../../src/domain/Client';
import { ValidationError } from '../../src/domain/CustomErrors';

// Mock AWS SDK
jest.mock('@aws-sdk/client-cognito-identity-provider');

describe('Integration Tests', () => {
  describe('Client + Authenticate Integration', () => {
    it('should validate email format in Client before reaching Authenticate', async () => {
      const mockRepo = {
        authorizeByLogin: jest.fn(),
        createUser: jest.fn(),
      };

      const authenticate = new Authenticate(mockRepo);

      await expect(
        authenticate.execute({
          email: 'invalid-email',
          password: 'password123',
        }),
      ).rejects.toThrow(ValidationError);

      expect(mockRepo.authorizeByLogin).not.toHaveBeenCalled();
    });

    it('should validate password length in Client before reaching Authenticate', async () => {
      const mockRepo = {
        authorizeByLogin: jest.fn(),
        createUser: jest.fn(),
      };

      const authenticate = new Authenticate(mockRepo);

      await expect(
        authenticate.execute({
          email: 'test@example.com',
          password: '123',
        }),
      ).rejects.toThrow(ValidationError);

      expect(mockRepo.authorizeByLogin).not.toHaveBeenCalled();
    });
  });

  describe('CreateUser Integration', () => {
    it('should handle valid input flow completely', async () => {
      const mockRepo = {
        authorizeByLogin: jest.fn(),
        createUser: jest.fn().mockResolvedValue({
          userSub: 'user-123',
          email: 'test@example.com',
        }),
      };

      const createUser = new CreateUser(mockRepo);

      const result = await createUser.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        userSub: 'user-123',
        email: 'test@example.com',
        message: 'Usuário criado com sucesso',
      });

      expect(mockRepo.createUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should validate required fields before calling repository', async () => {
      const mockRepo = {
        authorizeByLogin: jest.fn(),
        createUser: jest.fn(),
      };

      const createUser = new CreateUser(mockRepo);

      await expect(
        createUser.execute({
          email: '',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow('E-mail é obrigatório');

      expect(mockRepo.createUser).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Integration', () => {
    it('should properly propagate ValidationError through the stack', () => {
      expect(() => new Client('invalid-email', 'password123')).toThrow(ValidationError);

      let error: ValidationError | undefined;
      try {
        new Client('invalid-email', 'password123');
      } catch (e) {
        error = e as ValidationError;
      }

      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.statusCode).toBe(400);
      expect(error?.internalCode).toBe('BAD_REQUEST');
      expect(error?.message).toBe('E-mail inválido');
    });

    it('should handle different types of validation errors correctly', () => {
      // Email validation
      expect(() => new Client('', 'password123')).toThrow('E-mail inválido');
      expect(() => new Client('test@', 'password123')).toThrow('E-mail inválido');
      expect(() => new Client('test@example', 'password123')).toThrow('E-mail inválido');

      // Password validation
      expect(() => new Client('test@example.com', '')).toThrow('Senha inválida');
      expect(() => new Client('test@example.com', '123')).toThrow('Senha inválida');
      expect(() => new Client('test@example.com', '12345')).toThrow('Senha inválida');

      // Valid cases should not throw
      expect(() => new Client('test@example.com', '123456')).not.toThrow();
      expect(() => new Client('user.name+tag@example.co.uk', 'password123')).not.toThrow();
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data integrity from input to output in Authenticate', async () => {
      const testEmail = 'integration.test@example.com';
      const testPassword = 'integrationPassword123';

      const mockAuthResult = {
        AccessToken: 'access-token-integration',
        RefreshToken: 'refresh-token-integration',
        IdToken: 'id-token-integration',
      };

      const mockRepo = {
        authorizeByLogin: jest.fn().mockResolvedValue(mockAuthResult),
        createUser: jest.fn(),
      };

      const authenticate = new Authenticate(mockRepo);

      const result = await authenticate.execute({
        email: testEmail,
        password: testPassword,
      });

      expect(mockRepo.authorizeByLogin).toHaveBeenCalledWith(testEmail, testPassword);
      expect(result).toBe(mockAuthResult);
    });

    it('should maintain data integrity from input to output in CreateUser', async () => {
      const testEmail = 'create.integration@example.com';
      const testPassword = 'createPassword123';

      const mockCreateResult = {
        userSub: 'integration-user-sub',
        email: testEmail,
      };

      const mockRepo = {
        authorizeByLogin: jest.fn(),
        createUser: jest.fn().mockResolvedValue(mockCreateResult),
      };

      const createUser = new CreateUser(mockRepo);

      const result = await createUser.execute({
        email: testEmail,
        password: testPassword,
      });

      expect(mockRepo.createUser).toHaveBeenCalledWith(testEmail, testPassword);
      expect(result).toEqual({
        userSub: 'integration-user-sub',
        email: testEmail,
        message: 'Usuário criado com sucesso',
      });
    });
  });

  describe('Edge Cases Integration', () => {
    it('should handle complex email formats end-to-end', async () => {
      const complexEmails = [
        'user.name@example.com',
        'user+tag@example.com',
        'user.name+tag@example.co.uk',
        'test123@subdomain.example.org',
      ];

      const mockRepo = {
        authorizeByLogin: jest.fn().mockResolvedValue({ AccessToken: 'token' }),
        createUser: jest.fn().mockResolvedValue({ userSub: 'sub', email: 'email' }),
      };

      const authenticate = new Authenticate(mockRepo);
      const createUser = new CreateUser(mockRepo);

      for (const email of complexEmails) {
        // Test Client validation
        expect(() => new Client(email, 'password123')).not.toThrow();

        // Test Authenticate
        await expect(authenticate.execute({ email, password: 'password123' })).resolves.not.toThrow();

        // Test CreateUser
        await expect(createUser.execute({ email, password: 'password123' })).resolves.not.toThrow();
      }
    });

    it('should handle boundary password lengths', async () => {
      const mockRepo = {
        authorizeByLogin: jest.fn().mockResolvedValue({ AccessToken: 'token' }),
        createUser: jest.fn().mockResolvedValue({ userSub: 'sub', email: 'email' }),
      };

      const authenticate = new Authenticate(mockRepo);

      // Exactly 6 characters should work
      await expect(
        authenticate.execute({
          email: 'test@example.com',
          password: '123456',
        }),
      ).resolves.not.toThrow();

      // 5 characters should fail
      await expect(
        authenticate.execute({
          email: 'test@example.com',
          password: '12345',
        }),
      ).rejects.toThrow(ValidationError);
    });
  });
});

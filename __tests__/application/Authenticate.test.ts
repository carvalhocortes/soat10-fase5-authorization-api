import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import { Authenticate, AuthenticateDto } from '../../src/application/Authenticate';
import { ClientRepository } from '../../src/infrastructure/CognitoClientRepository';

// Mock do repositório
const mockRepository: jest.Mocked<ClientRepository> = {
  authorizeByLogin: jest.fn(),
  createUser: jest.fn(),
};

describe('Authenticate', () => {
  let authenticateUseCase: Authenticate;

  beforeEach(() => {
    authenticateUseCase = new Authenticate(mockRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully authenticate with valid credentials', async () => {
      const dto: AuthenticateDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResult: AuthenticationResultType = {
        AccessToken: 'access-token',
        RefreshToken: 'refresh-token',
        IdToken: 'id-token',
        ExpiresIn: 3600,
      };

      mockRepository.authorizeByLogin.mockResolvedValue(mockAuthResult);

      const result = await authenticateUseCase.execute(dto);

      expect(mockRepository.authorizeByLogin).toHaveBeenCalledWith(dto.email, dto.password);
      expect(mockRepository.authorizeByLogin).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockAuthResult);
    });

    it('should throw AuthenticationError when repository throws error', async () => {
      const dto: AuthenticateDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockRepository.authorizeByLogin.mockRejectedValue(new Error());

      await expect(authenticateUseCase.execute(dto)).rejects.toThrow('Authentication failed');

      expect(mockRepository.authorizeByLogin).toHaveBeenCalledWith(dto.email, dto.password);
      expect(mockRepository.authorizeByLogin).toHaveBeenCalledTimes(1);
    });

    it('should validate email format through Client constructor', async () => {
      const dto: AuthenticateDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(authenticateUseCase.execute(dto)).rejects.toThrow();
    });

    it('should validate password length through Client constructor', async () => {
      const dto: AuthenticateDto = {
        email: 'test@example.com',
        password: '123',
      };

      await expect(authenticateUseCase.execute(dto)).rejects.toThrow();
    });
  });
});

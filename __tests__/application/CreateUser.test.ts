import { CreateUser, CreateUserRequest, CreateUserResponse } from '../../src/application/CreateUser';
import { ValidationError } from '../../src/domain/CustomErrors';
import { ClientRepository } from '../../src/infrastructure/CognitoClientRepository';

// Mock do repositório
const mockRepository: jest.Mocked<ClientRepository> = {
  authorizeByLogin: jest.fn(),
  createUser: jest.fn(),
};

describe('CreateUser', () => {
  let createUserUseCase: CreateUser;

  beforeEach(() => {
    createUserUseCase = new CreateUser(mockRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create user with all parameters', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockRepositoryResult = {
        userSub: 'user-sub-123',
        email: 'test@example.com',
      };

      mockRepository.createUser.mockResolvedValue(mockRepositoryResult);

      const result = await createUserUseCase.execute(request);

      expect(mockRepository.createUser).toHaveBeenCalledWith(request.email, request.password);
      expect(mockRepository.createUser).toHaveBeenCalledTimes(1);

      const expectedResponse: CreateUserResponse = {
        userSub: 'user-sub-123',
        email: 'test@example.com',
        message: 'Usuário criado com sucesso',
      };

      expect(result).toEqual(expectedResponse);
    });

    it('should throw ValidationError when email is missing', async () => {
      const request: CreateUserRequest = {
        email: '',
        password: 'password123',
        name: 'Test User',
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(ValidationError);
      await expect(createUserUseCase.execute(request)).rejects.toThrow('E-mail é obrigatório');

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when email is undefined', async () => {
      const request: CreateUserRequest = {
        email: undefined as any,
        password: 'password123',
        name: 'Test User',
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(ValidationError);
      await expect(createUserUseCase.execute(request)).rejects.toThrow('E-mail é obrigatório');

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when password is missing', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        password: '',
        name: 'Test User',
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(ValidationError);
      await expect(createUserUseCase.execute(request)).rejects.toThrow('Senha é obrigatória');

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when password is undefined', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        password: undefined as any,
        name: 'Test User',
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(ValidationError);
      await expect(createUserUseCase.execute(request)).rejects.toThrow('Senha é obrigatória');

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when both email and password are missing', async () => {
      const request: CreateUserRequest = {
        email: '',
        password: '',
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(ValidationError);
      await expect(createUserUseCase.execute(request)).rejects.toThrow('E-mail é obrigatório');

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const repositoryError = new Error('Cognito service error');
      mockRepository.createUser.mockRejectedValue(repositoryError);

      await expect(createUserUseCase.execute(request)).rejects.toThrow('Cognito service error');

      expect(mockRepository.createUser).toHaveBeenCalledWith(request.email, request.password);
    });

    it('should handle complex email formats', async () => {
      const request: CreateUserRequest = {
        email: 'user.name+tag@example.co.uk',
        password: 'password123',
      };

      const mockRepositoryResult = {
        userSub: 'user-sub-789',
        email: 'user.name+tag@example.co.uk',
      };

      mockRepository.createUser.mockResolvedValue(mockRepositoryResult);

      const result = await createUserUseCase.execute(request);

      expect(mockRepository.createUser).toHaveBeenCalledWith('user.name+tag@example.co.uk', 'password123');

      expect(result.email).toBe('user.name+tag@example.co.uk');
      expect(result.userSub).toBe('user-sub-789');
    });

    it('should handle long passwords', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        password: 'very-long-password-with-special-characters-123!@#',
      };

      const mockRepositoryResult = {
        userSub: 'user-sub-long',
        email: 'test@example.com',
      };

      mockRepository.createUser.mockResolvedValue(mockRepositoryResult);

      await createUserUseCase.execute(request);

      expect(mockRepository.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'very-long-password-with-special-characters-123!@#',
      );
    });
  });
});

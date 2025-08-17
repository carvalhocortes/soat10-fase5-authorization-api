import { ValidationError } from '../domain/CustomErrors';
import { ClientRepository } from '../infrastructure/CognitoClientRepository';

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface CreateUserResponse {
  userSub: string;
  email: string;
  message: string;
}

export class CreateUser {
  constructor(private repository: ClientRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { email, password } = request;

    if (!email) throw new ValidationError('E-mail é obrigatório');
    if (!password) throw new ValidationError('Senha é obrigatória');

    const result = await this.repository.createUser(email, password);

    return {
      userSub: result.userSub,
      email: result.email,
      message: 'Usuário criado com sucesso',
    };
  }
}

import { Client } from '../domain/Client';
import { AuthenticationError } from '../domain/CustomErrors';
import { ClientRepository } from '../infrastructure/CognitoClientRepository';

export interface AuthenticateDto {
  email: string;
  password: string;
}

export class Authenticate {
  constructor(private repo: ClientRepository) {}

  async execute(dto: AuthenticateDto) {
    const client = new Client(dto.email, dto.password);
    try {
      return this.repo.authorizeByLogin(client.email, client.password);
    } catch {
      throw new AuthenticationError('Authentication failed');
    }
  }
}

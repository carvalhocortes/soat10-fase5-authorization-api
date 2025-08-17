import { ValidationError } from './CustomErrors';

export class Client {
  constructor(
    public email: string,
    public password: string,
  ) {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ValidationError('E-mail inválido');
    if (password.length < 6) throw new ValidationError('Senha inválida');
  }
}

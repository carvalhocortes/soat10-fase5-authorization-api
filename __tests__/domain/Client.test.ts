import { Client } from '../../src/domain/Client';
import { ValidationError } from '../../src/domain/CustomErrors';

describe('Client', () => {
  describe('constructor', () => {
    it('should create a client with valid email and password', () => {
      const email = 'test@example.com';
      const password = 'password123';

      const client = new Client(email, password);

      expect(client.email).toBe(email);
      expect(client.password).toBe(password);
    });

    it('should throw ValidationError for invalid email - missing @', () => {
      const email = 'testexample.com';
      const password = 'password123';

      expect(() => new Client(email, password)).toThrow(ValidationError);
      expect(() => new Client(email, password)).toThrow('E-mail inválido');
    });

    it('should throw ValidationError for invalid email - missing domain', () => {
      const email = 'test@';
      const password = 'password123';

      expect(() => new Client(email, password)).toThrow(ValidationError);
      expect(() => new Client(email, password)).toThrow('E-mail inválido');
    });

    it('should throw ValidationError for invalid email - missing extension', () => {
      const email = 'test@example';
      const password = 'password123';

      expect(() => new Client(email, password)).toThrow(ValidationError);
      expect(() => new Client(email, password)).toThrow('E-mail inválido');
    });

    it('should throw ValidationError for empty email', () => {
      const email = '';
      const password = 'password123';

      expect(() => new Client(email, password)).toThrow(ValidationError);
      expect(() => new Client(email, password)).toThrow('E-mail inválido');
    });

    it('should throw ValidationError for password shorter than 6 characters', () => {
      const email = 'test@example.com';
      const password = '12345';

      expect(() => new Client(email, password)).toThrow(ValidationError);
      expect(() => new Client(email, password)).toThrow('Senha inválida');
    });

    it('should throw ValidationError for empty password', () => {
      const email = 'test@example.com';
      const password = '';

      expect(() => new Client(email, password)).toThrow(ValidationError);
      expect(() => new Client(email, password)).toThrow('Senha inválida');
    });

    it('should accept password with exactly 6 characters', () => {
      const email = 'test@example.com';
      const password = '123456';

      const client = new Client(email, password);

      expect(client.email).toBe(email);
      expect(client.password).toBe(password);
    });

    it('should accept password longer than 6 characters', () => {
      const email = 'test@example.com';
      const password = 'password123456';

      const client = new Client(email, password);

      expect(client.email).toBe(email);
      expect(client.password).toBe(password);
    });

    it('should accept complex email formats', () => {
      const email = 'user.name+tag@example.co.uk';
      const password = 'password123';

      const client = new Client(email, password);

      expect(client.email).toBe(email);
      expect(client.password).toBe(password);
    });
  });
});

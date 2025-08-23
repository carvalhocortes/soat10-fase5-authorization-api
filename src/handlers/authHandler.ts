import { APIGatewayProxyHandler } from 'aws-lambda';
import { Authenticate } from '../application/Authenticate';
import { ValidationError } from '../domain/CustomErrors';
import { CognitoClientRepository } from '../infrastructure/CognitoClientRepository';
import { ErrorMiddleware } from '../infrastructure/middlewares/errorMiddleware';
import { ResponseMiddleware } from '../infrastructure/middlewares/responseMiddleware';

let authenticateUseCase: Authenticate;

export const authHandler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) throw new ValidationError('Request body is required');

    const { email, password } = JSON.parse(event.body);
    if (!email) throw new ValidationError('Campo "email" é obrigatório');
    if (!password) throw new ValidationError('Campo "password" é obrigatório');

    if (!authenticateUseCase) {
      authenticateUseCase = new Authenticate(new CognitoClientRepository());
    }

    const result = await authenticateUseCase.execute({ email, password });

    return ResponseMiddleware.handle(result);
  } catch (err: any) {
    return ErrorMiddleware.handle(err);
  }
};

import { APIGatewayProxyHandler } from 'aws-lambda';
import { CreateUser } from '../application/CreateUser';
import { ValidationError } from '../domain/CustomErrors';
import { CognitoClientRepository } from '../infrastructure/CognitoClientRepository';
import { ErrorMiddleware } from '../infrastructure/middlewares/errorMiddleware';
import { ResponseMiddleware } from '../infrastructure/middlewares/responseMiddleware';

let createUserUseCase: CreateUser;

export const createUserHandler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) throw new ValidationError('Request body is required');

    const { email, password } = JSON.parse(event.body);
    if (!email) throw new ValidationError('Campo "email" é obrigatório');
    if (!password) throw new ValidationError('Campo "password" é obrigatório');

    if (!createUserUseCase) {
      createUserUseCase = new CreateUser(new CognitoClientRepository());
    }

    const result = await createUserUseCase.execute({ email, password });

    return ResponseMiddleware.handle(result);
  } catch (err: any) {
    return ErrorMiddleware.handle(err);
  }
};

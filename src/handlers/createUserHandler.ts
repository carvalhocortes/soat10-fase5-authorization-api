import { APIGatewayProxyHandler } from 'aws-lambda';
import { CreateUser } from '../application/CreateUser';
import { ValidationError } from '../domain/CustomErrors';
import { CognitoClientRepository } from '../infrastructure/CognitoClientRepository';

let createUserUseCase: CreateUser;

export const createUserHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body || '{}');

    if (!email) throw new ValidationError('E-mail é obrigatório');
    if (!password) throw new ValidationError('Senha é obrigatória');

    if (!createUserUseCase) {
      createUserUseCase = new CreateUser(new CognitoClientRepository());
    }

    const result = await createUserUseCase.execute({ email, password, name });

    return { statusCode: 201, body: JSON.stringify(result) };
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return {
      statusCode,
      body: JSON.stringify({
        httpCode: statusCode,
        internalCode: err.internalCode || 'INTERNAL_SERVER_ERROR',
        message: err.message,
      }),
    };
  }
};

import { APIGatewayProxyHandler } from 'aws-lambda';
import { Authenticate } from './application/Authenticate';
import { ValidationError } from './domain/errors/CustomErrors';
import { CognitoClientRepository } from './infrastructure/CognitoClientRepository';

let useCase: Authenticate;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email) throw new ValidationError('E-mail é obrigatório');
    if (!password) throw new ValidationError('Senha é obrigatória');

    if (!useCase) {
      useCase = new Authenticate(new CognitoClientRepository());
    }

    const result = await useCase.execute({ email, password });

    return { statusCode: 200, body: JSON.stringify(result) };
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

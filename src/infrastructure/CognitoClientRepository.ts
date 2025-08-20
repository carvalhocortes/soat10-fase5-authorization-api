import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthenticationError } from '../domain/CustomErrors';

export interface ClientRepository {
  authorizeByLogin(email: string, password: string): Promise<AuthenticationResultType | undefined>;
  createUser(email: string, password: string): Promise<{ userSub: string; email: string }>;
}

export class CognitoClientRepository implements ClientRepository {
  private client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });
  private poolId = process.env.COGNITO_USER_POOL_ID!;
  private clientId = process.env.COGNITO_CLIENT_ID!;

  async authorizeByLogin(email: string, password: string) {
    const authResult = await this.client.send(
      new AdminInitiateAuthCommand({
        UserPoolId: this.poolId,
        ClientId: this.clientId,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    );

    const authenticationResult = authResult.AuthenticationResult;

    if (!authenticationResult) throw new AuthenticationError('Invalid email or password');

    return authenticationResult;
  }

  async createUser(email: string, password: string) {
    const userAttributes = [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ];

    const createResult = await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.poolId,
        Username: email,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: userAttributes,
      }),
    );

    await this.client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: this.poolId,
        Username: email,
        Password: password,
        Permanent: true,
      }),
    );

    return {
      userSub: createResult.User?.Attributes?.find((attr) => attr.Name === 'sub')?.Value || '',
      email,
    };
  }
}

import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export interface ClientRepository {
  authorizeByLogin(email: string, password: string): Promise<AuthenticationResultType | undefined>;
  createUser(email: string, password: string, name?: string): Promise<{ userSub: string; email: string }>;
}

export class CognitoClientRepository implements ClientRepository {
  private client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });
  private poolId = process.env.COGNITO_USER_POOL_ID!;

  async authorizeByLogin(email: string, password: string) {
    const authResult = await this.client.send(
      new AdminInitiateAuthCommand({
        UserPoolId: this.poolId,
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    );
    return authResult.AuthenticationResult;
  }

  async createUser(email: string, password: string, name?: string) {
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

    if (name) {
      userAttributes.push({
        Name: 'name',
        Value: name,
      });
    }

    const createResult = await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.poolId,
        Username: email,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: userAttributes,
      }),
    );

    return {
      userSub: createResult.User?.Attributes?.find((attr) => attr.Name === 'sub')?.Value || '',
      email,
    };
  }
}

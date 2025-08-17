import {
  AdminInitiateAuthCommand,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export interface ClientRepository {
  authorizeByLogin(email: string, password: string): Promise<AuthenticationResultType | undefined>;
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
}

import { StackContext, AppSyncApi } from 'sst/constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appSync from 'aws-cdk-lib/aws-appsync';

export function API({ stack }: StackContext) {
  const apiUserPool = new cognito.UserPool(stack, 'ApiUserPool', {});

  const api = new AppSyncApi(stack, 'GraphqlApi', {
    schema: 'packages/core/src/schema.graphql',
    dataSources: {
      lambdaDs: 'packages/functions/src/lambda.handler',
    },
    resolvers: {
      'Query hello': 'lambdaDs',
    },
    cdk: {
      graphqlApi: {
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: appSync.AuthorizationType.USER_POOL,
            userPoolConfig: { userPool: apiUserPool },
          },
        },
      },
    },
  });

  apiUserPool.addResourceServer('appSyncResourceServer', {
    userPoolResourceServerName: 'appsync',
    identifier: api.url,
    scopes: [{ scopeName: 'read:all', scopeDescription: 'Read all data' }],
  });

  apiUserPool.addClient('main', {
    userPoolClientName: 'main',
    generateSecret: true,
    authFlows: { userPassword: true },
    enableTokenRevocation: true,
    oAuth: {
      scopes: [cognito.OAuthScope.custom(api.url + '/read:all')],
      flows: { clientCredentials: true },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

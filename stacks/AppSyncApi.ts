import { StackContext, AppSyncApi, Config } from 'sst/constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appSync from 'aws-cdk-lib/aws-appsync';
import * as libs from './libs';

export function API({ stack }: StackContext) {
  const apiUserPool = new cognito.UserPool(stack, 'ApiUserPool');

  const api = new AppSyncApi(stack, 'GraphqlApi', {
    schema: 'packages/core/src/schema.graphql',
    dataSources: {
      lambdaDs: {
        type: 'function',
        function: libs.createLambda(stack, 'lambdaDs'),
      },
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

  libs.createAppSyncLogGroup(stack, 'graphQLAPI', api.apiId);

  const userPoolDomain = apiUserPool.addDomain('default', {
    cognitoDomain: { domainPrefix: 'appsync-api' },
  });

  const userPoolDomainName = new Config.Parameter(stack, 'domainName', {
    value: userPoolDomain.domainName,
  });

  const apiUrl = new Config.Parameter(stack, 'apiUrl', {
    value: api.url,
  });

  apiUserPool.addResourceServer('appSyncResourceServer', {
    userPoolResourceServerName: 'appsync',
    identifier: api.url,
    scopes: [{ scopeName: 'read:all', scopeDescription: 'Read all data' }],
  });

  const mainClient = apiUserPool.addClient('main', {
    userPoolClientName: 'main',
    generateSecret: true,
    authFlows: { userPassword: true },
    enableTokenRevocation: true,
    oAuth: {
      scopes: [cognito.OAuthScope.custom(api.url + '/read:all')],
      flows: { clientCredentials: true },
    },
  });

  const clientId = new Config.Parameter(stack, 'clientId', {
    value: mainClient.userPoolClientId,
  });
  const clientSecret = new Config.Secret(stack, 'clientSecret');

  const queryHello = libs.createLambda(stack, 'queryHello');
  queryHello.bind([userPoolDomainName, apiUrl, clientId, clientSecret]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

import * as sst from 'sst/constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appSync from 'aws-cdk-lib/aws-appsync';
import * as libs from './libs';

export function API({ stack }: sst.StackContext) {
  const apiUserPool = new cognito.UserPool(stack, 'ApiUserPool', {
    removalPolicy: libs.setRemovalPolicy(),
  });

  const table = new sst.Table(stack, 'system', {
    fields: { pk: 'string', sk: 'string' },
    primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
    cdk: { table: { removalPolicy: libs.setRemovalPolicy() } },
  });

  const tableName = new sst.Config.Parameter(stack, 'tableName', {
    value: table.tableName,
  });

  const lambdaDs = libs.createLambda(stack, 'lambdaDs');
  lambdaDs.bind([tableName, table]);

  const api = new sst.AppSyncApi(stack, 'GraphqlApi', {
    schema: 'packages/core/src/schema.graphql',
    dataSources: {
      lambdaDs: {
        type: 'function',
        function: lambdaDs,
      },
    },
    resolvers: {
      'Query hello': 'lambdaDs',
      'Query user': 'lambdaDs',
      'Mutation addRoleToUser': 'lambdaDs',
      'Mutation removeRoleFromUser': 'lambdaDs',
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

  api.bind([table]);

  libs.createAppSyncLogGroup(stack, 'graphQLAPI', api.apiId);

  const userPoolDomain = apiUserPool.addDomain('default', {
    cognitoDomain: { domainPrefix: 'appsync-api' },
  });

  const userPoolDomainName = new sst.Config.Parameter(stack, 'domainName', {
    value: userPoolDomain.domainName,
  });

  const apiUrl = new sst.Config.Parameter(stack, 'apiUrl', {
    value: api.url,
  });

  const resourceServer = apiUserPool.addResourceServer(
    'appSyncResourceServer',
    {
      userPoolResourceServerName: 'appsync',
      identifier: api.url,
      scopes: [{ scopeName: 'read:all', scopeDescription: 'Read all data' }],
    }
  );

  const mainClient = apiUserPool.addClient('main', {
    userPoolClientName: 'main',
    generateSecret: true,
    authFlows: { userPassword: true, adminUserPassword: true },
    enableTokenRevocation: true,
    oAuth: {
      scopes: [cognito.OAuthScope.custom(api.url + '/read:all')],
      flows: { clientCredentials: true },
    },
  });

  mainClient.node.addDependency(resourceServer);

  const clientId = new sst.Config.Parameter(stack, 'clientId', {
    value: mainClient.userPoolClientId,
  });
  const clientSecret = new sst.Config.Secret(stack, 'clientSecret');

  const queryHello = libs.createLambda(stack, 'queryHello');
  queryHello.bind([
    userPoolDomainName,
    apiUrl,
    clientId,
    clientSecret,
    table,
    tableName,
  ]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

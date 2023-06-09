import * as models from '@appsync-api/core/models';
import { Handler } from 'aws-lambda';
import { Config } from 'sst/node/config';
import { gql, GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch';

const CLIENT_ID = Config.clientId;
const CLIENT_SECRET = Config.clientSecret;

const auth = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
  'base64'
)}`;

export const handler: Handler = async () => {
  try {
    const URL = `https://${Config.domainName}.auth.${process.env.AWS_REGION}.amazoncognito.com`;

    const raw = await fetch(URL + '/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token }: any = await raw.json();

    const client = new GraphQLClient(Config.apiUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const query = gql`
      query hello {
        hello
      }
    `;

    const data: any = await client.request(query);

    await seedData();

    return data.hello;
  } catch (error) {
    console.error(error);
  }
};

async function seedData() {
  await models.role
    .create({
      appName: 'my-app',
      roleName: 'admin',
      permissions: ['create', 'read', 'update', 'delete'],
    })
    .go();

  await models.role
    .create({
      appName: 'my-app',
      roleName: 'user',
      permissions: ['read'],
    })
    .go();

  await models.user
    .create({ orgName: 'org-1', userId: 'id-1', roles: ['role#admin'] })
    .go();

  await models.user
    .create({ orgName: 'org-1', userId: 'id-2', roles: ['role#user'] })
    .go();
}

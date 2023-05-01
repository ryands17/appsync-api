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

    return data.hello;
  } catch (error) {
    console.error(error);
  }
};

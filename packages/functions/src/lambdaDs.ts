import { AppSyncResolverHandler } from 'aws-lambda';
import { Time } from '@appsync-api/core/time';

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  const { identity } = event;

  if (identity && 'defaultAuthStrategy' in identity) {
    console.dir(identity.claims);
  }

  return `Hello world. The time is ${Time.now()}`;
};

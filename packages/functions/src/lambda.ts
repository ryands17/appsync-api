import { AppSyncResolverHandler } from 'aws-lambda';
import { Time } from '@appsync-api/core/time';

export const handler: AppSyncResolverHandler<any, any> = async (
  _event,
  context
) => {
  console.log('identity', context.identity);

  return `Hello world. The time is ${Time.now()}`;
};

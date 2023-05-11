import { AppSyncResolverHandler } from 'aws-lambda';
import { Time } from '@appsync-api/core/time';
import * as models from '@appsync-api/core/models';

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  const { identity } = event;

  if (identity && 'defaultAuthStrategy' in identity) {
    console.dir(identity.claims);
  }

  switch (event.info.fieldName) {
    case 'hello':
      return `Hello world. The time is ${Time.now()}`;
    case 'addRoleToUser':
      return await addRoleToUser({
        userId: event.arguments.userId,
        orgName: event.arguments.orgName,
        role: event.arguments.role,
      });
    case 'removeRoleFromUser':
      return await removeRoleFromUser({
        userId: event.arguments.userId,
        orgName: event.arguments.orgName,
        role: event.arguments.role,
      });
    case 'user':
      return await fetchUser({
        orgName: event.arguments.orgName,
        userId: event.arguments.userId,
      });
  }
};

async function fetchUser({
  orgName,
  userId,
}: {
  orgName: string;
  userId: string;
}) {
  let user = await models.user.get({ orgName, userId }).go();
  let roleName = user.data?.roles?.[0].replace('role#', '') || '';

  let role = await models.role.get({ appName: 'my-app', roleName }).go();

  return { ...user.data, permissions: role.data?.permissions };
}

async function addRoleToUser({
  userId,
  orgName,
  role,
}: {
  userId: string;
  orgName: string;
  role: string;
}) {
  await models.user
    .patch({ userId, orgName })
    .add({ roles: [role] })
    .go();

  return true;
}

async function removeRoleFromUser({
  userId,
  orgName,
  role,
}: {
  userId: string;
  orgName: string;
  role: string;
}) {
  await models.user
    .patch({ userId, orgName })
    .delete({ roles: [role] })
    .go();

  return true;
}

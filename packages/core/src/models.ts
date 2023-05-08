import { Entity } from 'electrodb';
import { Config } from 'sst/node/config';

const table = Config.tableName;

export const role = new Entity(
  {
    model: { entity: 'roles', version: '1', service: 'main' },
    attributes: {
      appName: { type: 'string', required: true },
      roleName: { type: 'string', required: true },
      permissions: { type: 'list', items: { type: 'string' } },
    },
    indexes: {
      role: {
        pk: { field: 'pk', template: 'app#${appName}', composite: ['appName'] },
        sk: {
          field: 'sk',
          template: 'role#${roleName}',
          composite: ['roleName'],
        },
      },
    },
  },
  { table }
);

export const user = new Entity(
  {
    model: { entity: 'users', version: '1', service: 'main' },
    attributes: {
      orgName: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      roles: { type: 'list', items: { type: 'string' } },
    },
    indexes: {
      user: {
        pk: { field: 'pk', template: 'org#${orgName}', composite: ['orgName'] },
        sk: {
          field: 'sk',
          template: 'user#${userId}',
          composite: ['userId'],
        },
      },
    },
  },
  { table }
);

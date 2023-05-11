import { Entity } from 'electrodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Config } from 'sst/node/config';

const table = Config.tableName;
const client = new DynamoDBClient({});

export const role = new Entity(
  {
    model: { entity: 'roles', version: '1', service: 'main' },
    attributes: {
      appName: { type: 'string', required: true },
      roleName: { type: 'string', required: true },
      permissions: { type: 'set', items: 'string' },
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
  { table, client }
);

export const user = new Entity(
  {
    model: { entity: 'users', version: '1', service: 'main' },
    attributes: {
      orgName: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      roles: { type: 'set', items: 'string' },
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
  { table, client }
);

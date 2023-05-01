import { SSTConfig } from 'sst';
import { API } from './stacks/AppSyncApi';

export default {
  config(_input) {
    return {
      name: 'appsync-api',
      region: 'eu-west-1',
    };
  },
  stacks(app) {
    app.stack(API);
  },
} satisfies SSTConfig;

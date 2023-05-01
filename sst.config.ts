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
    app.setDefaultFunctionProps({
      runtime: 'nodejs16.x',
      memorySize: 512,
      timeout: '10 seconds',
      architecture: 'arm_64',
    });

    app.stack(API);
  },
} satisfies SSTConfig;

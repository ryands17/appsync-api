import * as logs from 'aws-cdk-lib/aws-logs';
import { Function } from 'sst/constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export function createLambda(stack: Construct, name: string) {
  const fn = new Function(stack, name, {
    handler: `packages/functions/src/${name}.handler`,
  });

  new logs.LogGroup(stack, `${name}Logs`, {
    logGroupName: `/aws/lambda/${fn.functionName}`,
    retention: logs.RetentionDays.ONE_WEEK,
    removalPolicy: RemovalPolicy.DESTROY,
  });

  return fn;
}

export function createAppSyncLogGroup(
  stack: Construct,
  name: string,
  apiId: string
) {
  new logs.LogGroup(stack, `${name}Logs`, {
    logGroupName: `/aws/appsync/apis/${apiId}`,
    retention: logs.RetentionDays.ONE_WEEK,
    removalPolicy: RemovalPolicy.DESTROY,
  });
}

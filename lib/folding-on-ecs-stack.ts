import * as cdk from '@aws-cdk/core';
import {FoldingAtHome} from '@raykrueger/folding-on-ecs'

export class FoldingOnEcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = new FoldingAtHome(this, 'FoldingAtHome');
  }
}

import * as cdk from '@aws-cdk/core';
import {FoldingAtHome, FoldingAtHomeProps} from './folding-on-ecs-cluster'

export interface FoldingOnEcsStackProps extends cdk.StackProps {
  clusterProps?: FoldingAtHomeProps;
}

export class FoldingOnEcsStack extends cdk.Stack {

  public readonly cluster: FoldingAtHome;

  constructor(scope: cdk.Construct, id: string, props?: FoldingOnEcsStackProps) {
    super(scope, id, props);

    this.cluster = new FoldingAtHome(this, 'FoldingAtHome', props?.clusterProps);
  }
}

import {Construct, Duration} from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';

export interface FoldingAtHomeProps {
  /**
   * VPC to deploy to, this will override the maxAzs property.
   * @default None
   */
  vpc?: ec2.IVpc;

  /**
   * How many Availability Zones to use
   * @default 3
   */
  maxAzs?: number;

  /**
   * How many host instances should we launch?
   * @default 3
   */
  clusterSize?: number;

  /**
   * The maximum hourly price (in USD) to be paid for any Spot Instance launched to fulfill the request.
   * @default 0.50
   */
  spotPrice?: string;

  /**
   * The folding home container to run
   * @default raykrueger/folding-at-home
   */
  image?: ecs.ContainerImage;

  /**
   * The cloudwatch log stream prefix
   * @default 'folding'
   */
  streamPrefix?: string;

  /**
   * Should container insights be enabled?
   * @default false
   */
  containerInsights?: boolean;
}

/** 
 * Builds an ECS Cluster of g4dn.xlarge Spot instances to run the Folding at
 * Home container on. This Construct also includes building a new VPC to run the
 * cluster in. This can be overridden by passing a VPC instance into the
 * FoldingAtHomeProps.
 */
export class FoldingAtHome extends Construct {

  public static readonly DEFAULT_MAX_AZS = 3;
  public static readonly DEFAULT_CLUSTER_SIZE = 3;
  public static readonly DEFAULT_SPOT_PRICE = '0.52';
  public static readonly DEFAULT_IMAGE = 'raykrueger/folding-at-home';
  public static readonly DEFAULT_STREAM_PREFIX = 'folding';

  constructor(scope: Construct, id: string, props: FoldingAtHomeProps={}) {
    super(scope, id);

    props.maxAzs = props.maxAzs || FoldingAtHome.DEFAULT_MAX_AZS;
    props.streamPrefix = props.streamPrefix || FoldingAtHome.DEFAULT_STREAM_PREFIX;
    props.clusterSize = props.clusterSize || FoldingAtHome.DEFAULT_CLUSTER_SIZE;
    props.spotPrice = props.spotPrice || FoldingAtHome.DEFAULT_SPOT_PRICE;
    props.image = props.image || ecs.ContainerImage.fromRegistry(FoldingAtHome.DEFAULT_IMAGE);

    if (!props.vpc) {
      props.vpc = new ec2.Vpc(this, 'FoldingVPC', {
        maxAzs: props.maxAzs,
      });
    }
    const cluster = new ecs.Cluster(this, 'FoldingCluster', {
      vpc: props.vpc,
      capacity: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.G4DN, ec2.InstanceSize.XLARGE),
        spotPrice: props.spotPrice,
        taskDrainTime: Duration.seconds(0),
        machineImage: ecs.EcsOptimizedImage.amazonLinux2(ecs.AmiHardwareType.GPU),
        minCapacity: props.clusterSize,
      },
      containerInsights: props.containerInsights
    });

    const taskDef = new ecs.TaskDefinition(this, 'FoldingAtHomeTask', {
      compatibility: ecs.Compatibility.EC2
    });

    const containerDef = new ecs.ContainerDefinition(this, 'main', {
      image: props.image,
      taskDefinition: taskDef,
      memoryLimitMiB: 8192,
      gpuCount: 1,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: props.streamPrefix, logRetention: logs.RetentionDays.ONE_WEEK
      })
    });

    const foldingService = new ecs.Ec2Service(this, 'FoldingService', {
      cluster: cluster,
      taskDefinition: taskDef,
      daemon: true
    });

  }
}

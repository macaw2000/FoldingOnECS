import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import FoldingOnEcs = require('../lib/folding-on-ecs-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FoldingOnEcs.FoldingOnEcsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

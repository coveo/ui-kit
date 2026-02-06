import {test} from './fixture';

test.describe('atomic-insight-result-attach-to-case-indicator', () => {
  test.beforeEach(async ({attachToCaseIndicator}) => {
    await attachToCaseIndicator.load({story: 'default'});
  });
});

import {test} from './fixture';

test.describe('atomic-insight-result-attach-to-case-action', () => {
  test.beforeEach(async ({insightResultAttachToCaseAction}) => {
    await insightResultAttachToCaseAction.load();
  });

  // Add your tests here
  test('should render properly', async () => {
    // TODO: Add test implementation
  });
});

import {test} from './fixture';

test.describe('atomic-result-children', () => {
  test.beforeEach(async ({resultChildren}) => {
    await resultChildren.load();
  });

  // Add your tests here
  test('should render properly', async () => {
    // TODO: Add test implementation
  });
});

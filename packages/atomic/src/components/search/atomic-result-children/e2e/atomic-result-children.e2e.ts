import {expect, test} from './fixture';

test.describe('atomic-result-children', () => {
  test('should render when used within a folded result list', async ({
    resultChildren,
  }) => {
    await resultChildren.load({story: 'default'});
    await resultChildren.hydrated.first().waitFor();

    await expect(resultChildren.hydrated.first()).toBeVisible();
  });
});

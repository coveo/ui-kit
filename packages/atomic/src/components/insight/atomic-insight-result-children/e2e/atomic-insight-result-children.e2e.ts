import {expect, test} from './fixture';

test.describe('atomic-insight-result-children', () => {
  test.beforeEach(async ({insightResultChildren}) => {
    await insightResultChildren.load({story: 'default'});
    await insightResultChildren.hydrated.first().waitFor();
  });

  test('should render child results when available', async ({
    insightResultChildren,
  }) => {
    await expect(insightResultChildren.childrenRoot.first()).toBeVisible();
  });
});

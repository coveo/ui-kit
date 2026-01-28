import {expect, test} from './fixture';

test.describe('atomic-insight-result-children', () => {
  test('should render when used within a folded result list', async ({
    insightResultChildren,
  }) => {
    await insightResultChildren.load({story: 'default'});
    await insightResultChildren.hydrated.first().waitFor();

    await expect(insightResultChildren.hydrated.first()).toBeVisible();
  });

  test('should display child results when available', async ({
    insightResultChildren,
  }) => {
    await insightResultChildren.load({story: 'default'});
    await insightResultChildren.hydrated.first().waitFor();

    await expect(insightResultChildren.childrenRoot.first()).toBeVisible();
  });

  test('should render with inherited templates', async ({
    insightResultChildren,
  }) => {
    await insightResultChildren.load({story: 'with-inherit-templates'});
    await insightResultChildren.hydrated.first().waitFor();

    await expect(insightResultChildren.hydrated.first()).toBeVisible();
  });
});

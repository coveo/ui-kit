import {expect, test} from './fixture';

test.describe('atomic-pager', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load();
    await pager.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should exist in DOM with correct attributes', async ({pager}) => {
    const pagerElement = pager.hydrated;

    await expect(pagerElement).toBeAttached();
  });
});

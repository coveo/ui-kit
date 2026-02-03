import {expect, test} from './fixture';

test.describe('atomic-insight-result-attach-to-case-indicator', () => {
  test.beforeEach(async ({attachToCaseIndicator}) => {
    await attachToCaseIndicator.load({story: 'default'});
  });

  test('should be accessible in the page', async ({attachToCaseIndicator}) => {
    await expect(
      attachToCaseIndicator.page.locator('atomic-insight-interface')
    ).toBeVisible();
  });
});

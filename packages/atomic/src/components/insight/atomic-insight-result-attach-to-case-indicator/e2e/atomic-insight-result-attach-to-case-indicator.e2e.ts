import {expect, test} from './fixture';

test.describe('atomic-insight-result-attach-to-case-indicator', () => {
  test.beforeEach(async ({attachToCaseIndicator}) => {
    await attachToCaseIndicator.load({story: 'default'});
  });

  test('should display the attach icon when result is attached to case', async ({
    attachToCaseIndicator,
  }) => {
    await expect(attachToCaseIndicator.resultList).toBeVisible();
    await expect(attachToCaseIndicator.results.first()).toBeVisible();
    await expect(attachToCaseIndicator.icon.first()).toBeVisible();
  });

  test('should not display the attach icon when result is not attached to case', async ({
    attachToCaseIndicator,
  }) => {
    await expect(attachToCaseIndicator.resultList).toBeVisible();
    await expect(attachToCaseIndicator.results.first()).toBeVisible();

    const secondResultIndicator = attachToCaseIndicator.page.locator(
      'atomic-insight-result:nth-of-type(2) atomic-insight-result-attach-to-case-indicator [part="icon"]'
    );
    await expect(secondResultIndicator).not.toBeVisible();
  });
});

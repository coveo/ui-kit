import {expect, test} from './fixture';

test.describe('atomic-query-error', () => {
  test.beforeEach(async ({queryError}) => {
    await queryError.load();
  });

  test('should be accessible', async ({queryError, makeAxeBuilder}) => {
    await queryError.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display an error title', async ({queryError}) => {
    await expect(queryError.title).toBeVisible();
  });

  test('should display an error description', async ({queryError}) => {
    await expect(queryError.description).toBeVisible();
  });

  test('should display an icon', async ({queryError}) => {
    await expect(queryError.icon).toBeVisible();
  });

  test('should render a show more info button that displays error information on click', async ({
    queryError,
  }) => {
    await queryError.moreInfoButton.click();
    await expect(queryError.moreInfoMessage).toBeVisible();
  });
});

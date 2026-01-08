import {expect, test} from './fixture';

test.describe('atomic-insight-query-error', () => {
  test.beforeEach(async ({insightQueryError}) => {
    await insightQueryError.load();
  });

  test('should display the component with the correct content', async ({
    insightQueryError,
  }) => {
    await expect(insightQueryError.title).toBeVisible();
    await expect(insightQueryError.description).toBeVisible();
    await expect(insightQueryError.moreInfoButton).toBeVisible();
  });

  test('should display an icon', async ({insightQueryError}) => {
    await expect(insightQueryError.icon).toBeVisible();
  });

  test('should render a show more info button that displays error information on click', async ({
    insightQueryError,
  }) => {
    await insightQueryError.moreInfoButton.click();
    await expect(insightQueryError.moreInfoMessage).toBeVisible();
  });
});

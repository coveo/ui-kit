import {expect, test} from './fixture';

test.describe('atomic-recs-error', () => {
  test.beforeEach(async ({recsError}) => {
    await recsError.load();
  });

  test('should display the component with the correct content', async ({
    recsError,
  }) => {
    await expect(recsError.title).toBeVisible();
    await expect(recsError.description).toBeVisible();
    await expect(recsError.moreInfoButton).toBeVisible();
  });

  test('should display an error description', async ({recsError}) => {
    await expect(recsError.description).toBeVisible();
  });

  test('should display an icon', async ({recsError}) => {
    await expect(recsError.icon).toBeVisible();
  });

  test('should render a show more info button that displays error information on click', async ({
    recsError,
  }) => {
    await recsError.moreInfoButton.click();
    await expect(recsError.moreInfoMessage).toBeVisible();
  });
});

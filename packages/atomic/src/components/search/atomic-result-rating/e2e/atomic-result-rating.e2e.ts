import {expect, test} from './fixture';

test.describe('atomic-result-rating', () => {
  test.beforeEach(async ({resultRating}) => {
    await resultRating.load();
    await resultRating.hydrated.first().waitFor();
  });

  test('should render the rating correctly', async ({resultRating}) => {
    const ratingContainer = resultRating.ratingContainer;
    await expect(ratingContainer).toBeVisible();

    const icons = resultRating.ratingIcons;
    await expect(icons.first()).toBeVisible();
  });
});

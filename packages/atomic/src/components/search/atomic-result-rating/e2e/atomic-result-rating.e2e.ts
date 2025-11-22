import {expect, test} from './fixture';

test.describe('atomic-result-rating', () => {
  test.beforeEach(async ({resultRating}) => {
    await resultRating.load();
    await resultRating.hydrated.first().waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should render the rating correctly', async ({resultRating}) => {
    const ratingContainer = resultRating.ratingContainer;
    await expect(ratingContainer).toBeVisible();
    
    // Check that the rating icons are rendered
    const icons = resultRating.ratingIcons;
    await expect(icons.first()).toBeVisible();
  });
});

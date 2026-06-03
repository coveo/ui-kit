import {expect, test} from './fixture';

test.describe('atomic-commerce-recommendation-list', () => {
  test.beforeEach(async ({recommendationList}) => {
    await recommendationList.load();
    await recommendationList.hydrated.waitFor();
  });

  test('should have recommendations', async ({recommendationList}) => {
    await expect(recommendationList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a carousel', () => {
  test.beforeEach(async ({recommendationList}) => {
    await recommendationList.load({story: 'as-carousel'});
    await recommendationList.hydrated.waitFor();
    await expect(recommendationList.recommendation.first()).toBeVisible();
  });

  test('should support going forward and backward', async ({
    recommendationList,
  }) => {
    await recommendationList.nextButton.click();
    await expect(recommendationList.indicators.nth(1)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await recommendationList.prevButton.click();
    await expect(recommendationList.indicators.nth(0)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await recommendationList.prevButton.click();
    await expect(recommendationList.indicators.nth(1)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });
});

import {expect, test} from './fixture';

test.describe('before query is loaded', () => {
  test.beforeEach(async ({recsList, page}) => {
    await recsList.load({story: 'recs-before-query'});
    await recsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should have placeholders', async ({recsList}) => {
    await expect(recsList.placeholder.first()).toBeVisible();
  });
});

test.describe('after query is loaded', () => {
  test.beforeEach(async ({recsList, page}) => {
    await recsList.load({story: 'default'});
    await recsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should have recommendations', async ({recsList}) => {
    await expect(recsList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a full result template', () => {
  test.beforeEach(async ({recsList, page}) => {
    await recsList.load({story: 'recs-with-full-template'});
    await recsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should have recommendations', async ({recsList}) => {
    await expect(recsList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a carousel', () => {
  test.beforeEach(async ({recsList, page}) => {
    await recsList.load({story: 'recs-as-carousel'});
    await recsList.hydrated.waitFor();
    await recsList.recommendation.first().waitFor({state: 'visible'});
    await page.waitForLoadState('networkidle');
  });

  test('should have recommendations', async ({recsList}) => {
    await expect(recsList.recommendation.first()).toBeVisible();
  });

  test('should support going forward and backward', async ({recsList}) => {
    await recsList.nextButton.click();
    await expect(recsList.indicators.nth(1)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await recsList.prevButton.click();
    await recsList.prevButton.click();
    await expect(recsList.indicators.last()).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await recsList.nextButton.click();
    await expect(recsList.indicators.first()).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });
});

test.describe('when there are not enough recommendations for multiple pages', () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load({story: 'not-enough-recs-for-carousel'});
  });

  test('should have recommendations', async ({recsList}) => {
    await expect(recsList.recommendation.first()).toBeVisible();
  });

  test('should not display forward and backward buttons', async ({
    recsList,
  }) => {
    await expect(recsList.nextButton).not.toBeVisible();
    await expect(recsList.prevButton).not.toBeVisible();
    await expect(recsList.indicators.first()).not.toBeVisible();
  });
});

test.describe('when recommendations open in a new tab', async () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load({story: 'recs-opening-in-new-tab'});
    await recsList.hydrated.waitFor();
  });

  test('should open a single tab when clicking a recommendation', async ({
    recsList,
    context,
  }) => {
    const pagePromise = context.waitForEvent('page');
    await recsList.recommendation.first().click();
    await pagePromise;

    expect(context.pages().length).toBe(2);
  });
});

test('with no recommendations returned by the API, should render placeholders', async ({
  recsList,
  page,
}) => {
  await recsList.load({story: 'no-recommendation'});
  await recsList.hydrated.waitFor();

  await page.waitForLoadState('networkidle');
  await expect(recsList.placeholder.first()).toBeVisible();
});

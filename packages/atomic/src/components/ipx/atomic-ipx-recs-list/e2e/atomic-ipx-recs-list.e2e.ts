import {expect, test} from './fixture';

test.describe('before query is loaded', () => {
  test.beforeEach(async ({ipxRecsList, page}) => {
    await ipxRecsList.load({story: 'recs-before-query'});
    await ipxRecsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should have placeholders', async ({ipxRecsList}) => {
    await expect(ipxRecsList.placeholder.first()).toBeVisible();
  });
});

test.describe('after query is loaded', () => {
  test.beforeEach(async ({ipxRecsList, page}) => {
    await ipxRecsList.load({story: 'default'});
    await ipxRecsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should have recommendations', async ({ipxRecsList}) => {
    await expect(ipxRecsList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a full result template', () => {
  test.beforeEach(async ({ipxRecsList, page}) => {
    await ipxRecsList.load({story: 'recs-with-full-template'});
    await ipxRecsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should have recommendations', async ({ipxRecsList}) => {
    await expect(ipxRecsList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a carousel', () => {
  test.beforeEach(async ({ipxRecsList, page}) => {
    await ipxRecsList.load({story: 'recs-as-carousel'});
    await ipxRecsList.hydrated.waitFor();
    await ipxRecsList.recommendation.first().waitFor({state: 'visible'});
    await page.waitForLoadState('networkidle');
  });

  test('should have recommendations', async ({ipxRecsList}) => {
    await expect(ipxRecsList.recommendation.first()).toBeVisible();
  });

  test('should support going forward and backward', async ({ipxRecsList}) => {
    await ipxRecsList.nextButton.click();
    await expect(ipxRecsList.indicators.nth(1)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await ipxRecsList.prevButton.click();
    await ipxRecsList.prevButton.click();
    await expect(ipxRecsList.indicators.last()).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await ipxRecsList.nextButton.click();
    await expect(ipxRecsList.indicators.first()).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });
});

test.describe('when there are not enough recommendations for multiple pages', () => {
  test.beforeEach(async ({ipxRecsList}) => {
    await ipxRecsList.load({story: 'not-enough-recs-for-carousel'});
  });

  test('should have recommendations', async ({ipxRecsList}) => {
    await expect(ipxRecsList.recommendation.first()).toBeVisible();
  });

  test('should not display forward and backward buttons', async ({
    ipxRecsList,
  }) => {
    await expect(ipxRecsList.nextButton).not.toBeVisible();
    await expect(ipxRecsList.prevButton).not.toBeVisible();
    await expect(ipxRecsList.indicators.first()).not.toBeVisible();
  });
});

test.describe('when recommendations open in a new tab', () => {
  test.beforeEach(async ({ipxRecsList}) => {
    await ipxRecsList.load({story: 'recs-opening-in-new-tab'});
    await ipxRecsList.hydrated.waitFor();
  });

  test('should open a single tab when clicking a recommendation', async ({
    ipxRecsList,
    context,
  }) => {
    const pagePromise = context.waitForEvent('page');
    await ipxRecsList.recommendation.first().click();
    await pagePromise;

    expect(context.pages().length).toBe(2);
  });
});

test('with no recommendations returned by the API, should render placeholders', async ({
  ipxRecsList,
  page,
}) => {
  await ipxRecsList.load({story: 'no-recommendations'});
  await ipxRecsList.hydrated.waitFor();

  await page.waitForLoadState('networkidle');
  await expect(ipxRecsList.placeholder.first()).toBeVisible();
});

test.describe('with label', () => {
  test.beforeEach(async ({ipxRecsList, page}) => {
    await ipxRecsList.load({story: 'with-label'});
    await ipxRecsList.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test('should display the label', async ({ipxRecsList}) => {
    await expect(ipxRecsList.label).toBeVisible();
    await expect(ipxRecsList.label).toHaveText('Recommended for you');
  });
});

import {test, expect} from './fixture';

test.describe('before query is loaded', () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load({story: 'recs-before-query'});
    await recsList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have placeholders', async ({recsList}) => {
    await expect(recsList.placeholder.first()).toBeVisible();
  });
});

test.describe('after query is loaded', () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load({story: 'default'});
    await recsList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have recommendations', async ({recsList}) => {
    await expect(recsList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a full result template', () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load({story: 'recs-with-full-template'});
    await recsList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have recommendations', async ({recsList}) => {
    await expect(recsList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a carousel', () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load({story: 'recs-as-carousel'});
    await recsList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
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
    await expect(recsList.indicators.nth(2)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await recsList.nextButton.click();
    await expect(recsList.indicators.nth(0)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });
});

test.describe('when there are no enough recommendations for multiple pages', () => {
  test.beforeEach(async ({recsList, page}) => {
    await recsList.nRecommendations(3);
    await recsList.load({story: 'recs-as-carousel'});
    await page.waitForLoadState('networkidle');
  });

  test('should not display forward and backward buttons', async ({
    recsList,
  }) => {
    await expect(recsList.nextButton).not.toBeVisible();
    await expect(recsList.prevButton).not.toBeVisible();
    await expect(recsList.indicators.first()).not.toBeVisible();
  });
});

test('with no recommendations returned by the API, should render placeholders', async ({
  recsList,
  page,
}) => {
  await recsList.noRecommendations();
  await recsList.load({story: 'default'});
  await recsList.hydrated.waitFor();

  await page.waitForLoadState('networkidle');
  await expect(recsList.placeholder.first()).toBeVisible();
});

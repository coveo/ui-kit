import {test, expect} from './fixture';

test.describe('before query is loaded', () => {
  test.beforeEach(async ({recommendationList}) => {
    await recommendationList.load({story: 'before-query'});
    await recommendationList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have placeholders', async ({recommendationList}) => {
    await expect(recommendationList.placeholder.first()).toBeVisible();
  });
});

test.describe('after query is loaded', () => {
  test.beforeEach(async ({recommendationList}) => {
    await recommendationList.load({story: 'default'});
    await recommendationList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have recommendations', async ({recommendationList}) => {
    await expect(recommendationList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a full result template', () => {
  test.beforeEach(async ({recommendationList}) => {
    await recommendationList.load({story: 'with-full-template'});
    await recommendationList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have recommendations', async ({recommendationList}) => {
    await expect(recommendationList.recommendation.first()).toBeVisible();
  });
});

test.describe('with a carousel', () => {
  test.beforeEach(async ({recommendationList}) => {
    await recommendationList.load({story: 'as-carousel'});
    await recommendationList.hydrated.waitFor();
  });

  test('should be a11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have recommendations', async ({recommendationList}) => {
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
    await recommendationList.prevButton.click();
    await expect(recommendationList.indicators.nth(3)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );

    await recommendationList.nextButton.click();
    await expect(recommendationList.indicators.nth(0)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });
});

test('with no recommendations returned by the API, should render placeholders', async ({
  recommendationList,
}) => {
  await recommendationList.noRecommendations();
  await recommendationList.load({story: 'default'});
  await recommendationList.hydrated.waitFor({state: 'hidden'});
  await expect
    .poll(async () => await recommendationList.recommendation.count())
    .toBe(0);
  await expect
    .poll(async () => await recommendationList.placeholder.count())
    .toBe(0);
});

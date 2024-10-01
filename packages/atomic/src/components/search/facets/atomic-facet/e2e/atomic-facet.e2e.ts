import {test, expect} from './fixture';

test.describe('when selecting the facet search "More matches for" button', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'low-facet-values'});
  });
  test('should display an increasing number of matches', async ({facet}) => {
    await facet.facetSearch.click();
    await facet.facetSearch.pressSequentially('p');
    await expect
      .poll(async () => {
        return await facet.facetValue.count();
      })
      .toBeGreaterThanOrEqual(2);

    await facet.facetSearchMoreMatchesFor.click();
    await expect
      .poll(async () => {
        return await facet.facetValue.count();
      })
      .toBeGreaterThanOrEqual(4);

    await facet.facetSearchMoreMatchesFor.click();
    await expect
      .poll(async () => {
        return await facet.facetValue.count();
      })
      .toBeGreaterThanOrEqual(6);
  });
});

test.describe('when the "Show more" button has not been selected', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'month-facet'});
    await facet.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should not display the "Show less" button', async ({facet}) => {
    await expect(facet.showLessButton).toBeHidden();
  });

  test.describe('when additional facet values are available', () => {
    test('should display the "Show more" button', async ({facet}) => {
      await expect(facet.showMoreButton).toBeVisible();
    });

    test('should have the configured number of facet values', async ({
      facet,
    }) => {
      await expect.poll(async () => await facet.facetValue.count()).toBe(2);
    });
  });

  test.describe('when no additional facet values are available', () => {
    test.beforeEach(async ({facet}) => {
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
    });

    test('should not display the "Show more" button', async ({facet}) => {
      await expect(facet.showMoreButton).toBeHidden();
    });

    test('should have as many as the configured number of facet values', async ({
      facet,
    }) => {
      await expect.poll(async () => await facet.facetValue.count()).toBe(12);
    });
  });
});

test.describe('when the "Show more" button has been selected', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'month-facet'});
    await facet.showMoreButton.click();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should have facet values sorted alphabetically', async ({facet}) => {
    await expect.poll(async () => await facet.facetValue.count()).toBe(4);
    const values = await facet.facetValue.allTextContents();
    const sortedValues = [...values].sort();
    expect(values).toEqual(sortedValues);
  });

  test.describe('when additional facet values are available', () => {
    test('should display the "Show more" button', async ({facet}) => {
      await expect(facet.showMoreButton).toBeVisible();
    });

    test('should have the configured number of facet values * (1 + the number of times the button was selected)', async ({
      facet,
    }) => {
      await facet.showMoreButton.click();
      await expect.poll(async () => await facet.facetValue.count()).toBe(6);
    });
  });

  test.describe('when no additional facet values are available', () => {
    test.beforeEach(async ({facet}) => {
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
      await facet.showMoreButton.click();
    });

    test('should have the total number of available facet values', async ({
      facet,
    }) => {
      await expect.poll(async () => await facet.facetValue.count()).toBe(12);
    });

    test('should not display the "Show more" button', async ({facet}) => {
      await expect(facet.showMoreButton).toBeHidden();
    });

    test('should display the "Show less" button', async ({facet}) => {
      await expect(facet.showLessButton).toBeVisible();
    });
  });

  test.describe('when the "Show less" button is selected', () => {
    test.beforeEach(async ({facet}) => {
      await facet.showLessButton.click();
    });

    test('should not display the "Show less" button', async ({facet}) => {
      await expect(facet.showLessButton).toBeHidden();
    });

    test('should display the "Show more" button', async ({facet}) => {
      await expect(facet.showMoreButton).toBeVisible();
    });

    test('should have the configured number of facet values', async ({
      facet,
    }) => {
      await expect.poll(async () => await facet.facetValue.count()).toBe(2);
    });
  });
});

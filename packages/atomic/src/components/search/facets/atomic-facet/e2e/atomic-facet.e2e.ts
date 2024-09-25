import {test, expect} from './fixture';

test.describe('when clicking facet search "More matches for"', () => {
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

test.describe('when selecting the "Show more" button', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'low-facet-values'});
    await facet.showMoreButton.click();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should still display the "Show more" button', async ({facet}) => {
    await expect(facet.showMoreButton).toBeVisible();
  });

  test('should display the "Show less" button', async ({facet}) => {
    await expect(facet.showLessButton).toBeVisible();
  });

  test('should have values sorted alphabetically', async ({facet}) => {
    await expect.poll(async () => await facet.facetValue.count()).toBe(4);
    const values = await facet.facetValue.allTextContents();

    const sortedValues = [...values].sort();
    expect(values).toEqual(sortedValues);
  });

  test('should increment and decrement the right amount of facet values', async ({
    facet,
  }) => {
    await expect.poll(async () => await facet.facetValue.count()).toBe(4);
    await facet.showMoreButton.click();
    await expect.poll(async () => await facet.facetValue.count()).toBe(6);

    await facet.showLessButton.click();
    await expect.poll(async () => await facet.facetValue.count()).toBe(2);
    await expect(facet.showLessButton).toBeHidden();
  });
});

test('when there\'s no more "Show more" button', async ({facet}) => {
  await facet.load({story: 'month-facet'});

  await expect(facet.showMoreButton).toBeHidden();
  await expect(facet.showLessButton).toBeHidden();
});

import type {FacetSortCriterion} from '@coveo/headless';
import {orderBy} from 'natural-orderby';
import {expect, test} from './fixture';

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
});

test.describe('when the "Show more" button has been selected', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'month-facet'});
    await facet.showMoreButton.click();
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
});

const sortCriteriaTests: {
  criteria: FacetSortCriterion;
  sortFunction: (values: string[]) => string[];
}[] = [
  {
    criteria: 'alphanumeric',
    sortFunction: (values: string[]) => [...values].sort(),
  },
  {
    criteria: 'alphanumericDescending',
    sortFunction: (values: string[]) => [...values].sort().reverse(),
  },
  {
    criteria: 'alphanumericNatural',
    sortFunction: (values: string[]) =>
      orderBy([...values], [(value: string) => value], 'asc'),
  },
  {
    criteria: 'alphanumericNaturalDescending',
    sortFunction: (values: string[]) =>
      orderBy([...values], [(value: string) => value], ['desc']),
  },
];

test.describe('Sort Criteria', () => {
  for (const {criteria, sortFunction} of sortCriteriaTests) {
    test.describe(`when sort criteria is set to "${criteria}"`, () => {
      test.beforeEach(async ({facet}) => {
        await facet.load({
          args: {
            sortCriteria: criteria,
            field: 'cat_available_sizes',
            label: 'Size',
            numberOfValues: 30,
          },
        });
        await facet.hydrated.waitFor();
        await expect.poll(async () => await facet.facetValue.count()).toBe(30);
      });

      test(`should have facet values sorted by ${criteria}`, async ({
        facet,
      }) => {
        const values = await facet.facetValueLabel.allTextContents();
        const sortedValues = sortFunction(values);
        expect(values).toEqual(sortedValues);
      });

      test.describe('when a custom sort order is set', () => {
        test.beforeEach(async ({facet}) => {
          await facet.load({
            story: 'custom-sort',
            args: {
              sortCriteria: criteria,
              field: 'cat_available_sizes',
              numberOfValues: 30,
            },
          });
          await facet.hydrated.waitFor();
          await expect
            .poll(async () => await facet.facetValue.count())
            .toBe(30);
        });

        // biome-ignore lint/suspicious/noTemplateCurlyInString: <>
        test('should have facet values sorted by custom order first, and then by ${criteria}', async ({
          facet,
        }) => {
          const values = await facet.facetValueLabel.allTextContents();

          const customSort = new Set(['XL', 'L', 'M', 'S']);

          const customSortedValues = values.filter((value) =>
            customSort.has(value)
          );
          const remainingValues = sortFunction(
            values.filter((value) => !customSort.has(value))
          );

          expect(values).toEqual([...customSortedValues, ...remainingValues]);
        });
      });
    });
  }

  test.describe('when sort criteria is set to "occurrences"', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({
        args: {
          sortCriteria: 'occurrences',
          field: 'cat_available_sizes',
          label: 'Size',
          numberOfValues: 30,
        },
      });
      await facet.hydrated.waitFor();
      await expect.poll(async () => await facet.facetValue.count()).toBe(30);
    });

    test('should have facet values sorted by occurrences', async ({facet}) => {
      const values = await facet.facetValueOccurrences.allTextContents();
      const sortedValues = [...values]
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
          const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
          return numA - numB;
        })
        .reverse();
      expect(values).toEqual(sortedValues);
    });
  });
  test.describe('when sort criteria is set to "automatic"', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({
        args: {
          sortCriteria: 'automatic',
          field: 'ec_brand',
          label: 'Brand',
          numberOfValues: 10,
        },
      });
      await facet.hydrated.waitFor();
      await expect.poll(async () => await facet.facetValue.count()).toBe(10);
    });

    test('should have facet values sorted by occurrences when not expanded', async ({
      facet,
    }) => {
      const values = await facet.facetValueOccurrences.allTextContents();
      const sortedValues = [...values]
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
          const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
          return numA - numB;
        })
        .reverse();
      expect(values).toEqual(sortedValues);
    });

    test.describe('when expanded', () => {
      test.beforeEach(async ({facet}) => {
        await facet.showMoreButton.click();
        await expect.poll(async () => await facet.facetValue.count()).toBe(20);
      });

      test('should have facet values sorted alphanumerically when expanded', async ({
        facet,
      }) => {
        const values = await facet.facetValueLabel.allTextContents();
        const sortedValues = [...values].sort();
        expect(values).toEqual(sortedValues);
      });
    });
  });
});

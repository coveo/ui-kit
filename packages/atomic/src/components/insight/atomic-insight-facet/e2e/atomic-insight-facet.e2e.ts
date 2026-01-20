import type {FacetSortCriterion} from '@coveo/headless/insight';
import {orderBy} from 'natural-orderby';
import {expect, test} from './fixture';

test.describe('when the "Show more" button has not been selected', () => {
  test.beforeEach(async ({insightFacet}) => {
    await insightFacet.load({story: 'low-facet-values'});
    await insightFacet.hydrated.waitFor();
  });

  test('should display the correct number of facet values', async ({
    insightFacet,
  }) => {
    await expect
      .poll(async () => await insightFacet.facetValue.count())
      .toBe(2);
  });
});

test.describe('when the "Show more" button has been selected', () => {
  test.beforeEach(async ({insightFacet}) => {
    await insightFacet.load({story: 'low-facet-values'});
    await insightFacet.showMoreButton.click();
  });

  test('should display additional facet values', async ({insightFacet}) => {
    await expect
      .poll(async () => await insightFacet.facetValue.count())
      .toBeGreaterThan(2);
  });

  test.describe('when additional facet values are available', () => {
    test('should display the "Show more" button', async ({insightFacet}) => {
      await expect(insightFacet.showMoreButton).toBeVisible();
    });
  });
});

test.describe('when a facet value is selected', () => {
  test.beforeEach(async ({insightFacet}) => {
    await insightFacet.load({story: 'default'});
    await insightFacet.hydrated.waitFor();
  });

  test('should display the clear button', async ({insightFacet}) => {
    const firstValue = insightFacet.facetValue.first();
    await firstValue.click();
    await expect(insightFacet.clearButton).toBeVisible();
  });
});

test.describe('display modes', () => {
  test('should render facet values as checkboxes by default', async ({
    insightFacet,
  }) => {
    await insightFacet.load({story: 'default'});
    await insightFacet.hydrated.waitFor();
    const checkbox = insightFacet.page.locator('[part~="value-checkbox"]');
    await expect(checkbox.first()).toBeVisible();
  });

  test('should render facet values as links when displayValuesAs is "link"', async ({
    insightFacet,
  }) => {
    await insightFacet.load({story: 'as-link'});
    await insightFacet.hydrated.waitFor();
    const link = insightFacet.page.locator('[part~="value-link"]');
    await expect(link.first()).toBeVisible();
  });

  test('should render facet values as boxes when displayValuesAs is "box"', async ({
    insightFacet,
  }) => {
    await insightFacet.load({story: 'as-box'});
    await insightFacet.hydrated.waitFor();
    const box = insightFacet.page.locator('[part~="value-box"]');
    await expect(box.first()).toBeVisible();
  });
});

test.describe('with exclusion enabled', () => {
  test.beforeEach(async ({insightFacet}) => {
    await insightFacet.load({story: 'with-exclusion'});
    await insightFacet.hydrated.waitFor();
  });

  test('should display exclusion buttons for selected values', async ({
    insightFacet,
  }) => {
    const firstValue = insightFacet.facetValue.first();
    await firstValue.click();
    const excludeButton = insightFacet.page.locator(
      '[part~="value-exclude-button"]'
    );
    await expect(excludeButton.first()).toBeVisible();
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
      test.beforeEach(async ({insightFacet}) => {
        await insightFacet.load({
          args: {
            sortCriteria: criteria,
            field: 'objecttype',
            label: 'Type',
            numberOfValues: 8,
          },
        });
        await insightFacet.hydrated.waitFor();
      });

      test(`should have facet values sorted by ${criteria}`, async ({
        insightFacet,
      }) => {
        const values = await insightFacet.facetValueLabel.allTextContents();
        const sortedValues = sortFunction(values);
        expect(values).toEqual(sortedValues);
      });
    });
  }

  test.describe('when sort criteria is set to "occurrences"', () => {
    test.beforeEach(async ({insightFacet}) => {
      await insightFacet.load({
        args: {
          sortCriteria: 'occurrences',
          field: 'objecttype',
          label: 'Type',
          numberOfValues: 8,
        },
      });
      await insightFacet.hydrated.waitFor();
    });

    test('should have facet values sorted by occurrences', async ({
      insightFacet,
    }) => {
      const values = await insightFacet.facetValueOccurrences.allTextContents();
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
    test.beforeEach(async ({insightFacet}) => {
      await insightFacet.load({
        args: {
          sortCriteria: 'automatic',
          field: 'objecttype',
          label: 'Type',
          numberOfValues: 8,
        },
      });
      await insightFacet.hydrated.waitFor();
    });

    test('should have facet values sorted by occurrences when not expanded', async ({
      insightFacet,
    }) => {
      const values = await insightFacet.facetValueOccurrences.allTextContents();
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
      test.beforeEach(async ({insightFacet}) => {
        await insightFacet.showMoreButton.click();
      });

      test('should have facet values sorted alphanumerically when expanded', async ({
        insightFacet,
      }) => {
        const values = await insightFacet.facetValueLabel.allTextContents();
        const sortedValues = [...values].sort();
        expect(values).toEqual(sortedValues);
      });
    });
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({insightFacet}) => {
    await insightFacet.load({story: 'default'});
    await insightFacet.hydrated.waitFor();

    await expect(insightFacet.component).toMatchAriaSnapshot(`
      - group:
        - button "Expand the objecttype facet"
        - group "objecttype facet values":
          - list:
            - listitem
            - listitem
            - listitem
            - listitem
            - listitem
            - listitem
            - listitem
            - listitem
        - button "Show more"
    `);
  });
});

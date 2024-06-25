import {test, expect} from './fixture';

test.describe('atomic-commerce-products-per-page', () => {
  test.describe('with default parameters', () => {
    test.beforeEach(async ({productsPerPage}) => {
      await productsPerPage.load(undefined, 'in-page');
    });

    test('should be A11y compliant', async ({
      productsPerPage,
      makeAxeBuilder,
    }) => {
      await productsPerPage.hydrated.waitFor();
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
    });

    test('should execute the first query with the default number of products', async ({
      querySummary,
    }) => {
      await expect(
        querySummary
          .querySummary({indexOfFirstResult: 1, indexOfLastResults: 10})
          .first()
      ).toBeVisible();
    });

    test.describe('when selecting a different number of products', () => {
      test.beforeEach(async ({productsPerPage}) => {
        await productsPerPage.choice(25).click();
      });

      test('should render the component with the right choice selected', async ({
        productsPerPage,
      }) => {
        await expect(productsPerPage.label().first()).toBeVisible();
        await expect(productsPerPage.choice(25)).toBeChecked();
      });

      test('should execute a query with the selected number of products', async ({
        querySummary,
      }) => {
        await expect(
          querySummary.querySummary({indexOfLastResults: 25}).first()
        ).toBeVisible();
      });
    });
  });

  test.describe('when the initial choice is not in the list of choicesDisplayed', () => {
    test.beforeEach(async ({productsPerPage}) => {
      await productsPerPage.load({initialChoice: 59});
    });

    test('should not render the component', async ({productsPerPage}) => {
      await expect(productsPerPage.label()).not.toBeVisible();
    });
  });

  test.describe('when a valid initial choice is provided', () => {
    test.beforeEach(async ({productsPerPage}) => {
      await productsPerPage.load({initialChoice: 25}, 'in-page');
    });

    test('should render the component with the right initial choice selected', async ({
      productsPerPage,
    }) => {
      await expect(productsPerPage.label().first()).toBeVisible();
      await expect(productsPerPage.choice(25)).toBeChecked();
    });

    test('should execute the first query with the selected number of products', async ({
      querySummary,
    }) => {
      await expect(
        querySummary.querySummary({indexOfLastResults: 25}).first()
      ).toBeVisible();
    });
  });
});

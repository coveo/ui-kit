import {test, expect} from './fixture';

test.describe('atomic-commerce-product-list', () => {
  test.describe('when #display is set to "grid"', () => {
    test('should render placeholders before the query returns', async ({
      productList,
    }) => {
      await productList.load({story: 'grid-display-before-query'});

      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(4);
      await expect(productList.placeholders.first()).toBeVisible();
    });

    test.describe('when the query returns products', () => {
      test('should be a11y compliant', async ({
        productList,
        makeAxeBuilder,
      }) => {
        await productList.load({story: 'default'});

        const accessibilityResults = await makeAxeBuilder().analyze();
        expect(accessibilityResults.violations.length).toEqual(0);
      });

      test('should render the products when there is no custom template', async ({
        productList,
      }) => {
        await productList.load({story: 'default'});

        await expect
          .poll(async () => await productList.products.count())
          .toBeGreaterThan(0);
        for (const product of await productList.products.all()) {
          await expect(product).toBeVisible();
        }
      });

      test('should render the products when there is a custom template', async ({
        productList,
      }) => {
        await productList.load({story: 'grid-display-with-template'});

        await expect
          .poll(async () => await productList.excerpts.count())
          .toBeGreaterThan(0);
        for (const product of await productList.excerpts.all()) {
          await expect(product).toBeVisible();
        }
      });
    });
  });

  test.describe('when #display is set to "list"', () => {
    test('should render placeholders before the query returns', async ({
      productList,
    }) => {
      await productList.load({story: 'list-display-before-query'});

      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(4);
      await expect(productList.placeholders.first()).toBeVisible();
    });

    test.describe('when the query returns products', () => {
      test('should be a11y compliant', async ({
        productList,
        makeAxeBuilder,
      }) => {
        await productList.load({story: 'default'});

        const accessibilityResults = await makeAxeBuilder().analyze();
        expect(accessibilityResults.violations.length).toEqual(0);
      });

      test('should render the products when there is no custom template', async ({
        productList,
      }) => {
        await productList.load({story: 'list-display'});

        await expect
          .poll(async () => await productList.products.count())
          .toBeGreaterThan(0);
        for (const product of await productList.products.all()) {
          await expect(product).toBeVisible();
        }
      });

      test('should render the products when there is a custom template', async ({
        productList,
      }) => {
        await productList.load({story: 'list-display-with-template'});

        await expect
          .poll(async () => await productList.excerpts.count())
          .toBeGreaterThan(0);
        for (const product of await productList.excerpts.all()) {
          await expect(product).toBeVisible();
        }
      });
    });
  });

  test.describe('when #display is set to "table"', () => {
    test('should render placeholders before the query returns', async ({
      productList,
    }) => {
      await productList.load({story: 'table-display-before-query'});

      await expect
        .poll(async () => await productList.tablePlaceholders.count())
        .toBe(1);
      await expect(productList.placeholders.first()).toBeVisible();
    });

    test.describe('when the query returns products', () => {
      test.beforeEach(async ({productList}) => {
        await productList.load({story: 'table-display'});
      });

      test('should be a11y compliant', async ({makeAxeBuilder}) => {
        const accessibilityResults = await makeAxeBuilder().analyze();
        expect(accessibilityResults.violations.length).toEqual(0);
      });

      test('should render the products', async ({productList}) => {
        await expect
          .poll(async () => await productList.products.count())
          .toBeGreaterThan(0);
        for (const product of await productList.products.all()) {
          await expect(product).toBeVisible();
        }
      });
    });
  });

  test.describe('when there are no products', () => {
    test.beforeEach(async ({productList}) => {
      await productList.load({story: 'no-products'});
    });

    test('should not have any placeholders', async ({productList}) => {
      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(0);
    });

    test('should not have any products', async ({productList}) => {
      await expect.poll(async () => await productList.products.count()).toBe(0);
    });
  });
});

import {test, expect} from './fixture';

// TODO KIT-3640 - Add tests for table display

test.describe('before the query', async () => {
  test.describe('when display is set to "grid"', () => {
    test.beforeEach(async ({productList}) => {
      await productList.load({story: 'grid-display-before-query'});
      await productList.hydrated.waitFor();
    });

    test('should be a11y compliant', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test('should show the default number of placeholders', async ({
      productList,
    }) => {
      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(24);
      for (const placeholder of await productList.placeholders.all()) {
        await expect(placeholder).toBeVisible();
      }
    });

    test('when numberOfPlaceholders is specified, should show the specified number of placeholders', async ({
      productList,
    }) => {
      await productList.load({
        story: 'grid-display-before-query',
        args: {numberOfPlaceholders: 1},
      });
      await productList.hydrated.waitFor();

      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(1);

      await expect(productList.placeholders.first()).toBeVisible();
    });
  });

  test.describe('when display is set to "list"', () => {
    test.beforeEach(async ({productList}) => {
      await productList.load({
        story: 'list-display-before-query',
      });
      await productList.hydrated.waitFor();
    });

    test('should be a11y compliant', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test('should show the default number of placeholders', async ({
      productList,
    }) => {
      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(24);
      for (const placeholder of await productList.placeholders.all()) {
        await expect(placeholder).toBeVisible();
      }
    });

    test('when numberOfPlaceholders is specified, should show the specified number of placeholders', async ({
      productList,
    }) => {
      await productList.load({
        story: 'list-display-before-query',
        args: {numberOfPlaceholders: 1},
      });
      await productList.hydrated.waitFor();

      await expect
        .poll(async () => await productList.placeholders.count())
        .toBe(1);

      await expect(productList.placeholders.first()).toBeVisible();
    });
  });
});

test.describe('after the query', async () => {
  test.describe('when there are products', () => {
    test.describe('when display is set to "grid"', () => {
      test.describe('when a template is not provided', () => {
        test.beforeEach(async ({productList}) => {
          await productList.load({story: 'default'});
          await productList.hydrated.waitFor();
        });

        test('should be a11y compliant', async ({makeAxeBuilder}) => {
          const accessibilityResults = await makeAxeBuilder().analyze();
          expect(accessibilityResults.violations.length).toEqual(0);
        });

        test('should not have any placeholders', async ({productList}) => {
          await expect
            .poll(async () => await productList.placeholders.count())
            .toBe(0);
        });

        test('should show all products', async ({productList}) => {
          await expect
            .poll(async () => await productList.products.count())
            .toBeGreaterThan(0);
          for (const product of await productList.products.all()) {
            await expect(product).toBeVisible();
          }
        });
      });
      test.describe('when a template is provided', () => {
        test.beforeEach(async ({productList}) => {
          await productList.load({story: 'grid-display-with-template'});
          await productList.hydrated.waitFor();
        });

        test('should be a11y compliant', async ({makeAxeBuilder}) => {
          const accessibilityResults = await makeAxeBuilder().analyze();
          expect(accessibilityResults.violations.length).toEqual(0);
        });

        test('should show all products', async ({productList}) => {
          await expect
            .poll(async () => await productList.products.count())
            .toBeGreaterThan(0);
          for (const product of await productList.products.all()) {
            await expect(product).toBeVisible();
          }
        });
      });
    });

    test.describe('when display is set to "list"', () => {
      test.describe('when a template is not provided', () => {
        test.beforeEach(async ({productList}) => {
          await productList.load({story: 'list-display'});
          await productList.hydrated.waitFor();
        });

        test('should be a11y compliant', async ({makeAxeBuilder}) => {
          const accessibilityResults = await makeAxeBuilder().analyze();
          expect(accessibilityResults.violations.length).toEqual(0);
        });

        test('should not have any placeholders', async ({productList}) => {
          await expect
            .poll(async () => await productList.placeholders.count())
            .toBe(0);
        });

        test('should show all products', async ({productList}) => {
          await expect
            .poll(async () => await productList.products.count())
            .toBeGreaterThan(0);
          for (const product of await productList.products.all()) {
            await expect(product).toBeVisible();
          }
        });
      });

      test.describe('when a template is provided', () => {
        test.beforeEach(async ({productList}) => {
          await productList.load({
            story: 'list-display-with-template',
          });
          await productList.hydrated.waitFor();
        });

        test('should be a11y compliant', async ({makeAxeBuilder}) => {
          const accessibilityResults = await makeAxeBuilder().analyze();
          expect(accessibilityResults.violations.length).toEqual(0);
        });

        test('should show all products', async ({productList}) => {
          await expect
            .poll(async () => await productList.products.count())
            .toBeGreaterThan(0);
          for (const product of await productList.products.all()) {
            await expect(product).toBeVisible();
          }
        });
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

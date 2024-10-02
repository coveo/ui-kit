import {test, expect} from './fixture';

test.describe('before the query is loaded', async () => {
  test.beforeEach(async ({productList}) => {
    await productList.load({story: 'before-query'});
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

  test('should show the specified number of placeholders', async ({
    productList,
  }) => {
    await productList.load({
      story: 'before-query',
      args: {numberOfPlaceholders: 1},
    });
    await productList.hydrated.waitFor();

    await expect
      .poll(async () => await productList.placeholders.count())
      .toBe(1);

    await expect(productList.placeholders.first()).toBeVisible();
  });
});

test.describe('after a query that yields products', () => {
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

test.describe('after a query that yields no products', () => {
  test.beforeEach(async ({productList}) => {
    await productList.withNoProducts();
    await productList.load({story: 'default'});
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

test.describe('with a product template', () => {
  test.beforeEach(async ({productList}) => {
    await productList.load({story: 'with-product-template'});
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

import {expect, test} from './fixture';

test.describe('when there is no promotional price', async () => {
  test.beforeEach(async ({productPrice}) => {
    await productPrice.load();
    await productPrice.hydrated.first().waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should render the price', async ({productPrice}) => {
    await expect(productPrice.blueLagoonPrice).toBeVisible();
  });
});

test.describe('when there is a promotional price', async () => {
  test.beforeEach(async ({productPrice}) => {
    await productPrice.load();
    await productPrice.hydrated.first().waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should render the original price with a line-through', async ({
    productPrice,
  }) => {
    const promoPrice = productPrice.AquaMarinaPrice;
    await expect(promoPrice).toBeVisible();
    await expect(promoPrice).toHaveClass(/.*line-through.*/);
  });

  test('should render the promotional price with a text-error', async ({
    productPrice,
  }) => {
    const promoPrice = productPrice.AquaMarinaPromoPrice;
    await expect(promoPrice).toBeVisible();
    await expect(promoPrice).toHaveClass(/.*text-error.*/);
  });
});

test.describe('when the promotional price is higher than the original price', async () => {
  test.beforeEach(async ({productPrice}) => {
    await productPrice.withCustomPrices({price: 100, promoPrice: 200});
    await productPrice.load();
  });

  test('should render the price', async ({page}) => {
    const price = page.getByText('$100.00');
    await expect(price).toBeVisible();
    await expect(price).not.toHaveClass(/.*line-through.*/);
  });

  test('should not render the promotional price', async ({page}) => {
    const promoPrice = page.getByText('$200.00');
    await expect(promoPrice).not.toBeVisible();
  });
});

test.describe('when the promotional price is the same as the original price', async () => {
  test.beforeEach(async ({productPrice}) => {
    await productPrice.withCustomPrices({price: 100, promoPrice: 100});
    await productPrice.load();
  });

  test('should render the price', async ({page}) => {
    const price = page.getByText('$100.00');
    await expect(price).toBeVisible();
    await expect(price).not.toHaveClass(/.*line-through.*/);
  });

  test('should not render the promotional price', async ({page}) => {
    const promoPrice = page.getByText('$100.00');
    await expect(promoPrice).not.toHaveClass(/.*text-error.*/);
  });
});

test.describe('when given a invalid value', async () => {
  test.beforeEach(async ({productPrice}) => {
    await productPrice.withCustomPrices({price: NaN, promoPrice: NaN});
    await productPrice.load();
  });

  test('should not render the price', async ({productPrice}) => {
    await expect(productPrice.AquaMarinaPrice).not.toBeVisible();
    await expect(productPrice.AquaMarinaPromoPrice).not.toBeVisible();
  });
});

test('should render the price in the proper currency', async ({
  productPrice,
  page,
}) => {
  await productPrice.load({story: 'with-eur-currency'});
  await productPrice.hydrated.first().waitFor();

  await expect(page.getByText('1 000,00 €')).toBeVisible();
  await expect(page.getByText('39,00 €')).toBeVisible();
  await expect(page.getByText('36,00 €')).toBeVisible();
});

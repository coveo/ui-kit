import {expect, test} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load();
  });

  test('should render 3 values and 3 separators', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(3);
    await expect(productMultiValueText.separators).toHaveCount(3);
  });

  test('should render an indicator that 3 more values are available', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.moreValuesIndicator(3)).toBeVisible();
  });
});

test.describe('with a delimiter', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'with-delimiter',
    });
  });
  test('when field value does not include the specified delimiter, should render as a single value', async ({
    productMultiValueText,
  }) => {
    await productMultiValueText.withCustomDelimiter({
      delimiter: '/',
      field: 'ec_product_id',
      values: ['a', 'b', 'c', 'd', 'e'],
    });

    await expect(productMultiValueText.values).toHaveCount(1);
    await expect(productMultiValueText.separators).toHaveCount(0);
    await expect(productMultiValueText.values.first()).toHaveText('a/b/c/d/e');
    await expect(productMultiValueText.moreValuesIndicator()).not.toBeVisible();
  });

  test('when field value includes the specified delimiter, should render as distinct values', async ({
    productMultiValueText,
  }) => {
    await productMultiValueText.withCustomDelimiter({
      delimiter: '_',
      field: 'ec_product_id',
      values: ['a', 'b', 'c', 'd', 'e'],
    });

    await expect(productMultiValueText.values).toHaveCount(3);
    await expect(productMultiValueText.separators).toHaveCount(3);
    await expect(productMultiValueText.values.first()).toHaveText('a');
    await expect(productMultiValueText.values.nth(1)).toHaveText('b');
    await expect(productMultiValueText.values.nth(2)).toHaveText('c');
    await expect(productMultiValueText.moreValuesIndicator(2)).toBeVisible();
  });
});

test.describe('with max-values-to-display set to minimum (1)', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'with-max-values-to-display-set-to-minimum',
    });
  });

  test('should render 1 value and 1 separator', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(1);
    await expect(productMultiValueText.separators).toHaveCount(1);
  });

  test('should render an indicator that 5 more values are available', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.moreValuesIndicator(5)).toBeVisible();
  });
});

test.describe('with max-values-to-display set to total number of values (6)', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'with-max-values-to-display-set-to-total-number-of-values',
    });
  });

  test('should be a11y compliant', async ({
    productMultiValueText,
    makeAxeBuilder,
  }) => {
    await productMultiValueText.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should render 6 values and 5 separators', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(6);
    await expect(productMultiValueText.separators).toHaveCount(5);
  });

  test('should not render an indicator that more values are available', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.moreValuesIndicator()).not.toBeVisible();
  });
});

test.describe('in a page with corresponding facet', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'in-a-page-with-the-corresponding-facet',
    });
  });

  test('should be a11y compliant', async ({
    productMultiValueText,
    makeAxeBuilder,
  }) => {
    await productMultiValueText.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('with no selected values in corresponding facet, should render values in default order', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values.first()).toHaveText('XS');
    await expect(productMultiValueText.values.nth(1)).toHaveText('S');
    await expect(productMultiValueText.values.nth(2)).toHaveText('M');
  });

  test('with a selected value in corresponding facet, should render that value first', async ({
    page,
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values.first()).toHaveText('XS');

    await page.getByLabel('Inclusion filter on L').click();

    await expect(productMultiValueText.values.first()).toHaveText('L');
  });

  test('with 3 selected values in corresponding facet, should render those values in alphabetical order', async ({
    productMultiValueText,
    page,
  }) => {
    await page.getByLabel('Inclusion filter on M').click();
    await expect(page.getByText('Clear filter')).toBeVisible();
    await page.getByLabel('Inclusion filter on L').click();
    await expect(page.getByText('Clear 2 filters')).toBeVisible();
    await page.getByLabel('Inclusion filter on XL').click();
    await expect(page.getByText('Clear 3 filters')).toBeVisible();

    await expect(productMultiValueText.values.first()).toHaveText('L');
    await expect(productMultiValueText.values.nth(1)).toHaveText('M');
    await expect(productMultiValueText.values.nth(2)).toHaveText('XL');
  });
});

import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load();
  });

  test('should be accessible', async ({
    productMultiValueText,
    makeAxeBuilder,
  }) => {
    await expect(productMultiValueText.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });

  test('should render 3 values and 3 separators', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(3);
    await expect(productMultiValueText.separators).toHaveCount(3);
  });

  test('should render indicator that 2 more values are available', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.moreValuesIndicator(2)).toBeVisible();
  });
});

test.describe('with max-values-to-display set to 1', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'with-max-values-to-display-set-to-minimum',
    });
  });

  test('should be a11y compliant', async ({
    productMultiValueText,
    makeAxeBuilder,
  }) => {
    await expect(productMultiValueText.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });

  test('should render 1 value and 1 separator', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(1);
    await expect(productMultiValueText.separators).toHaveCount(1);
  });

  test('should render indicator that 4 more values are available', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.moreValuesIndicator(4)).toBeVisible();
  });
});

test.describe('with #max-values-to-display set to 5', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'with-max-values-to-display-set-to-total-number-of-values',
    });
  });

  test('should be a11y compliant', async ({
    productMultiValueText,
    makeAxeBuilder,
  }) => {
    await expect(productMultiValueText.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });

  test('should render 5 values and 4 separators', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(5);
    await expect(productMultiValueText.separators).toHaveCount(4);
  });

  test('should not render an indicator that more values are available', async ({
    productMultiValueText,
  }) => {
    expect(productMultiValueText.moreValuesIndicator()).not.toBeVisible();
  });
});

test.describe('in a page with the corresponding facet', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load({
      story: 'in-a-page-with-the-corresponding-facet',
    });
  });
  test('with a selected value in the corresponding facet, should render that value first', async ({
    page,
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values.first()).toHaveText('XS');

    await page.getByLabel('Inclusion filter on L; 45 results').click();

    await expect(productMultiValueText.values.first()).toHaveText('L');
  });

  test('with 3 selected values in the corresponding facet, renders those values in alphabetical order', async ({
    productMultiValueText,
    page,
  }) => {
    await expect(productMultiValueText.values.first()).toHaveText('XS');
    await expect(productMultiValueText.values.nth(1)).toHaveText('S');
    await expect(productMultiValueText.values.nth(2)).toHaveText('M');

    await page.getByLabel('Inclusion filter on M; 45 results').click();
    await expect(page.getByText('Clear filter')).toBeVisible();
    await page.getByLabel('Inclusion filter on L; 45 results').click();
    await expect(page.getByText('Clear 2 filters')).toBeVisible();
    await page.getByLabel('Inclusion filter on XL; 45 results').click();
    await expect(page.getByText('Clear 3 filters')).toBeVisible();

    await expect(productMultiValueText.values.first()).toHaveText('L');
    await expect(productMultiValueText.values.nth(1)).toHaveText('M');
    await expect(productMultiValueText.values.nth(2)).toHaveText('XL');
  });
});

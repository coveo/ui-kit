import {expect, test} from './fixture';

test.describe('atomic-result-number', () => {
  test.describe('default (no formatter)', () => {
    test.beforeEach(async ({resultNumber}) => {
      await resultNumber.load();
      await resultNumber.hydrated.first().waitFor();
    });

    test('should render the numeric value with default formatting', async ({
      resultNumber,
    }) => {
      await expect(resultNumber.formattedValue).toHaveText(/[\d,]+/);
    });
  });

  test.describe('with currency formatting', () => {
    test.beforeEach(async ({resultNumber}) => {
      await resultNumber.load({story: 'with-currency-formatting'});
      await resultNumber.hydrated.first().waitFor();
    });

    test('should render the value with currency formatting', async ({
      resultNumber,
    }) => {
      await expect(resultNumber.formattedValue).toHaveText(/\$[\d,]+\.\d{2}/);
    });
  });

  test.describe('with number formatting', () => {
    test.beforeEach(async ({resultNumber}) => {
      await resultNumber.load({story: 'with-number-formatting'});
      await resultNumber.hydrated.first().waitFor();
    });

    test('should render the value with decimal places', async ({
      resultNumber,
    }) => {
      await expect(resultNumber.formattedValue).toHaveText(/\d+\.\d{2}/);
    });
  });

  test.describe('with unit formatting', () => {
    test.beforeEach(async ({resultNumber}) => {
      await resultNumber.load({story: 'with-unit-formatting'});
      await resultNumber.hydrated.first().waitFor();
    });

    test('should render the value with unit', async ({resultNumber}) => {
      await expect(resultNumber.formattedValue).toHaveText(/byte/i);
      await expect(resultNumber.formattedValue).toHaveText(/\d+/);
    });
  });
});

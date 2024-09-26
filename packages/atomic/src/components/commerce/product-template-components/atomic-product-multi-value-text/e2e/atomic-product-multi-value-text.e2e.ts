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

  test('with default max-values-to-display, renders 3 values', async () => {});

  test('with a max-values-to-display of 1, render 1 value', async () => {});

  test('with a correct delimiter, renders 3 values', async () => {});

  test('with an incorrect delimiter, renders no values', async () => {});

  test('with a selected value in the corresponding facet, renders that value first', async () => {});

  test('with 3 selected values in the corresponding facet, renders those values in alphabetical order', async () => {});
});

import {test, expect} from './fixture';

test.describe('default', async () => {
  test.beforeEach(async ({productText}) => {
    await productText.load();
    await productText.hydrated.first().waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test.describe('when field has no value and default is set', async () => {
    test('should render default text', async ({productText}) => {
      await productText.load({
        args: {field: 'nonexistentField', default: 'Default Text'},
      });
      await productText.hydrated.first().waitFor();

      expect(productText.textContent.first()).toContainText('Default Text');
    });
  });
});

test.describe('when using a field that supports highlights', async () => {
  const fields = ['excerpt', 'ec_name'];

  fields.forEach((field) => {
    test.describe(`when displaying the ${field}`, async () => {
      test.beforeEach(async ({productText}) => {
        await productText.load({args: {field}});
        await productText.hydrated.first().waitFor();
      });

      test(`should highlight the keywords in the ${field}`, async ({
        productText,
      }) => {
        const keywordPattern = /^kayak/i;

        const highlightedText =
          await productText.highlightedText.allTextContents();

        highlightedText.forEach((text) => {
          expect(text).toMatch(keywordPattern);
        });
      });
    });

    test(`should not highlight the keywords in the ${field} when shouldHighlight is false`, async ({
      productText,
    }) => {
      await productText.load({
        args: {field: 'excerpt', shouldHighlight: false},
      });
      await productText.hydrated.first().waitFor();

      expect(productText.textContent.first()).toContainText(/kayak/i);

      const highlightedText =
        await productText.highlightedText.allTextContents();
      expect(highlightedText.length).toEqual(0);
    });
  });
});

test.describe('when displaying a field that does not support highlights', async () => {
  test.beforeEach(async ({productText}) => {
    await productText.load({args: {field: 'ec_description'}});
    await productText.hydrated.first().waitFor();
  });

  test('should render the field value', async ({productText}) => {
    expect(productText.textContent.first()).toBeVisible();
  });

  test('should not highlight the keywords in the excerpt', async ({
    productText,
  }) => {
    const highlightedText = await productText.highlightedText.allTextContents();
    expect(productText.textContent.first()).toContainText(/kayak/i);
    expect(highlightedText).not.toContain(/kayak/i);
  });
});

test.describe('when using a non-string field', async () => {
  test.beforeEach(async ({productText, product}) => {
    await productText.load({args: {field: 'ec_price'}});
    await product.hydrated.waitFor();
  });

  test('should not render the field value', async ({productText}) => {
    expect(productText.textContent.first()).not.toBeVisible();
  });
});

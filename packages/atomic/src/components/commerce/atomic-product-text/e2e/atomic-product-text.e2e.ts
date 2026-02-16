import {expect, test} from './fixture';

test.describe('atomic-product-text', () => {
  test.describe('default', async () => {
    test.beforeEach(async ({productText}) => {
      await productText.load();
      await productText.hydrated.first().waitFor();
    });

    test.describe('when field has no value and default is set', async () => {
      test('should render default text', async ({productText}) => {
        await productText.load({
          args: {field: 'nonexistentField', default: 'Default Text'},
        });
        await productText.hydrated.first().waitFor();

        await expect(productText.textContent.first()).toContainText(
          'Default Text'
        );
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

      test(`should not highlight the keywords in the ${field} when noHighlight is true`, async ({
        productText,
      }) => {
        await productText.load({
          args: {field: 'excerpt', noHighlight: true},
        });
        await productText.hydrated.first().waitFor();

        await expect(productText.textContent.first()).toContainText(/kayak/i);
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
      await expect(productText.textContent.first()).toBeVisible();
    });

    test('should not highlight the keywords in the excerpt', async ({
      productText,
    }) => {
      await productText.load({
        args: {field: 'excerpt', 'no-highlight': true},
      });
      await productText.hydrated.first().waitFor();

      await expect(productText.textContent.first()).toContainText(/kayak/i);

      const highlightedText =
        await productText.highlightedText.allTextContents();
      await expect(productText.textContent.first()).toContainText(/kayak/i);
      expect(highlightedText).not.toContain(/kayak/i);
    });
  });
});

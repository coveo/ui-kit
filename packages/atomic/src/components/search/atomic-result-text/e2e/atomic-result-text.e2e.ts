import {expect, test} from './fixture';

test.describe('atomic-product-text', () => {
  test.describe('default', async () => {
    test.beforeEach(async ({resultText}) => {
      await resultText.load();
      await resultText.hydrated.first().waitFor();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
    });

    test.describe('when field has no value and default is set', async () => {
      test('should render default text', async ({resultText}) => {
        await resultText.load({
          args: {field: 'nonexistentField', default: 'Default Text'},
        });
        await resultText.hydrated.first().waitFor();

        await expect(resultText.textContent.first()).toContainText(
          'Default Text'
        );
      });
    });
  });

  test.describe('when using a field that supports highlights', async () => {
    const fields = ['excerpt', 'title'];

    fields.forEach((field) => {
      test.describe(`when displaying the ${field}`, async () => {
        test.beforeEach(async ({resultText}) => {
          await resultText.load({args: {field}});
          await resultText.hydrated.first().waitFor();
        });

        test(`should highlight the keywords in the ${field}`, async ({
          resultText,
        }) => {
          const keywordPattern = /^Bonobo/i;

          const highlightedText =
            await resultText.highlightedText.allTextContents();

          highlightedText.forEach((text) => {
            expect(text).toMatch(keywordPattern);
          });
        });
      });

      test(`should not highlight the keywords in the ${field} when noHighlight is true`, async ({
        resultText,
      }) => {
        await resultText.load({
          args: {field: 'excerpt', noHighlight: true},
        });
        await resultText.hydrated.first().waitFor();

        await expect(resultText.textContent.first()).toContainText(/Bonobo/i);
        const highlightedText =
          await resultText.highlightedText.allTextContents();
        expect(highlightedText.length).toEqual(0);
      });
    });
  });

  test.describe('when displaying a field that does not support highlights', async () => {
    test.beforeEach(async ({resultText}) => {
      await resultText.load({args: {field: 'author'}});
      await resultText.hydrated.first().waitFor();
    });

    test('should render the field value', async ({resultText}) => {
      await expect(resultText.textContent.first()).toBeVisible();
    });

    test('should not highlight the keywords in the excerpt', async ({
      resultText,
    }) => {
      await resultText.load({
        args: {field: 'author', 'no-highlight': true},
      });
      await resultText.hydrated.first().waitFor();

      await expect(resultText.textContent.first()).toContainText(/Bonobo/i);

      const highlightedText =
        await resultText.highlightedText.allTextContents();
      await expect(resultText.textContent.first()).toContainText(/Bonobo/i);
      expect(highlightedText).not.toContain(/Bonobo/i);
    });
  });
});

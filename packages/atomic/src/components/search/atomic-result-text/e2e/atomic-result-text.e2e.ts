import {expect, test} from './fixture';

test.describe('atomic-result-text', () => {
  test.beforeEach(async ({resultText}) => {
    await resultText.load();
    await resultText.hydrated.first().waitFor();
  });

  test.describe('when using a field that supports highlights', () => {
    test('should highlight keywords in the excerpt', async ({resultText}) => {
      await resultText.load({args: {field: 'excerpt'}});
      await resultText.hydrated.first().waitFor();

      const keywordPattern = /^Bonobo/i;
      const highlightedText =
        await resultText.highlightedText.allTextContents();

      highlightedText.forEach((text) => {
        expect(text).toMatch(keywordPattern);
      });
    });
  });
});

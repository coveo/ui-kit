import {expect, test} from './fixture';

test.describe('atomic-result-localized-text', () => {
  test.beforeEach(async ({resultLocalizedText}) => {
    await resultLocalizedText.load();
    await resultLocalizedText.hydrated.first().waitFor();
  });

  test('should render localized text with field values', async ({
    resultLocalizedText,
  }) => {
    await resultLocalizedText.load({
      args: {'locale-key': 'book_by_author', 'field-author': 'name'},
    });
    await resultLocalizedText.hydrated.first().waitFor();

    const text = await resultLocalizedText.textContent.first().textContent();
    expect(text).toContain('Book by');
  });

  test('should render plural form based on count', async ({
    resultLocalizedText,
  }) => {
    await resultLocalizedText.load({
      args: {'locale-key': 'book_count', 'field-count': 'multiplebookscount'},
    });
    await resultLocalizedText.hydrated.first().waitFor();

    const text = await resultLocalizedText.textContent.first().textContent();
    expect(text).toContain('books');
  });

  test('should be accessible', async ({
    resultLocalizedText,
    makeAxeBuilder,
  }) => {
    await resultLocalizedText.load({
      args: {'locale-key': 'book_by_author', 'field-author': 'name'},
    });
    await resultLocalizedText.hydrated.first().waitFor();

    const accessibilityScanResults = await makeAxeBuilder()
      .include('atomic-result-localized-text')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

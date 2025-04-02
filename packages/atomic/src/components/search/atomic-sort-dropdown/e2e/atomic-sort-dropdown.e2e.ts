import {expect, test} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({sortDropdown}) => {
    await sortDropdown.load();
  });

  test.describe('when selecting a field sort criterion', async () => {
    test.beforeEach(async ({sortDropdown}) => {
      await sortDropdown.dropdown.selectOption('sncost ascending');
    });

    test('should properly reflect the selected sort criteria into the URL', async ({
      page,
    }) => {
      expect(page.url()).toContain('sortCriteria=%40sncost%20ascending');
    });
  });

  test.describe('when selecting a composite field sort criterion', async () => {
    test.beforeEach(async ({sortDropdown}) => {
      await sortDropdown.dropdown.selectOption(
        'sncost ascending, date descending'
      );
    });

    test('should properly reflect the selected sort criteria into the URL', async ({
      page,
    }) => {
      expect(page.url()).toContain(
        // eslint-disable-next-line @cspell/spellchecker
        'sortCriteria=%40sncost%20ascending%2Cdate%20descending'
      );
    });
  });

  test.describe('when selecting a relevance sort criterion', async () => {
    test.beforeEach(async ({sortDropdown}) => {
      await sortDropdown.dropdown.selectOption('relevancy');
    });

    test('should not reflect any sortCriteria in the URL', async ({page}) => {
      expect(page.url()).not.toContain('sortCriteria=');
    });
  });

  test.describe('when selecting a date sort criterion', async () => {
    test.beforeEach(async ({sortDropdown}) => {
      await sortDropdown.dropdown.selectOption('date descending');
    });

    test('should properly reflect the selected sort criteria into the URL', async ({
      page,
    }) => {
      expect(page.url()).toContain('sortCriteria=date%20descending');
    });
  });
});

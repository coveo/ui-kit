/* eslint-disable @cspell/spellchecker */
import {expect, test} from './fixture';

test.describe('with an automatic query correction', () => {
  const ORIGINAL_QUERY = 'coveoo';
  const CORRECTED_QUERY = 'coveo';
  test.beforeEach(async ({didYouMean}) => {
    await didYouMean.load({story: 'with-automatic-query-correction'});
    await didYouMean.hydrated.waitFor();
  });

  test('search box should contain the corrected query', async ({searchBox}) => {
    await expect(searchBox.searchInput).toHaveValue(CORRECTED_QUERY);
  });

  test('should display the original query', async ({page}) => {
    await expect(
      page.getByText(`We couldn't find anything for ${ORIGINAL_QUERY}`)
    ).toBeVisible();
  });

  test('should display the auto corrected', async ({page}) => {
    await expect(
      page.getByText(`Query was automatically corrected to ${CORRECTED_QUERY}`)
    ).toBeVisible();
  });
});

test.describe('with a manual query correction', () => {
  const ORIGINAL_QUERY = 'coveoo';
  const CORRECTED_QUERY = 'coveo';
  test.beforeEach(async ({didYouMean}) => {
    await didYouMean.load({story: 'without-automatic-query-correction'});
    await didYouMean.hydrated.waitFor();
  });

  test.skip('search box should contain the original query', async ({
    searchBox,
  }) => {
    await expect(searchBox.searchInput).toHaveValue(ORIGINAL_QUERY);
  });

  test('should show did you mean text', async ({page}) => {
    await expect(
      page.getByText(`Did you mean: ${CORRECTED_QUERY}`)
    ).toBeVisible();
  });

  test('should show manual correction button', async ({page}) => {
    await expect(
      page.getByRole('button', {name: CORRECTED_QUERY})
    ).toBeVisible();
  });

  test('when clicking on the manual correction button, the search box should contain the corrected query', async ({
    searchBox,
    page,
  }) => {
    await page.getByRole('button', {name: CORRECTED_QUERY}).click();
    await expect(searchBox.searchInput).toHaveValue(CORRECTED_QUERY);
  });
});

test.describe.fixme('with a query trigger', () => {
  const ORIGINAL_QUERY = 'Japan';
  const TRIGGER_QUERY = 'China';
  test.beforeEach(async ({didYouMean}) => {
    await didYouMean.load({story: 'query-trigger'});
    await didYouMean.hydrated.waitFor();
  });

  test('search box should contain the corrected query', async ({searchBox}) => {
    await expect(searchBox.searchInput).toHaveValue(TRIGGER_QUERY);
  });

  test('should show trigger correction text', async ({page}) => {
    await expect(
      page.getByText(`Showing results for ${TRIGGER_QUERY}`)
    ).toBeVisible();
  });

  test('should show manual trigger correction text', async ({page}) => {
    await expect(
      page.getByText(`Search instead for ${ORIGINAL_QUERY}`)
    ).toBeVisible();
  });

  test('should show undo button', async ({page}) => {
    await expect(
      page.getByRole('button', {name: ORIGINAL_QUERY})
    ).toBeVisible();
  });

  test('when clicking on the undo button, the search box should contain the original query', async ({
    searchBox,
    page,
  }) => {
    await page.getByRole('button', {name: ORIGINAL_QUERY}).click();
    await expect(searchBox.searchInput).toHaveValue(ORIGINAL_QUERY);
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline with automatic query correction', async ({
    didYouMean,
  }) => {
    await test.step('Load component with automatic correction', async () => {
      await didYouMean.load({story: 'with-automatic-query-correction'});
      await didYouMean.hydrated.waitFor();
    });

    await test.step('Capture and compare screenshot', async () => {
      const screenshot = await didYouMean.captureScreenshot();
      expect(screenshot).toMatchSnapshot('did-you-mean-auto-correction.png', {
        maxDiffPixelRatio: 0.04,
      });
    });
  });

  test('should match baseline with manual query correction', async ({
    didYouMean,
  }) => {
    await test.step('Load component with manual correction', async () => {
      await didYouMean.load({story: 'without-automatic-query-correction'});
      await didYouMean.hydrated.waitFor();
    });

    await test.step('Capture and compare screenshot', async () => {
      const screenshot = await didYouMean.captureScreenshot();
      expect(screenshot).toMatchSnapshot('did-you-mean-manual-correction.png', {
        maxDiffPixelRatio: 0.04,
      });
    });
  });
});

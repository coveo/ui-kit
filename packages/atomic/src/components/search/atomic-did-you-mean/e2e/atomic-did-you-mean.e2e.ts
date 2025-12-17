/* eslint-disable @cspell/spellchecker */
import {expect, test} from './fixture';

test.describe('atomic-did-you-mean', () => {
  test.describe('with an automatic query correction', () => {
    const ORIGINAL_QUERY = 'coveoo';
    const CORRECTED_QUERY = 'coveo';
    test.beforeEach(async ({didYouMean}) => {
      await didYouMean.load({story: 'with-automatic-query-correction'});
      await didYouMean.hydrated.waitFor();
    });

    test('should display the original query', async ({page}) => {
      await expect(
        page.getByText(`We couldn't find anything for ${ORIGINAL_QUERY}`)
      ).toBeVisible();
    });

    test('should display the auto corrected', async ({page}) => {
      await expect(
        page.getByText(
          `Query was automatically corrected to ${CORRECTED_QUERY}`
        )
      ).toBeVisible();
    });
  });

  test.describe('with a manual query correction', () => {
    const CORRECTED_QUERY = 'coveo';
    test.beforeEach(async ({didYouMean}) => {
      await didYouMean.load({story: 'without-automatic-query-correction'});
      await didYouMean.hydrated.waitFor();
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
  });
});

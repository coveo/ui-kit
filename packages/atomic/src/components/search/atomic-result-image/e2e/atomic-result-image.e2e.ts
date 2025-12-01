/* eslint-disable @cspell/spellchecker */
import {expect, test} from './fixture';

test.describe('atomic-result-image', () => {
  test('should render default image', async ({resultImage}) => {
    await resultImage.load();
    await resultImage.hydrated.waitFor();

    const img = resultImage.hydrated.locator('img');
    await expect(img).toBeVisible();
  });
});

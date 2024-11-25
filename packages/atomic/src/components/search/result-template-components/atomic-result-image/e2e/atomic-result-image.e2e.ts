/* eslint-disable @cspell/spellchecker */
import {test, expect} from './fixture';

test.describe('with an alt text field', async () => {
  test.describe('when imageAltField is a valid string & the image is not found', () => {
    test.beforeEach(async ({resultImage}) => {
      await resultImage.load({
        story: 'with-an-alt-text-field',
      });
      await resultImage.hydrated.waitFor();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test('should use the alt text', async ({resultImage}) => {
      expect(resultImage.hydrated.first().getByAltText('Some alt value'));
    });
  });
});

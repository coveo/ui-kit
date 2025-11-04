import {expect, test} from './fixture';

test.describe('atomic-result-rating', () => {
  test.describe('default', () => {
    test.beforeEach(async ({resultRating}) => {
      await resultRating.load();
      await resultRating.hydrated.first().waitFor();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
    });

    test('should have the right number of yellow icons', async ({
      resultRating,
    }) => {
      const widthAttr = await resultRating.yellowIcons.getAttribute('style');
      expect(widthAttr).toContain('width:');
      // The width should be a percentage between 0% and 100%
      const widthMatch = widthAttr?.match(/width:(\d+)%/);
      expect(widthMatch).toBeTruthy();
      if (widthMatch) {
        const widthValue = parseInt(widthMatch[1]);
        expect(widthValue).toBeGreaterThanOrEqual(0);
        expect(widthValue).toBeLessThanOrEqual(100);
      }
    });
  });

  test.describe('with a max value in index of 10', () => {
    test.beforeEach(async ({resultRating}) => {
      await resultRating.load({story: 'with-a-max-value-in-index'});
      await expect(resultRating.hydrated.first()).toBeVisible();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
    });

    test('should have the right number of yellow icons', async ({
      resultRating,
    }) => {
      const widthAttr = await resultRating.yellowIcons.getAttribute('style');
      expect(widthAttr).toContain('width:');
      // With max 10, a 4-star rating should be 40%
      expect(widthAttr).toContain('40%');
    });
  });

  test.describe('with a different icon', () => {
    test.beforeEach(async ({resultRating}) => {
      await resultRating.load({story: 'with-a-different-icon'});
      await expect(resultRating.hydrated.first()).toBeVisible();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
    });

    test('should have the right number of yellow icons', async ({
      resultRating,
    }) => {
      const widthAttr = await resultRating.yellowIcons.getAttribute('style');
      expect(widthAttr).toContain('width:');
      const widthMatch = widthAttr?.match(/width:(\d+)%/);
      expect(widthMatch).toBeTruthy();
      if (widthMatch) {
        const widthValue = parseInt(widthMatch[1]);
        expect(widthValue).toBeGreaterThanOrEqual(0);
        expect(widthValue).toBeLessThanOrEqual(100);
      }
    });
  });
});

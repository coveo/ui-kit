/* eslint-disable @cspell/spellchecker */
import {expect, test} from './fixture';

test.describe('atomic-product-image', () => {
  test.describe('default', async () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.load();
      await productImage.noCarouselImage.waitFor();
    });

    test('should render the image', async ({productImage}) => {
      await expect(productImage.noCarouselImage).toBeVisible();
    });
  });

  test.describe('as a carousel', async () => {
    const URL =
      '/iframe.html?id=atomic-product-image--default&viewMode=story#sortCriteria=relevance';
    const FIRST_IMAGE =
      'https://images.barca.group/Sports/mj/Trampolines%20%26%20Floats/Huge%20inflatable%20mats/3_Blue/df1a99488425_bottom_right.webp';
    const SECOND_IMAGE =
      'https://images.barca.group/Sports/mj/Trampolines%20%26%20Floats/Huge%20inflatable%20mats/3_Blue/df1a99488425_bottom_left.webp';

    test.beforeEach(async ({productImage}) => {
      await productImage.load();
      await productImage.carouselImage.waitFor();
    });

    test('should render the first image by default', async ({productImage}) => {
      await expect(productImage.carouselImage).toBeVisible();
      const src = await productImage.carouselImage.getAttribute('src');
      expect(src).toContain(FIRST_IMAGE);
    });

    test.describe('when clicking the next button', () => {
      test.beforeEach(async ({productImage}) => {
        await productImage.nextButton.click();
      });

      test('should navigate to the next image', async ({productImage}) => {
        await expect
          .poll(async () => {
            const src = await productImage.carouselImage.getAttribute('src');
            return src;
          })
          .toContain(SECOND_IMAGE);
      });

      test('should not open the product', async ({page}) => {
        expect(page.url()).toContain(URL);
      });
    });
  });
});

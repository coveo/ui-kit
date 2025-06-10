/* eslint-disable @cspell/spellchecker */
import {test, expect} from './fixture';

test.describe('default', async () => {
  test.beforeEach(async ({productImage}) => {
    await productImage.load();
    await productImage.noCarouselImage.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should render the image', async ({productImage}) => {
    await expect(productImage.noCarouselImage).toBeVisible();
  });

  test('should have a default alt text', async ({productImage}) => {
    const altText = await productImage.noCarouselImage.getAttribute('alt');
    expect(altText).toEqual('Image 1 out of 1 for Nublu Water Bottle');
  });

  test('should have a 1:1 aspect ratio', async ({productImage}) => {
    const aspectRatio =
      await productImage.noCarouselImage.getAttribute('class');
    expect(aspectRatio).toEqual('aspect-square');
  });
});

test.describe('with a custom fallback image', async () => {
  const FALLBACK = 'https://sports.barca.group/logos/barca.svg';

  test.describe('when the product image is missing', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.withCustomThumbnails([]);
      await productImage.load({story: 'with-a-fallback-image'});
      await productImage.noCarouselImage.waitFor();
    });

    test('should render the fallback image', async ({productImage}) => {
      const src = await productImage.noCarouselImage.getAttribute('src');
      expect(src).toContain(FALLBACK);
    });

    test('should have a 1:1 aspect ratio', async ({productImage}) => {
      const aspectRatio =
        await productImage.noCarouselImage.getAttribute('class');
      expect(aspectRatio).toEqual('aspect-square');
    });
  });

  test.describe('when the product image is invalid', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.withCustomThumbnails(['invalid-image']);
      await productImage.load({story: 'with-a-fallback-image'});
    });

    test('should render the fallback image', async ({productImage}) => {
      const src = await productImage.noCarouselImage.getAttribute('src');
      expect(src).toContain(FALLBACK);
    });

    test('should have a 1:1 aspect ratio', async ({productImage}) => {
      const aspectRatio =
        await productImage.noCarouselImage.getAttribute('class');
      expect(aspectRatio).toEqual('aspect-square');
    });
  });

  test.describe('when the product image is not a string', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.withCustomThumbnails([1]);
      await productImage.load({story: 'with-a-fallback-image'});
    });

    test('should render the fallback image', async ({productImage}) => {
      const src = await productImage.noCarouselImage.getAttribute('src');
      expect(src).toContain(FALLBACK);
    });

    test('should have a 1:1 aspect ratio', async ({productImage}) => {
      const aspectRatio =
        await productImage.noCarouselImage.getAttribute('class');
      expect(aspectRatio).toEqual('aspect-square');
    });
  });
});

test.describe('with an alt text field', async () => {
  test.describe('when imageAltField is a valid string', () => {
    const NO_CAROUSEL_CUSTOM_FIELD = 'Nublu Water Bottle';
    const CAROUSEL_CUSTOM_FIELD = 'Blue Lagoon Mat';

    test.beforeEach(async ({productImage}) => {
      await productImage.withCustomField(
        'Nublu Water Bottle',
        'Blue Lagoon Mat'
      );
      await productImage.load({
        story: 'with-an-alt-text-field',
        args: {
          field: 'ec_thumbnails',
          fallback: undefined,
          imageAltField: 'custom_alt_field',
        },
      });
      await productImage.noCarouselImage.waitFor();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test('should use the same alt text for all images', async ({
      productImage,
    }) => {
      const altNoCarousel =
        await productImage.noCarouselImage.getAttribute('alt');
      expect(altNoCarousel).toEqual(NO_CAROUSEL_CUSTOM_FIELD);

      const altCarousel = await productImage.carouselImage.getAttribute('alt');
      expect(altCarousel).toEqual(CAROUSEL_CUSTOM_FIELD);
    });
  });

  test.describe('when imageAltField is a valid string, image is invalid and fallback is not specified', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.load({
        story: 'with-an-alt-text-field',
        args: {
          field: 'invalid',
          fallback: undefined,
          imageAltField: 'ec_name',
        },
      });
      await productImage.noCarouselImage.waitFor();
    });

    test('should have alt text as the image alt field', async ({
      productImage,
    }) => {
      const alt = await productImage.noCarouselImage.getAttribute('alt');
      expect(alt).toEqual('Nublu Water Bottle');

      const carouselAlt = await productImage.carouselImage.getAttribute('alt');
      expect(carouselAlt).toEqual('Blue Lagoon Mat');
    });
  });

  test.describe('when imageAltField is invalid, image is invalid and fallback is not specified', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.load({
        story: 'with-an-alt-text-field',
        args: {
          field: 'invalid',
          fallback: undefined,
          imageAltField: 'invalid',
        },
      });
      await productImage.noCarouselImage.waitFor();
    });

    test('should have image-not-found-alt as the alt text', async ({
      productImage,
    }) => {
      const alt = await productImage.noCarouselImage.getAttribute('alt');
      expect(alt).toEqual('No image available for Nublu Water Bottle.');

      const carouselAlt = await productImage.carouselImage.getAttribute('alt');
      expect(carouselAlt).toEqual('No image available for Blue Lagoon Mat.');
    });
  });

  test.describe('when imageAltField is not specified', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.load();
      await productImage.noCarouselImage.waitFor();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test('should generate default alt text for all images', async ({
      productImage,
    }) => {
      expect(await productImage.noCarouselImage.getAttribute('alt')).toEqual(
        'Image 1 out of 1 for Nublu Water Bottle'
      );
      expect(await productImage.carouselImage.getAttribute('alt')).toEqual(
        'Image 1 out of 2 for Blue Lagoon Mat'
      );
      await productImage.nextButton.click();
      await expect
        .poll(async () => {
          return await productImage.carouselImage.getAttribute('alt');
        })
        .toContain('Image 2 out of 2 for Blue Lagoon Mat');
    });
  });

  test.describe('when imageAltField is invalid', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.load({
        story: 'with-an-alt-text-field',
        args: {
          field: 'ec_thumbnails',
          fallback: undefined,
          imageAltField: 'custom_alt_field',
        },
      });
      await productImage.noCarouselImage.waitFor();
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test('should use the default alt text for all images', async ({
      productImage,
    }) => {
      expect(await productImage.noCarouselImage.getAttribute('alt')).toEqual(
        'Image 1 out of 1 for Nublu Water Bottle'
      );
      expect(await productImage.carouselImage.getAttribute('alt')).toEqual(
        'Image 1 out of 2 for Blue Lagoon Mat'
      );
      await productImage.nextButton.click();
      await expect
        .poll(async () => {
          return await productImage.carouselImage.getAttribute('alt');
        })
        .toContain('Image 2 out of 2 for Blue Lagoon Mat');
    });
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

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
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

    test('should navigate to the first image if the last image is reached', async ({
      productImage,
    }) => {
      await productImage.nextButton.click();
      await expect
        .poll(async () => {
          return await productImage.carouselImage.getAttribute('src');
        })
        .toContain(FIRST_IMAGE);
    });

    test('should not open the product', async ({page}) => {
      expect(page.url()).toContain(URL);
    });
  });

  test.describe('when clicking the previous button', () => {
    test.beforeEach(async ({productImage}) => {
      await productImage.previousButton.click();
    });

    test('should navigate to the last image if the first image is reached', async ({
      productImage,
    }) => {
      await expect
        .poll(async () => {
          const src = await productImage.carouselImage.getAttribute('src');
          return src;
        })
        .toContain(SECOND_IMAGE);
    });

    test('should navigate to the previous image', async ({productImage}) => {
      await productImage.previousButton.click();

      await expect
        .poll(async () => {
          const src = await productImage.carouselImage.getAttribute('src');
          return src;
        })
        .toContain(FIRST_IMAGE);
    });

    test('should not open the product', async ({page}) => {
      expect(page.url()).toContain(URL);
    });
  });

  test.describe('when clicking the indicator dot', () => {
    test('should navigate to the corresponding image', async ({
      productImage,
    }) => {
      await expect
        .poll(async () => {
          const src = await productImage.carouselImage.getAttribute('src');
          return src;
        })
        .toContain(FIRST_IMAGE);

      await productImage.indicatorDot.click();

      await expect
        .poll(async () => {
          const src = await productImage.carouselImage.getAttribute('src');
          return src;
        })
        .toContain(SECOND_IMAGE);
    });
  });
});

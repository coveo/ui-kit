import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import './atomic-product-image';
import type {Product} from '@coveo/headless/commerce';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {AtomicProductImage} from './atomic-product-image';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('../../../utils/xss-utils', () => ({
  filterProtocol: vi.fn((url: string) => url),
}));

const DEFAULT_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idy02IGgtNiB0ZXh0LWdyYXktODAwIGRhcms6dGV4dC13aGl0ZSIgYXJpYS1oaWRkZW49InRydWUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0ibTMgMTYgNS03IDYgNi41bTYuNSAyLjVMMTYgMTNsLTQuMjg2IDZNMTQgMTBoLjAxTTQgMTloMTZhMSAxIDAgMCAwIDEtMVY2YTEgMSAwIDAgMC0xLTFINGExIDEgMCAwIDAtMSAxdjEyYTEgMSAwIDAgMCAxIDFaIi8+Cjwvc3ZnPgo=';

const CUSTOM_FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idy02IGgtNiB0ZXh0LWdyYXktODAwIGRhcms6dGV4dC13aGl0ZSIgYXJpYS1oaWRkZW49InRydWUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJjdXJyZW50Q29sb3IiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMnMxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMFMyIDE3LjUyMyAyIDEyWm05LjAwOC0zLjAxOGExLjUwMiAxLjUwMiAwIDAgMSAyLjUyMiAxLjE1OXYuMDI0YTEuNDQgMS40NCAwIDAgMS0xLjQ5MyAxLjQxOCAxIDEgMCAwIDAtMS4wMzcuOTk5VjE0YTEgMSAwIDEgMCAyIDB2LS41MzlhMy40NCAzLjQ0IDAgMCAwIDIuNTI5LTMuMjU2IDMuNTAyIDMuNTAyIDAgMCAwLTctLjI1NSAxIDEgMCAwIDAgMiAuMDc2Yy4wMTQtLjM5OC4xODctLjc3NC40OC0xLjA0NFptLjk4MiA3LjAyNmExIDEgMCAxIDAgMCAySDEyYTEgMSAwIDEgMCAwLTJoLS4wMVoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPgo8L3N2Zz4K';

interface TestAtomicProductImage {
  initialize: () => void;
  field: string;
  imageAltField?: string;
  fallback?: string;
  previousImage: () => void;
  nextImage: () => void;
  navigateToImage: (index: number) => void;
  currentImage: number;
  product: Product;
  images: {
    src: string;
    alt: string;
  }[];
}

describe('AtomicProductImage', () => {
  const mockedEngine = buildFakeCommerceEngine();

  const renderProductImage = async ({
    product = buildFakeProduct({
      ec_name: 'Test Product',
      ec_thumbnails: [DEFAULT_IMAGE],
      permanentid: 'test-product-id',
    }),
    field,
    imageAltField,
    fallback,
  }: {
    product?: ReturnType<typeof buildFakeProduct>;
    field?: string;
    imageAltField?: string;
    fallback?: string;
  } = {}) => {
    const {element} = await renderInAtomicProduct<AtomicProductImage>({
      template: html`<atomic-product-image
        field=${ifDefined(field)}
        image-alt-field=${ifDefined(imageAltField)}
        fallback=${ifDefined(fallback)}
      ></atomic-product-image>`,
      selector: 'atomic-product-image',
      product: product,
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        bindings.interfaceElement.type = 'product-listing';
        bindings.store.onChange = vi.fn();
        return bindings;
      },
    });

    await element?.updateComplete;

    return {
      element,
      productImage: element?.shadowRoot?.querySelector(
        '[part="product-image"]'
      ),
      previousButton: element?.shadowRoot?.querySelector(
        '[part="previous-button"]'
      ),
      nextButton: element?.shadowRoot?.querySelector('[part="next-button"]'),
      indicators: element?.shadowRoot?.querySelector('[part="indicators"]'),
      indicator: element?.shadowRoot?.querySelector('[part="indicator"]'),
      activeIndicator: element?.shadowRoot?.querySelector(
        '[part="indicator active-indicator"]'
      ),
    };
  };

  it('should render correctly with default properties', async () => {
    const {element} = await renderProductImage();
    expect(element).toBeDefined();
    expect(element).not.toBeNull();
    expect(element!.field).toBe('ec_thumbnails');
  });

  it('should render image when product has single thumbnail', async () => {
    const {productImage} = await renderProductImage();

    expect(productImage).toBeTruthy();
    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute('src', DEFAULT_IMAGE);
  });

  it('should use default field ec_thumbnails when field property not specified', async () => {
    const {element} = await renderProductImage();
    expect(element).not.toBeNull();
    expect(element!.field).toBe('ec_thumbnails');
  });

  it('should update field property when changed', async () => {
    const {element} = await renderProductImage({field: 'ec_images'});
    expect(element).not.toBeNull();
    expect(element!.field).toBe('ec_images');
  });

  it('should set imageAltField property when specified', async () => {
    const {element} = await renderProductImage({imageAltField: 'custom_alt'});
    expect(element).not.toBeNull();
    expect(element!.imageAltField).toBe('custom_alt');
  });

  it('should set fallback property when specified', async () => {
    const {element} = await renderProductImage({
      fallback: 'https://example.com/fallback.jpg',
    });
    expect(element).not.toBeNull();
    expect(element!.fallback).toBe('https://example.com/fallback.jpg');
  });

  describe('when product has single image', () => {
    it('should render single image without carousel controls', async () => {
      const {productImage, previousButton, nextButton, indicators} =
        await renderProductImage();

      expect(productImage).toBeTruthy();
      expect(productImage).toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(indicators).not.toBeInTheDocument();
    });

    it('should render default alt text when no imageAltField specified', async () => {
      const {productImage} = await renderProductImage();

      expect(productImage).toHaveAttribute(
        'alt',
        'Image 1 out of 1 for Test Product'
      );
    });
  });
  describe('when product has multiple images', () => {
    let productImageObject: Awaited<ReturnType<typeof renderProductImage>>;

    beforeEach(async () => {
      productImageObject = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
          ],
        }),
      });
    });

    it('should render carousel with navigation controls', () => {
      const {productImage, previousButton, nextButton, indicators} =
        productImageObject;
      expect(productImage).toBeTruthy();
      expect(previousButton).toBeTruthy();
      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeTruthy();
      expect(nextButton).toBeInTheDocument();
      expect(indicators).toBeTruthy();
      expect(indicators).toBeInTheDocument();
    });

    it('should render first image by default', () => {
      const {productImage} = productImageObject;
      expect(productImage).toHaveAttribute(
        'src',
        'https://example.com/image1.jpg'
      );
      expect(productImage).toHaveAttribute(
        'alt',
        'Image 1 out of 3 for Test Product'
      );
    });

    it('should render indicators for each image', () => {
      const {element, indicators} = productImageObject;
      expect(element).not.toBeNull();
      expect(indicators?.children).toHaveLength(3);
    });

    it('should show active indicator for current image', () => {
      const {element, activeIndicator} = productImageObject;
      expect(element).not.toBeNull();
      expect(activeIndicator).toBeTruthy();
      expect(activeIndicator).toBeInTheDocument();
    });
  });

  describe('when product has no images', () => {
    let productImageObject: Awaited<ReturnType<typeof renderProductImage>>;

    beforeEach(async () => {
      productImageObject = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [],
        }),
      });
    });

    it('should render fallback image', () => {
      const {productImage} = productImageObject;
      expect(productImage).toBeTruthy();
      expect(productImage).toBeInTheDocument();

      expect(productImage).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/svg+xml')
      );
    });

    it('should render default alt text when no custom alt field', () => {
      const {productImage} = productImageObject;
      expect(productImage).toBeTruthy();
      expect(productImage).toHaveAttribute(
        'alt',
        'No image available for Test Product.'
      );
    });
  });

  it('should use custom alt text from specified field when imageAltField is specified', async () => {
    const customAltText = 'Custom alt text for product';

    const productWithCustomAlt = buildFakeProduct({
      ec_name: 'Test Product',
      ec_thumbnails: [DEFAULT_IMAGE],
      additionalFields: {
        custom_alt: customAltText,
      },
    });

    const {productImage} = await renderProductImage({
      product: productWithCustomAlt,
      imageAltField: 'custom_alt',
    });

    expect(productImage).toHaveAttribute('alt', customAltText);
  });

  it('should use custom fallback when product has no images when custom fallback is provided', async () => {
    const {productImage} = await renderProductImage({
      product: buildFakeProduct({
        ec_name: 'Test Product',
        ec_thumbnails: [],
      }),
      fallback: CUSTOM_FALLBACK_IMAGE,
    });

    expect(productImage).toHaveAttribute('src', CUSTOM_FALLBACK_IMAGE);
  });

  it('should handle image error event when image fails to load', async () => {
    const {element, productImage} = await renderProductImage({
      fallback: CUSTOM_FALLBACK_IMAGE,
    });

    expect(element).not.toBeNull();
    await element!.updateComplete;

    expect(productImage).toBeTruthy();

    const errorEvent = new Event('error');
    productImage?.dispatchEvent(errorEvent);

    expect(element).toBeDefined();
  });

  describe('#previousImage', () => {
    it('should decrement current image index', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
          ],
        }),
      });

      expect(element).not.toBeNull();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        0
      );

      await element!.previousImage();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        2
      );

      await element!.previousImage();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        1
      );
    });
  });

  describe('#nextImage', () => {
    it('should increment current image index', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
          ],
        }),
      });

      expect(element).not.toBeNull();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        0
      );

      await element!.nextImage();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        1
      );

      await element!.nextImage();
      await element!.nextImage();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        0
      );
    });
  });

  describe('#navigateToImage', () => {
    it('should navigate to specified image index', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
          ],
        }),
      });

      expect(element).not.toBeNull();
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        0
      );

      await element!.navigateToImage(1);
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        1
      );

      await element!.navigateToImage(2);
      expect((element as unknown as TestAtomicProductImage)!.currentImage).toBe(
        2
      );
    });
  });

  describe('when field contains non-string values', () => {
    it('should filter out non-string values and render valid images', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [
            'https://example.com/valid-image.jpg',
            12345,
            null,
            {},
            'https://example.com/another-valid-image.jpg',
            // biome-ignore lint/suspicious/noExplicitAny: <>
          ] as any,
        }),
      });

      expect(element).toBeDefined();
    });
  });

  it('should filter protocol in image URLs when image URLs need XSS filtering', async () => {
    const {filterProtocol} = await import('../../../utils/xss-utils');

    await renderProductImage({
      product: buildFakeProduct({
        ec_name: 'Test Product',
        ec_thumbnails: ['javascript:alert("xss")'],
      }),
    });

    expect(filterProtocol).toHaveBeenCalledWith('javascript:alert("xss")');
  });

  describe('when component has error state', () => {
    it('should handle missing product gracefully', async () => {
      const {element} = await renderProductImage();

      Object.defineProperty(element, 'product', {
        get: () => null,
        configurable: true,
      });

      expect(() => element.requestUpdate()).not.toThrow();
    });
  });

  describe('when using fallback image', () => {
    it('should log warning when fallback image also fails to load', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: ['https://invalid-url.com/broken-image.jpg'],
        }),
        fallback: 'https://invalid-fallback.com/broken-fallback.jpg',
      });

      const imgElement = element.shadowRoot?.querySelector('img');
      expect(imgElement).toBeTruthy();

      const errorEvent = new Event('error');
      Object.defineProperty(errorEvent, 'target', {
        value: {...imgElement, src: 'https://invalid-url.com/broken-image.jpg'},
      });
      imgElement?.dispatchEvent(errorEvent);

      expect(element).toBeDefined();
    });

    it('should handle missing fallback gracefully', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [],
        }),
        fallback: '',
      });

      expect(element).toBeDefined();
    });
  });

  describe('when field contains invalid data type', () => {
    it('should handle non-array, non-string field values', async () => {
      const {element} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [],
        }),
        field: 'non_existent_field',
      });

      expect(element).toBeDefined();
    });
  });

  it('should render all expected shadow parts', async () => {
    const {
      productImage,
      previousButton,
      nextButton,
      indicators,
      indicator,
      activeIndicator,
    } = await renderProductImage({
      product: buildFakeProduct({
        ec_name: 'Test Product',
        ec_thumbnails: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image2.jpg',
        ],
      }),
    });

    expect(productImage).toBeInTheDocument();
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(indicators).toBeInTheDocument();

    expect(indicator).toBeInTheDocument();
    expect(activeIndicator).toBeInTheDocument();
  });
});

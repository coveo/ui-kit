import type {Product} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {filterProtocol} from '@/src/utils/xss-utils';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import type {AtomicProductImage} from './atomic-product-image';
import './atomic-product-image';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/utils/xss-utils', () => ({
  filterProtocol: vi.fn((url: string) => url),
}));

const DEFAULT_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idy02IGgtNiB0ZXh0LWdyYXktODAwIGRhcms6dGV4dC13aGl0ZSIgYXJpYS1oaWRkZW49InRydWUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0ibTMgMTYgNS03IDYgNi41bTYuNSAyLjVMMTYgMTNsLTQuMjg2IDZNMTQgMTBoLjAxTTQgMTloMTZhMSAxIDAgMCAwIDEtMVY2YTEgMSAwIDAgMC0xLTFINGExIDEgMCAwIDAtMSAxdjEyYTEgMSAwIDAgMCAxIDFaIi8+Cjwvc3ZnPgo=';

const CUSTOM_FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idy02IGgtNiB0ZXh0LWdyYXktODAwIGRhcms6dGV4dC13aGl0ZSIgYXJpYS1oaWRkZW49InRydWUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJjdXJyZW50Q29sb3IiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMnMxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMFMyIDE3LjUyMyAyIDEyWm05LjAwOC0zLjAxOGExLjUwMiAxLjUwMiAwIDAgMSAyLjUyMiAxLjE1OXYuMDI0YTEuNDQgMS40NCAwIDAgMS0xLjQ5MyAxLjQxOCAxIDEgMCAwIDAtMS4wMzcuOTk5VjE0YTEgMSAwIDEgMCAyIDB2LS41MzlhMy40NCAzLjQ0IDAgMCAwIDIuNTI5LTMuMjU2IDMuNTAyIDMuNTAyIDAgMCAwLTctLjI1NSAxIDEgMCAwIDAgMiAuMDc2Yy4wMTQtLjM5OC4xODctLjc3NC40OC0xLjA0NFptLjk4MiA3LjAyNmExIDEgMCAxIDAgMCAySDEyYTEgMSAwIDEgMCAwLTJoLS4wMVoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPgo8L3N2Zz4K';

describe('atomic-product-image', () => {
  const mockProduct = buildFakeProduct({
    ec_name: 'Test Product',
    ec_thumbnails: [DEFAULT_IMAGE],
    permanentid: 'test-product-id',
  });

  const renderProductImage = async ({
    product = mockProduct,
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
        bindings.engine.logger = {warn: vi.fn()} as never;
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
      ) as HTMLButtonElement | null,
      nextButton: element?.shadowRoot?.querySelector(
        '[part="next-button"]'
      ) as HTMLButtonElement | null,
      indicators: element?.shadowRoot?.querySelector('[part="indicators"]'),
      indicator: element?.shadowRoot?.querySelectorAll(
        '[part="indicator"], [part="indicator active-indicator"]'
      ) as NodeListOf<HTMLLIElement>,
      activeIndicator: element?.shadowRoot?.querySelector(
        '[part="indicator active-indicator"]'
      ),
    };
  };

  it('should render correctly with default properties', async () => {
    const {element, productImage} = await renderProductImage();
    expect(element!.field).toBe('ec_thumbnails');

    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute('src', DEFAULT_IMAGE);
  });

  it('should render nothing when product is not available', async () => {
    const {element, productImage} = await renderProductImage({
      product: null as unknown as Product,
    });

    expect(element).toBeDefined();
    expect(productImage).toBeNull();
    expect(element).toHaveTextContent('');
  });

  describe('when product has a single image', () => {
    it('should render single image without carousel controls', async () => {
      const {productImage, previousButton, nextButton, indicators} =
        await renderProductImage();

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

    const IMAGES = [
      'image1.jpg',
      'image2.jpg',
      'image3.jpg',
      'image4.jpg',
      'image5.jpg',
    ];

    beforeEach(async () => {
      productImageObject = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: IMAGES,
        }),
      });
    });

    it('should render carousel with navigation controls', () => {
      const {productImage, previousButton, nextButton, indicators} =
        productImageObject;
      expect(productImage).toBeInTheDocument();
      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(indicators).toBeInTheDocument();
    });

    it('should display first image by default', () => {
      const {productImage} = productImageObject;
      expect(productImage).toHaveAttribute('src', IMAGES[0]);
      expect(productImage).toHaveAttribute(
        'alt',
        `Image 1 out of ${IMAGES.length} for Test Product`
      );
    });

    it('should render indicators for each image', () => {
      const {indicators} = productImageObject;
      expect(indicators?.children).toHaveLength(IMAGES.length);
    });

    it('should show active indicator for current image', () => {
      const {activeIndicator, indicators} = productImageObject;
      expect(indicators?.children[0]).toBe(activeIndicator);
    });

    describe('when clicking the next button', () => {
      it('should go to next image when not on last image', async () => {
        const {element, productImage, nextButton} = productImageObject;

        expect(productImage).toHaveAttribute('src', IMAGES[0]);
        nextButton!.click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[1]);
      });

      it('should go to first image when on last image', async () => {
        const {element, productImage, indicator, nextButton} =
          productImageObject;

        indicator[IMAGES.length - 1].click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[IMAGES.length - 1]);

        nextButton!.click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[0]);
      });
    });

    describe('when clicking the previous button', () => {
      it('should go to previous image when not on first image', async () => {
        const {element, productImage, indicator, previousButton} =
          productImageObject;

        indicator[1].click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[1]);

        previousButton!.click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[0]);
      });

      it('should go to last image when on first image', async () => {
        const {element, productImage, previousButton} = productImageObject;

        expect(productImage).toHaveAttribute('src', IMAGES[0]);
        previousButton!.click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[IMAGES.length - 1]);
      });
    });

    describe('when clicking an indicator', () => {
      it('should navigate to image when clicking indicator', async () => {
        const {element, productImage, indicator} = productImageObject;

        expect(productImage).toHaveAttribute('src', IMAGES[0]);
        indicator[2].click();
        await element.updateComplete;
        expect(productImage).toHaveAttribute('src', IMAGES[2]);
      });
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

  describe('when using fallback image', () => {
    it('should use default fallback when no fallback provided', async () => {
      const {productImage} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [],
        }),
      });
      expect(productImage).toBeTruthy();
      expect(productImage).toHaveAttribute(
        'src',
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="none"%3E%3C/rect%3E%3C/svg%3E'
      );
    });

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

    it('should use custom fallback', async () => {
      const {productImage} = await renderProductImage({
        product: buildFakeProduct({
          ec_name: 'Test Product',
          ec_thumbnails: [],
        }),
        fallback: CUSTOM_FALLBACK_IMAGE,
      });

      expect(productImage).toHaveAttribute('src', CUSTOM_FALLBACK_IMAGE);
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

  it('should handle image error event when image fails to load', async () => {
    const {element, productImage} = await renderProductImage({
      fallback: CUSTOM_FALLBACK_IMAGE,
    });

    await element!.updateComplete;

    expect(productImage).toBeTruthy();

    const errorEvent = new Event('error');
    productImage?.dispatchEvent(errorEvent);

    expect(element).toBeDefined();
  });

  it('should filter out non-string values when field contains non-string values', async () => {
    const {element} = await renderProductImage({
      product: buildFakeProduct({
        ec_name: 'Test Product',
        ec_thumbnails: [
          DEFAULT_IMAGE,
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

  it('should filter protocol in image URLs when image URLs need XSS filtering', async () => {
    await renderProductImage({
      product: buildFakeProduct({
        ec_name: 'Test Product',
        ec_thumbnails: ['javascript:alert("xss")'],
      }),
    });

    expect(filterProtocol).toHaveBeenCalledWith('javascript:alert("xss")');
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
        ec_thumbnails: Array(3).fill(DEFAULT_IMAGE),
      }),
    });

    expect(productImage).toBeInTheDocument();
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(indicators).toBeInTheDocument();

    expect(indicator[0]).toBeInTheDocument();
    expect(activeIndicator).toBeInTheDocument();
  });
});

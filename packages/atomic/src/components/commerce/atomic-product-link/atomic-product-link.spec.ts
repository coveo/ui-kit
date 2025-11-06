import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {type Locator, page} from 'vitest/browser';
import type {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import type {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeInteractiveProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/interactive-product';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {AtomicProductLink} from './atomic-product-link';
import './atomic-product-link';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-link', () => {
  let mockProduct: Product;
  let mockInteractiveProduct: InteractiveProduct;

  beforeEach(async () => {
    console.error = vi.fn();

    mockProduct = buildFakeProduct({
      ec_name: 'Test Product Name',
      clickUri: 'https://example.com/product/123',
      permanentid: 'product-123',
      ec_brand: 'Test Brand',
      additionalFields: {
        custom_url_param: 'custom-value',
      },
    });
    mockInteractiveProduct = buildFakeInteractiveProduct();
  });

  const renderProductLink = async (
    options: {
      hrefTemplate?: string;
      product?: Product;
      interactiveProduct?: InteractiveProduct;
      slotContent?: string | unknown;
      attributes?: string;
    } = {}
  ) => {
    const productToUse = 'product' in options ? options.product : mockProduct;
    const interactiveProductToUse =
      'interactiveProduct' in options
        ? options.interactiveProduct
        : mockInteractiveProduct;

    const attributesSlot = options.attributes
      ? html`<a slot="attributes" target="_blank" download></a>`
      : nothing;

    const {element, atomicInterface, atomicProduct} =
      await renderInAtomicProduct<AtomicProductLink>({
        template: html`<atomic-product-link
          .hrefTemplate=${options.hrefTemplate}
        >
          ${ifDefined(options.slotContent)}
          ${attributesSlot}
        </atomic-product-link>`,
        selector: 'atomic-product-link',
        product: productToUse,
        interactiveProduct: interactiveProductToUse,
        bindings: (bindings) => {
          bindings.store.onChange = vi.fn();
          bindings.engine.logger = {warn: vi.fn()} as never;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await atomicProduct.updateComplete;
    await element.updateComplete;
    // Prevent navigation during tests
    page
      .getByRole('link')
      .query()
      ?.addEventListener('click', (e) => {
        e.preventDefault();
      });

    return {
      element,
      atomicProduct,
      link: page.getByRole('link'),
      productText: () => element.querySelector('atomic-product-text'),
      parts: (element: AtomicProductLink) => {
        const qs = (selector: string) =>
          element.shadowRoot?.querySelector(selector);
        return {
          link: qs('a'),
          productText: qs('atomic-product-text'),
        };
      },
    };
  };

  it('should be defined', async () => {
    const {element} = await renderProductLink();
    expect(element).toBeInstanceOf(AtomicProductLink);
  });

  it('should render nothing when product is not available', async () => {
    const {element} = await renderProductLink({product: undefined});
    expect(element).toBeDefined();
    expect(element?.textContent?.trim()).toBe('');
  });

  it('should render a link with correct href from product clickUri', async () => {
    const {link} = await renderProductLink();

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/product/123');
  });

  it('should render default product text when no slot content provided', async () => {
    const {productText} = await renderProductLink();

    expect(productText).toBeTruthy();
    expect(productText()?.getAttribute('field')).toBe('ec_name');
    expect(productText()?.getAttribute('default')).toBe('no-title');
  });

  it('should render default slot content inside the link element when provided', async () => {
    const {link} = await renderProductLink({
      slotContent: 'Custom link content',
    });

    expect(link.first().element()?.textContent).toContain(
      'Custom link content'
    );
  });

  describe('#initialize', () => {
    it('should set product from controller when available', async () => {
      const {element} = await renderProductLink();

      element.product = undefined;
      expect(element.product).toBe(undefined);

      element.productController = {
        item: mockProduct,
      } as ItemContextController<Product>;

      element.initialize();
      expect(element.product).toBe(mockProduct);
    });

    it('should set interactiveProduct from controller', async () => {
      const {element} = await renderProductLink();

      element.interactiveProduct = undefined;
      expect(element.interactiveProduct).toBe(undefined);

      element.interactiveProductController = {
        interactiveItem: mockInteractiveProduct,
      } as InteractiveItemContextController<InteractiveProduct>;

      element.initialize();
      expect(element.interactiveProduct).toBe(mockInteractiveProduct);
    });

    it('should dispatch stopPropagation resolution event', async () => {
      const {element} = await renderProductLink();

      if (element) {
        const eventListener = vi.fn();
        element.addEventListener(
          'atomic/resolveStopPropagation',
          eventListener
        );

        element.initialize();

        expect(eventListener).toHaveBeenCalled();
      }
    });
  });

  describe('#disconnectedCallback', () => {
    it('should call cleanup function when component is disconnected', async () => {
      const cleanupSpy = vi.fn();
      const {element} = await renderProductLink();

      // @ts-expect-error private property access for testing
      element.removeLinkEventHandlers = cleanupSpy;

      element?.disconnectedCallback();

      expect(cleanupSpy).toHaveBeenCalledOnce();

      // @ts-expect-error private property access for testing
      expect(element.removeLinkEventHandlers).toBeUndefined();
    });
  });

  describe('when #hrefTemplate is provided', () => {
    let link: Locator;

    const setupTemplate = async (hrefTemplate: string) => {
      const result = await renderProductLink({hrefTemplate});
      link = result.link;
    };

    it('should use template to build href with product field', async () => {
      await setupTemplate('$' + '{clickUri}?id=$' + '{permanentid}');
      const expectedHref = `https://example.com/product/123?id=product-123`;
      expect(link).toHaveAttribute('href', expectedHref);
    });

    it('should use template with additional fields', async () => {
      await setupTemplate(
        '$' + '{clickUri}?custom=$' + '{additionalFields.custom_url_param}'
      );
      const expectedHref = `https://example.com/product/123?custom=custom-value`;
      expect(link).toHaveAttribute('href', expectedHref);
    });
  });

  it('should apply custom attributes to link when attributes slot is provided', async () => {
    const {link} = await renderProductLink({
      attributes: 'target="_blank" download',
    });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('download');
  });

  it('should call #select when link is clicked', async () => {
    const {link, element} = await renderProductLink();

    await link?.click();
    expect(element.interactiveProduct?.select).toHaveBeenCalled();
  });

  it('should call #beginDelayedSelect on touchstart', async () => {
    const {link} = await renderProductLink();

    link?.element().dispatchEvent(new MouseEvent('touchstart'));

    expect(mockInteractiveProduct.beginDelayedSelect).toHaveBeenCalled();
  });

  it('should handle warning messages when available', async () => {
    mockInteractiveProduct.warningMessage = 'Test warning message';

    const {element, link} = await renderProductLink({
      interactiveProduct: mockInteractiveProduct,
    });

    await link.click();

    expect(mockInteractiveProduct.select).toHaveBeenCalled();

    expect(element.bindings?.engine.logger.warn).toHaveBeenCalledWith(
      'Test warning message'
    );
  });

  it('should handle #hrefTemplate property changes', async () => {
    const {element, link} = await renderProductLink();

    if (element) {
      element.hrefTemplate = '$' + '{clickUri}?updated=true';
    }

    await element?.updateComplete;
    const expectedHref = `${mockProduct.clickUri}?updated=true`;
    await expect.element(link).toHaveAttribute('href', expectedHref);
  });

  it('should handle product changes', async () => {
    const {element, link} = await renderProductLink();

    await expect.element(link).toHaveAttribute('href', mockProduct.clickUri);

    const newProduct = buildFakeProduct({
      ec_name: 'Updated Product',
      clickUri: 'https://example.com/updated-product',
    });

    element.product = newProduct;

    await element.updateComplete;
    await expect.element(link).toHaveAttribute('href', newProduct.clickUri);
  });

  it('should render error component when error occurs', async () => {
    const {element} = await renderProductLink();

    if (element) {
      element.error = new Error('Test error');
    }

    await element?.updateComplete;
    const errorComponent = element?.querySelector('atomic-component-error');
    expect(errorComponent).toBeTruthy();
  });
});

import type {Product} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import type {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {AtomicProduct} from './atomic-product';
import './atomic-product';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy?.mockRestore();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const renderProduct = async (
    options: {
      product?: Product;
      content?: ParentNode;
      linkContent?: ParentNode;
      display?: ItemDisplayLayout;
      density?: ItemDisplayDensity;
      imageSize?: ItemDisplayImageSize;
      loadingFlag?: string;
      interfaceType?: 'product-listing' | 'search';
      renderingFunction?: ItemRenderingFunction;
    } = {}
  ) => {
    const {
      product = buildFakeProduct(),
      linkContent = (() => {
        const fragment = document.createDocumentFragment();
        const div = document.createElement('atomic-product-text');
        fragment.appendChild(div);
        return fragment;
      })(),
      display = 'list',
      density = 'normal',
      imageSize = 'icon',
      loadingFlag = 'atomic-product',
      interfaceType = 'product-listing',
      renderingFunction,
    } = options;

    const content =
      'content' in options
        ? options.content
        : renderTemplateContent(defaultTemplateContent);
    const {element} = await renderInAtomicCommerceInterface<AtomicProduct>({
      template: html`<atomic-product
        .product=${product}
        .content=${content}
        .linkContent=${linkContent}
        .display=${display}
        .density=${density}
        .imageSize=${imageSize}
        .stopPropagation=${true}
        .loadingFlag=${loadingFlag}
        .renderingFunction=${renderingFunction}
      ></atomic-product>`,
      selector: 'atomic-product',
      bindings: (bindings) => {
        bindings.interfaceElement.type = interfaceType ?? 'product-listing';
        bindings.store.onChange = vi.fn();
        bindings.store.state.resultList = {
          focusOnFirstResultAfterNextSearch: vi.fn(),
          focusOnNextNewResult: vi.fn(),
        };
        bindings.store.state.loadingFlags = [];
        return bindings;
      },
    });
    return element;
  };

  it('should initialize', async () => {
    const element = await renderProduct();
    expect(element).toBeInstanceOf(AtomicProduct);
  });

  it('should handle click and stop propagation', async () => {
    const element = await renderProduct();
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    element.dispatchEvent(clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should click the link container when the display is "grid"', async () => {
    const clickLinkContainerSpy = vi.fn();
    const element = await renderProduct({
      display: 'grid',
    });

    element.clickLinkContainer = clickLinkContainerSpy;

    const clickEvent = new MouseEvent('click');
    element.dispatchEvent(clickEvent);
    expect(clickLinkContainerSpy).toHaveBeenCalled();
  });

  it('should not click the link container when the display is "list"', async () => {
    const clickLinkContainerSpy = vi.fn();
    const element = await renderProduct({
      display: 'list',
    });

    element.clickLinkContainer = clickLinkContainerSpy;

    const clickEvent = new MouseEvent('click');
    element.dispatchEvent(clickEvent);
    expect(clickLinkContainerSpy).not.toHaveBeenCalled();
  });

  it('should not click the link container when the display is "table"', async () => {
    const clickLinkContainerSpy = vi.fn();
    const element = await renderProduct({
      display: 'table',
    });

    element.clickLinkContainer = clickLinkContainerSpy;

    const clickEvent = new MouseEvent('click');
    element.dispatchEvent(clickEvent);
    expect(clickLinkContainerSpy).not.toHaveBeenCalled();
  });

  it('should render default template content', async () => {
    const element = await renderProduct();
    const resultRoot = element.shadowRoot!.querySelector('.result-root');
    expect(resultRoot?.innerHTML).toContain('atomic-product-section-name');
    expect(resultRoot?.innerHTML).toContain('atomic-product-link');
  });

  it('should unset the loading flag on first update', async () => {
    const mockUnsetLoadingFlag = vi.fn();
    const loadingFlag = 'test-loading-flag';

    const element = await renderProduct({
      loadingFlag,
    });

    element.store = {
      ...element.store!,
      unsetLoadingFlag: mockUnsetLoadingFlag,
    };

    (
      element as {
        firstUpdated: (changedProperties: Map<string, unknown>) => void;
      }
    ).firstUpdated(new Map());

    expect(mockUnsetLoadingFlag).toHaveBeenCalledWith(loadingFlag);
  });

  describe('#clickLinkContainer', () => {
    it('should click the anchor element when found', async () => {
      const element = await renderProduct();
      const mockClick = vi.fn();
      const mockAnchor = {click: mockClick};
      const mockQuerySelector = vi.fn().mockReturnValue(mockAnchor);
      vi.spyOn(element.shadowRoot!, 'querySelector').mockImplementation(
        mockQuerySelector
      );

      element.clickLinkContainer();

      expect(mockQuerySelector).toHaveBeenCalledWith(
        '.link-container > atomic-product-link a:not([slot])'
      );
      expect(mockClick).toHaveBeenCalled();
    });

    it('should not throw when anchor element is not found', async () => {
      const element = await renderProduct();

      vi.spyOn(element.shadowRoot!, 'querySelector').mockReturnValue(null);

      expect(() => element.clickLinkContainer()).not.toThrow();
    });

    it('should not throw when shadowRoot is null', async () => {
      const element = await renderProduct();

      Object.defineProperty(element, 'shadowRoot', {
        get: () => null,
        configurable: true,
      });

      expect(() => element.clickLinkContainer()).not.toThrow();
    });
  });

  describe('when using the default rendering function', () => {
    it('should not add "with-sections" class when content does not have sections', async () => {
      const element = await renderProduct({
        content: renderTemplateContent('<div>No Sections</div>'),
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });

    it('should add "with-sections" class when content has sections', async () => {
      const element = await renderProduct();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });
  });

  describe('when using a custom rendering function', () => {
    const renderingFunction: ItemRenderingFunction = vi.fn(
      (product, productRootRef, linkContainerRef) => {
        productRootRef.textContent = `Custom Product: ${product.ec_name}`;
        linkContainerRef.textContent = 'Custom Link Content';
        return productRootRef.outerHTML;
      }
    );

    it('should call the custom rendering function', async () => {
      await renderProduct({renderingFunction});
      expect(renderingFunction).toHaveBeenCalled();
    });

    it('should render custom product content in result root', async () => {
      const element = await renderProduct({
        renderingFunction,
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.textContent).toContain('Custom Product:');
    });

    it('should render custom link content in link container', async () => {
      const element = await renderProduct({
        renderingFunction,
      });
      const linkContainer =
        element.shadowRoot!.querySelector('.link-container');
      expect(linkContainer?.textContent).toContain('Custom Link Content');
    });

    it('should not add "with-sections" class when content does not have sections', async () => {
      const element = await renderProduct({
        renderingFunction,
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });

    it('should add "with-sections" class when content has sections', async () => {
      const renderingFunctionWithSections: ItemRenderingFunction = vi.fn(
        () =>
          '<atomic-product-section-visual">Custom</atomic-product-section-visual>'
      );
      const element = await renderProduct({
        renderingFunction: renderingFunctionWithSections,
      });
      expect(renderingFunctionWithSections).toHaveBeenCalled();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });
  });

  describe('when content is undefined', () => {
    describe('#connectedCallback', () => {
      it('should log warning', async () => {
        await renderProduct({content: undefined});
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'atomic-product: content property is undefined. Cannot create layout.',
          expect.any(AtomicProduct)
        );
      });

      it('should return early and not create layout', async () => {
        const element = await renderProduct({content: undefined});
        const layoutProperty = (element as unknown as {layout: unknown}).layout;
        expect(layoutProperty).toBeUndefined();
      });

      it('should not throw error', async () => {
        expect(async () => {
          await renderProduct({content: undefined});
        }).not.toThrow();
      });
    });

    describe('#getContentHTML', () => {
      it('should log warning', async () => {
        const element = await renderProduct({content: undefined});
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);

        getContentHTMLMethod();

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'atomic-product: content property is undefined. Cannot get content HTML.',
          expect.any(AtomicProduct)
        );
      });

      it('should return empty string', async () => {
        const element = await renderProduct({content: undefined});
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);
        const result = getContentHTMLMethod();
        expect(result).toBe('');
      });

      it('should not throw error', async () => {
        const element = await renderProduct({content: undefined});
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);

        expect(() => getContentHTMLMethod()).not.toThrow();
      });
    });

    describe('#render', () => {
      it('should not call layout methods when layout is undefined', async () => {
        const element = await renderProduct({content: undefined});

        expect(() => element.render()).not.toThrow();

        const componentRoot =
          element.shadowRoot!.querySelector('.result-component');
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(componentRoot).toBeTruthy();
        expect(resultRoot).toBeNull();
      });

      it('should handle custom rendering function mode', async () => {
        const renderingFunction: ItemRenderingFunction = vi.fn(
          (_product, productRootRef) => {
            productRootRef.textContent = 'Custom content without layout';
            return productRootRef.outerHTML;
          }
        );

        const element = await renderProduct({
          content: undefined,
          renderingFunction,
        });

        expect(renderingFunction).toHaveBeenCalled();
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot?.textContent).toContain(
          'Custom content without layout'
        );
      });
    });

    describe('#updated', () => {
      it('should not throw error when layout is undefined in custom rendering mode', async () => {
        const renderingFunction: ItemRenderingFunction = vi.fn(
          (_product, productRootRef) => {
            productRootRef.textContent = 'Updated content';
            return '<div>Updated HTML</div>';
          }
        );

        const element = await renderProduct({
          content: undefined,
          renderingFunction,
        });

        expect(() => {
          element.requestUpdate();
        }).not.toThrow();

        await element.updateComplete;
        expect(renderingFunction).toHaveBeenCalled();
      });
    });
  });
});

const renderTemplateContent = (content: string) => {
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  return fragment;
};

const defaultTemplateContent = `<atomic-product-section-name>
                <atomic-product-link class="font-bold"></atomic-product-link>
              </atomic-product-section-name>
              <atomic-product-section-visual>
                <atomic-product-field-condition if-defined="ec_thumbnails">
                  <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                </atomic-product-field-condition>
              </atomic-product-section-visual>
              <atomic-product-section-metadata>
                <atomic-product-field-condition if-defined="ec_brand">
                  <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
                </atomic-product-field-condition>
                <atomic-product-field-condition if-defined="cat_available_sizes">
                  <atomic-product-multi-value-text
                    field="cat_available_sizes"
                  ></atomic-product-multi-value-text>
                </atomic-product-field-condition>
                <atomic-product-field-condition if-defined="ec_rating">
                  <atomic-product-rating field="ec_rating"></atomic-product-rating>
                </atomic-product-field-condition>
              </atomic-product-section-metadata>
              <atomic-product-section-emphasized>
                <atomic-product-price currency="USD"></atomic-product-price>
              </atomic-product-section-emphasized>
              <atomic-product-section-children>
                <atomic-product-children></atomic-product-children>
              </atomic-product-section-children>`;

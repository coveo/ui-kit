import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {Product} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {ItemRenderingFunction} from '../../common/item-list/item-list-common';
import {AtomicProduct} from './atomic-product';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicProduct', () => {
  it('should initialize', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicProduct);
  });

  it('should handle click and stop propagation', async () => {
    const element = await setupElement();
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    element.dispatchEvent(clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should render default template content', async () => {
    const element = await setupElement();
    const resultRoot = element.shadowRoot!.querySelector('.result-root');
    expect(resultRoot?.innerHTML).toContain('atomic-product-section-name');
    expect(resultRoot?.innerHTML).toContain('atomic-product-link');
  });

  describe('when using the default rendering function', () => {
    it('should not add "with-sections" class when content does not have sections', async () => {
      const element = await setupElement({
        content: renderTemplateContent('<div>No Sections</div>'),
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });

    it('should add "with-sections" class when content has sections', async () => {
      const element = await setupElement();
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
      await setupElement({renderingFunction});
      expect(renderingFunction).toHaveBeenCalled();
    });

    it('should render custom product content in result root', async () => {
      const element = await setupElement({
        renderingFunction,
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.textContent).toContain('Custom Product:');
    });

    it('should render custom link content in link container', async () => {
      const element = await setupElement({
        renderingFunction,
      });
      const linkContainer =
        element.shadowRoot!.querySelector('.link-container');
      expect(linkContainer?.textContent).toContain('Custom Link Content');
    });

    it('should not add "with-sections" class when content does not have sections', async () => {
      const element = await setupElement({
        renderingFunction,
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });

    it('should add "with-sections" class when content has sections', async () => {
      const renderingFunctionWithSections: ItemRenderingFunction = vi.fn(
        () =>
          '<atomic-result-section-visual">Custom</atomic-result-section-visual>'
      );
      const element = await setupElement({
        renderingFunction: renderingFunctionWithSections,
      });
      expect(renderingFunctionWithSections).toHaveBeenCalled();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });
  });

  const setupElement = async ({
    product = buildFakeProduct(),
    content = renderTemplateContent(defaultTemplateContent),
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
  }: {
    product?: Product;
    content?: ParentNode;
    linkContent?: ParentNode;
    display?: ItemDisplayLayout;
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    loadingFlag?: string;
    interfaceType?: 'product-listing' | 'search';
    renderingFunction?: ItemRenderingFunction;
  } = {}) => {
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

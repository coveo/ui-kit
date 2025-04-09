import {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components/common/layout/display-options';
import {
  getPartialInstantItemElement,
  getPartialInstantItemShowAllElement,
  instantItemShowAllButton,
} from '@/src/components/common/suggestions/instant-item';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '@/src/components/common/suggestions/suggestions-common';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {encodeForDomAttribute} from '@/src/utils/string-utils';
import {
  buildInstantProducts,
  InstantProducts,
  Product,
  SearchBox,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductTemplateProvider} from '../../product-list/product-template-provider';

export type AriaLabelGenerator = (
  bindings: CommerceBindings,
  product: Product
) => string | undefined;

/**
 * The atomic-commerce-search-box-instant-products is a component that does something.
 */
@customElement('atomic-commerce-search-box-instant-products')
@withTailwindStyles
export class AtomicCommerceSearchBoxInstantProducts
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  public bindings!: SearchBoxSuggestionsBindings<SearchBox, CommerceBindings>;
  private itemRenderingFunction: ItemRenderingFunction;
  private products: Product[] = [];
  private itemTemplateProvider!: ProductTemplateProvider;
  private instantProducts!: InstantProducts;
  private display: ItemDisplayLayout = 'list';

  @state() public error!: Error;
  @state() private templateHasError = false;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of different parts in a product.
   */
  @property({reflect: true}) public density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed in the products.
   */
  @property({attribute: 'image-size', reflect: true})
  public imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The callback to generate an [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) for a given product so that accessibility tools can fully describe what's visually rendered by a product.
   *
   * By default, or if an empty string is returned, `product.ec_name` is used.
   */
  @property() public ariaLabelGenerator?: AriaLabelGenerator;

  willUpdate() {
    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, CommerceBindings>(
        (bindings) => {
          this.bindings = bindings;
          return this.initialize();
        },
        this
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  private getLink(el: HTMLElement): HTMLElement | null {
    const atomicProduct =
      el.tagName === 'ATOMIC-PRODUCT'
        ? el
        : el?.querySelector('atomic-product');

    return (
      atomicProduct?.shadowRoot?.querySelector(
        'atomic-product-link a:not([slot])'
      ) || null
    );
  }

  private handleLinkClick(el: HTMLElement, hasModifier: boolean) {
    const setTarget = (value: string) => el.setAttribute('target', value);
    const initialTarget = el.getAttribute('target');

    hasModifier && setTarget('_blank');
    el.click();
    hasModifier && setTarget(initialTarget || '');

    return true;
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    if (!this.bindings.suggestedQuery() || this.bindings.store.isMobile()) {
      return [];
    }
    const products = this.instantProducts.state.products.length
      ? this.instantProducts.state.products
      : this.products;

    const elements: SearchBoxSuggestionElement[] = products.map(
      (product: Product) => {
        const interactiveProduct = this.instantProducts.interactiveProduct({
          options: {product},
        });
        const partialItem = getPartialInstantItemElement(
          this.bindings.i18n,
          this.ariaLabelGenerator?.(this.bindings, product) || product.ec_name!,
          product.permanentid
        );
        const key = `instant-product-${encodeForDomAttribute(
          product.permanentid
        )}`;
        return {
          ...partialItem,
          content: html`${keyed(
            key,
            html`<atomic-product
              part="outline"
              .product=${product}
              .interactiveProduct=${interactiveProduct}
              .display=${this.display}
              .density=${this.density}
              .imageSize=${this.imageSize}
              .content=${this.itemTemplateProvider.getTemplateContent(product)}
              .stopPropagation=${false}
              .renderingFunction=${this.itemRenderingFunction}
            ></atomic-product>`
          )}`,
          onSelect: (e: MouseEvent) => {
            const link = this.getLink(e.target as HTMLElement);

            if (!link) {
              return;
            }
            this.handleLinkClick(link, e.ctrlKey || e.metaKey);
          },
        };
      }
    );
    if (elements.length) {
      const partialItem = getPartialInstantItemShowAllElement(
        this.bindings.i18n
      );
      elements.push({
        ...partialItem,
        content: instantItemShowAllButton({
          props: {i18n: this.bindings.i18n},
        }),
        onSelect: () => {
          this.bindings.clearSuggestions();
          this.bindings.searchBoxController.updateText(
            this.instantProducts.state.query
          );
          this.bindings.searchBoxController.submit();
        },
      });
    }
    return elements;
  }

  public initialize(): SearchBoxSuggestions {
    this.instantProducts = buildInstantProducts(this.bindings.engine, {
      options: {},
    });

    this.bindings.store.onChange('activeProductChild', () => {
      if (this.bindings.store.state.activeProductChild) {
        this.instantProducts.promoteChildToParent(
          this.bindings.store.state.activeProductChild
        );
      }
    });

    this.itemTemplateProvider = new ProductTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.querySelectorAll('atomic-product-template')
      ),
      getResultTemplateRegistered: () => true,
      setResultTemplateRegistered: () => {},
      getTemplateHasError: () => this.templateHasError,
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
    });

    return {
      position: Array.from(this.parentNode!.children).indexOf(this),
      panel: 'right',
      onSuggestedQueryChange: (q) => {
        this.instantProducts.updateQuery(q);
        return this.onSuggestedQueryChange();
      },
      renderItems: () => this.renderItems(),
    };
  }

  private onSuggestedQueryChange() {
    if (
      !this.bindings.getSuggestionElements().length &&
      !this.bindings.searchBoxController.state.value
    ) {
      console.warn(
        "There doesn't seem to be any query suggestions configured. Make sure to include either an atomic-commerce-search-box-query-suggestions or atomic-commerce-search-box-recent-queries in your search box in order to see some instant products."
      );
    }

    return new Promise<void>((resolve) => {
      const unsubscribe = this.instantProducts.subscribe(() => {
        const state = this.instantProducts.state;
        if (!state.isLoading) {
          if (state.products.length) {
            this.products = state.products;
          }
          unsubscribe();
          resolve();
        }
      });
    });
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`TODO`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-search-box-instant-products': AtomicCommerceSearchBoxInstantProducts;
  }
}

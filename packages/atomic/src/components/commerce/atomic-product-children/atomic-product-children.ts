import type {ChildProduct} from '@coveo/headless/commerce';
import {ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators';
import {errorGuard} from '@/src/decorators/error-guard';
import {injectStylesForNoShadowDOM} from '@/src/decorators/light-dom';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {filterProtocol} from '../../../utils/xss-utils';
import {renderButton} from '../../common/button';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-product-children.tw.css';
import type {SelectChildProductEventArgs} from './select-child-product-event';
import '../atomic-commerce-text/atomic-commerce-text';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';

/**
 * The `atomic-product-children` component renders a section that allows the user to select a nested product (e.g., a color variant of a given product).
 *
 * This component leverages the [product grouping](https://docs.coveo.com/en/l78i2152/) feature.
 * @alpha
 */
@customElement('atomic-product-children')
@bindings()
@injectStylesForNoShadowDOM
@withTailwindStyles
export class AtomicProductChildren
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles = unsafeCSS(styles);

  @state() bindings!: CommerceBindings;

  private productController = createProductContextController(this);

  @state() private childProducts: ChildProduct[] = [];
  @state() private activeChildId: string = '';

  public error!: Error;

  initialize() {
    const product = this.productController.item;
    if (product) {
      this.activeChildId = product.permanentid;
      this.childProducts = product.children ?? [];
    }
  }

  /**
   * The non-localized label to display for the product children section.
   *
   * Set this to an empty string if you do not want to render the label at all.
   */
  @property() public label: string = 'available-in';

  /**
   * The child product field to use to render product children images. Fields in the `additionalFields` property of the child products are supported.
   *
   * This field should be defined on each child product, and its value should be an image URL (or an array of image URLs, in which case the component will use the first one in the array).
   */
  @property({reflect: true}) field: string = 'ec_thumbnails';

  /**
   * The fallback image URL to use when the specified `field` is not defined on a given child product, or when its value is invalid.
   */
  @property({reflect: true}) fallback: string =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="gray"%3E%3C/rect%3E%3C/svg%3E';

  private onSelectChild(child: ChildProduct) {
    this.activeChildId = child.permanentid;
    this.dispatchEvent(
      new CustomEvent('atomic/selectChildProduct', {
        detail: {child} as SelectChildProductEventArgs,
        bubbles: true,
        composed: true,
      })
    );
  }

  private getImageUrl(child: ChildProduct) {
    const value = ProductTemplatesHelpers.getProductProperty(child, this.field);

    if (typeof value === 'string') {
      return filterProtocol(value);
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return filterProtocol(value[0]);
    }

    return filterProtocol(this.fallback);
  }

  private renderChild(child: ChildProduct) {
    const childName = child.ec_name ?? '';

    const buttonClasses = tw({
      'product-child': true,
      'box-border rounded border border-primary':
        child.permanentid === this.activeChildId,
    });

    return html`
      <button
        class="${multiClassMap(buttonClasses)}"
        title=${childName}
        @keypress=${(event: KeyboardEvent) =>
          event.key === 'Enter' && this.onSelectChild(child)}
        @mouseenter=${() => this.onSelectChild(child)}
        @touchstart=${(event: TouchEvent) => {
          event.stopPropagation();
          event.preventDefault();
          this.onSelectChild(child);
        }}
      >
        <img
          class="aspect-square p-1"
          src=${this.getImageUrl(child)}
          alt=${childName}
          loading="lazy"
        />
      </button>
    `;
  }

  private renderLabel() {
    return html`
      <div class="text-neutral-dark my-2 font-semibold">
        <atomic-commerce-text
          .value=${this.bindings.i18n.t(this.label)}
        ></atomic-commerce-text>
      </div>
    `;
  }

  @errorGuard()
  render() {
    if (this.childProducts.length === 0) {
      return html`${nothing}`;
    }

    return html`
      ${this.label.trim() !== '' ? this.renderLabel() : nothing}
      <div class="children-container">
        ${this.childProducts.map((child) => this.renderChild(child))}
        ${renderButton({
          props: {
            style: 'text-primary',
            class: 'product-child plus-button',
          },
        })(html`+${this.productController.item?.totalNumberOfChildren! - 5}`)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-children': AtomicProductChildren;
  }
}

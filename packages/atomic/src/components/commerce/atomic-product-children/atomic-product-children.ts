import type {ChildProduct} from '@coveo/headless/commerce';
import {ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {filterProtocol} from '../../../utils/xss-utils';
import {renderButton} from '../../common/button';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import type {SelectChildProductEventArgs} from './select-child-product-event';
import '../atomic-commerce-text/atomic-commerce-text';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {closest} from '@/src/utils/dom-utils';
import type {AtomicProduct} from '../atomic-product/atomic-product';

/**
 * Maximum number of child products to display before showing a "+N" button.
 * This limit ensures a consistent UI and prevents layout issues with large product variants.
 */
const AMOUNT_OF_VISIBLE_CHILDREN = 5;

/**
 * The `atomic-product-children` component renders a section that allows the user to select a nested product (for example, a color variant of a given product).
 *
 * This component leverages the [product grouping](https://docs.coveo.com/en/l78i2152/) feature.
 *
 * The component displays up to 5 child products before showing a "+N" button for additional variants.
 * This limit ensures consistent UI layout while preventing performance issues with large product variant collections.
 */
@customElement('atomic-product-children')
@bindings()
export class AtomicProductChildren
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
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
   * The i18n key for the localized label to display for the product children section.
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

  private handleClick = (event: MouseEvent) => {
    if (this.parentElement?.tagName !== 'A') {
      closest<AtomicProduct>(this, 'atomic-product')!.clickLinkContainer();
    } else {
      event.stopPropagation();
    }
  };

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
        @click=${this.handleClick}
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

  /**
   * Gets the total count of items, including the parent item itself.
   *
   * The calculation subtracts the number of child items from the total number of children,
   * then adds 1 to include the parent item in the count. This is necessary because
   * `children.length` only represents the number of children of the parent, while
   * the parent is also included in the `atomic-product-children` component.
   *
   * @returns The total count of items, including the parent.
   */
  get count() {
    const hiddenChildrenCount = Math.max(
      0,
      this.childProducts.length - AMOUNT_OF_VISIBLE_CHILDREN
    );

    return (
      this.productController.item?.totalNumberOfChildren! -
      this.productController.item?.children.length! +
      hiddenChildrenCount
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (this.childProducts.length === 0) {
      return html`${nothing}`;
    }

    const visibleChildren = this.childProducts.slice(
      0,
      AMOUNT_OF_VISIBLE_CHILDREN
    );

    return html`
      ${this.label.trim() !== '' ? this.renderLabel() : nothing}
      <div class="flex flex-wrap">
        ${visibleChildren.map((child) => this.renderChild(child))}
        ${
          this.count > 0
            ? renderButton({
                props: {
                  style: 'text-primary',
                  class: 'product-child',
                  onClick: this.handleClick,
                },
              })(html`+${this.count}`)
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-children': AtomicProductChildren;
  }
}

import {Schema, StringValue} from '@coveo/bueno';
import type {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef} from 'lit/directives/ref.js';
import {booleanConverter} from '@/src/converters/boolean-converter.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  renderExpandableText,
  type TruncateAfter,
} from '../../common/expandable-text/expandable-text.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import '../atomic-product-text/atomic-product-text.js';

/**
 * The `atomic-product-description` component renders the description of a product.
 *
 * @part expandable-text - The part that contains the product description text.
 */
@customElement('atomic-product-description')
@withTailwindStyles
@bindings()
export class AtomicProductDescription
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  public error!: Error;

  private productController = createProductContextController(this);

  @state()
  private isExpanded = false;
  @state()
  private isTruncated = false;

  private resizeObserver: ResizeObserver;
  private descriptionRef = createRef<HTMLDivElement>();

  /**
   * The number of lines after which the product description should be truncated. A value of "none" will disable truncation.
   */
  @property({
    type: String,
    attribute: 'truncate-after',
  })
  public truncateAfter: TruncateAfter = '2';

  /**
   * The name of the description field to use.
   */
  @property()
  public field: 'ec_description' | 'ec_shortdesc' = 'ec_shortdesc';

  /**
   * Whether the description should be collapsible after being expanded.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    attribute: 'is-collapsible',
  })
  public isCollapsible = true;

  initialize() {}

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(() => {
      if (this.descriptionRef.value) {
        this.isTruncated =
          this.descriptionRef.value.scrollHeight >
          this.descriptionRef.value.clientHeight;
      }
    });
  }

  private validateProps() {
    new Schema({
      truncateAfter: new StringValue({
        constrainTo: ['none', '1', '2', '3', '4'],
      }),
      field: new StringValue({
        constrainTo: ['ec_shortdesc', 'ec_description'],
      }),
    }).validate({
      truncateAfter: this.truncateAfter,
      field: this.field,
    });
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('truncateAfter') ||
      changedProperties.has('field')
    ) {
      this.validateProps();
    }
  }

  firstUpdated() {
    if (this.descriptionRef.value) {
      this.resizeObserver.observe(this.descriptionRef.value);
    }
  }

  private onToggleExpand = (e?: MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    this.isExpanded = !this.isExpanded;
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver.disconnect();
  }

  private get product(): Product | null {
    return this.productController.item;
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const productDescription = this.product?.[this.field] ?? null;

    if (!productDescription) {
      return html`${nothing}`;
    }

    return html`${renderExpandableText({
      props: {
        isExpanded: this.isExpanded,
        isTruncated: this.isTruncated,
        truncateAfter: this.truncateAfter,
        onToggleExpand: this.onToggleExpand,
        showMoreLabel: this.bindings.i18n.t('show-more'),
        showLessLabel: this.bindings.i18n.t('show-less'),
        isCollapsible: this.isCollapsible,
        textRef: this.descriptionRef,
      },
    })(html`
      <atomic-product-text field=${this.field}></atomic-product-text>
    `)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-description': AtomicProductDescription;
  }
}

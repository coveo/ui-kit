import {Schema, StringValue} from '@coveo/bueno';
import type {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef} from 'lit/directives/ref.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {
  renderExpandableText,
  type TruncateAfter,
} from '../../common/expandable-text/expandable-text';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-product-text/atomic-product-text.js';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-product-excerpt` component renders the excerpt of a product.
 */
@customElement('atomic-product-excerpt')
@bindings()
export class AtomicProductExcerpt
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  public error!: Error;

  private productController = createProductContextController(this);

  @state() private isExpanded = false;
  @state() private isTruncated = false;

  private resizeObserver: ResizeObserver;
  private excerptRef = createRef<HTMLDivElement>();

  /**
   * The number of lines after which the product excerpt should be truncated. A value of "none" will disable truncation.
   */
  @property({type: String, attribute: 'truncate-after'})
  public truncateAfter: TruncateAfter = '2';

  /**
   * Whether the excerpt should be collapsible after being expanded.
   */
  @property({
    type: Boolean,
    attribute: 'is-collapsible',
    converter: booleanConverter,
  })
  public isCollapsible = false;

  public initialize() {}

  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(() => {
      if (this.excerptRef.value) {
        this.isTruncated =
          this.excerptRef.value.scrollHeight >
          this.excerptRef.value.clientHeight;
      }
    });
  }

  private validateProps() {
    new Schema({
      truncateAfter: new StringValue({
        constrainTo: ['none', '1', '2', '3', '4'],
      }),
    }).validate({
      truncateAfter: this.truncateAfter,
    });
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('truncateAfter')) {
      this.validateProps();
    }
    if (this.excerptRef.value) {
      this.resizeObserver.observe(this.excerptRef.value);
    }
  }

  private onToggleExpand(e?: MouseEvent) {
    if (e) {
      e.stopPropagation();
    }

    this.isExpanded = !this.isExpanded;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver.disconnect();
  }

  private get product(): Product | null {
    return this.productController.item;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const productExcerpt = this.product?.excerpt ?? null;

    if (!productExcerpt) {
      return html`${nothing}`;
    }

    return html`${renderExpandableText({
      props: {
        isExpanded: this.isExpanded,
        isTruncated: this.isTruncated,
        truncateAfter: this.truncateAfter,
        onToggleExpand: (e) => this.onToggleExpand(e),
        showMoreLabel: this.bindings.i18n.t('show-more'),
        showLessLabel: this.bindings.i18n.t('show-less'),
        isCollapsible: this.isCollapsible,
        textRef: this.excerptRef,
      },
    })(html`<atomic-product-text field="excerpt"></atomic-product-text>`)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-excerpt': AtomicProductExcerpt;
  }
}

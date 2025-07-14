import {Schema, StringValue} from '@coveo/bueno';
import type {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  renderExpandableText,
  type TruncateAfter,
} from '../../common/expandable-text/expandable-text';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-product-text/atomic-product-text';
import styles from './atomic-product-excerpt.tw.css';

/**
 * The `atomic-product-excerpt` component renders the excerpt of a product generated at query time.
 * @alpha
 */
@customElement('atomic-product-excerpt')
@bindings()
@withTailwindStyles
export class AtomicProductExcerpt
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles = unsafeCSS(styles);

  @state() bindings!: CommerceBindings;

  private productController = createProductContextController(this);

  @state() private product?: Product;

  public error!: Error;

  @state() private isExpanded = false;
  @state() private isTruncated = false;

  private resizeObserver?: ResizeObserver;

  /**
   * The number of lines after which the product excerpt should be truncated. A value of "none" will disable truncation.
   */
  @property() public truncateAfter: TruncateAfter = '2';

  /**
   * Whether the excerpt should be collapsible after being expanded.
   */
  @property() public isCollapsible = false;

  protected createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.validateProps();
  }

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
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

  firstUpdated() {
    this.setupResizeObserver();
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      const excerptElement = this.querySelector('.expandable-text');
      if (
        excerptElement &&
        excerptElement.scrollHeight > excerptElement.offsetHeight
      ) {
        this.isTruncated = true;
      } else {
        this.isTruncated = false;
      }
    });

    // Observe the expandable text element after it's created
    this.updateComplete.then(() => {
      const excerptElement = this.querySelector('.expandable-text');
      if (excerptElement) {
        this.resizeObserver?.observe(excerptElement);
      }
    });
  }

  private onToggleExpand(e?: MouseEvent) {
    if (e) {
      e.stopPropagation();
    }

    this.isExpanded = !this.isExpanded;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  @errorGuard()
  @bindingGuard({level: 'error'})
  render() {
    const productExcerpt = this.product?.['excerpt'] ?? null;

    if (!productExcerpt) {
      return nothing;
    }

    return renderExpandableText({
      props: {
        isExpanded: this.isExpanded,
        isTruncated: this.isTruncated,
        truncateAfter: this.truncateAfter,
        onToggleExpand: (e) => this.onToggleExpand(e),
        showMoreLabel: this.bindings.i18n.t('show-more'),
        showLessLabel: this.bindings.i18n.t('show-less'),
        isCollapsible: this.isCollapsible,
      },
    })(html`
      <atomic-product-text field="excerpt"></atomic-product-text>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-excerpt': AtomicProductExcerpt;
  }
}
import {Schema, StringValue} from '@coveo/bueno';
import type {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators';
import {errorGuard} from '@/src/decorators/error-guard';
import {injectStylesForNoShadowDOM} from '@/src/decorators/light-dom';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {
  renderExpandableText,
  type TruncateAfter,
} from '../../common/expandable-text/expandable-text';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-product-excerpt.tw.css';

/**
 * The `atomic-product-excerpt` component renders the excerpt of a product generated at query time.
 * @alpha
 */
@customElement('atomic-product-excerpt')
@bindings()
@injectStylesForNoShadowDOM
@withTailwindStyles
export class AtomicProductExcerpt
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles = unsafeCSS(styles);
  @state()
  bindings!: CommerceBindings;

  public error!: Error;

  private productController = createProductContextController(this);

  @state() private isExpanded = false;
  @state() private isTruncated = false;

  private excerptText!: HTMLDivElement;
  private resizeObserver: ResizeObserver;
  /**
   * The number of lines after which the product excerpt should be truncated. A value of "none" will disable truncation.
   */
  @property({type: String, attribute: 'truncate-after'})
  public truncateAfter: TruncateAfter = '2';

  /**
   * Whether the excerpt should be collapsible after being expanded.
   */
  @property({type: Boolean, attribute: 'is-collapsible'}) public isCollapsible =
    false;

  public initialize() {}

  constructor() {
    super();
    console.log(this.truncateAfter);
    this.resizeObserver = new ResizeObserver(() => {
      if (
        this.excerptText &&
        this.excerptText.scrollHeight > this.excerptText.offsetHeight
      ) {
        this.isTruncated = true;
      } else {
        this.isTruncated = false;
      }
    });
    console.log(this.truncateAfter);
    this.validateProps();
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
    this.excerptText = this?.querySelector(
      '.expandable-text'
    ) as HTMLDivElement;
    if (this.excerptText) {
      this.resizeObserver.observe(this.excerptText);
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
      },
    })(html`<atomic-product-text field="excerpt"></atomic-product-text>`)}`;
  }
}

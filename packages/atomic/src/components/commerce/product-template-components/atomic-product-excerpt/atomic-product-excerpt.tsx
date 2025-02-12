import {Schema, StringValue} from '@coveo/bueno';
import {Product} from '@coveo/headless/commerce';
import {Component, State, h, Element, Prop} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  ExpandableText,
  TruncateAfter,
} from '../../../common/expandable-text/expandable-text';
import {Hidden} from '../../../common/stencil-hidden';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

/**
 * @alpha
 * The `atomic-product-excerpt` component renders the excerpt of a product generated at query time.
 */
@Component({
  tag: 'atomic-product-excerpt',
  styleUrl: 'atomic-product-excerpt.pcss',
  shadow: false,
})
export class AtomicProductExcerpt
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  @ProductContext() private product!: Product;

  @Element() hostElement!: HTMLElement;

  public error!: Error;

  @State() private isExpanded = false;
  @State() private isTruncated = false;

  private excerptText!: HTMLDivElement;
  private resizeObserver: ResizeObserver;

  /**
   * The number of lines after which the product excerpt should be truncated. A value of "none" will disable truncation.
   */
  @Prop() public truncateAfter: TruncateAfter = '2';

  /**
   * Whether the excerpt should be collapsible after being expanded.
   */
  @Prop() public isCollapsible = false;

  constructor() {
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

  componentDidLoad() {
    this.excerptText = this.hostElement.querySelector(
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
    this.resizeObserver.disconnect();
  }

  public render() {
    const productExcerpt = this.product['excerpt'] ?? null;

    if (!productExcerpt) {
      return <Hidden />;
    }

    return (
      <ExpandableText
        isExpanded={this.isExpanded}
        isTruncated={this.isTruncated}
        truncateAfter={this.truncateAfter}
        onToggleExpand={(e) => this.onToggleExpand(e)}
        showMoreLabel={this.bindings.i18n.t('show-more')}
        showLessLabel={this.bindings.i18n.t('show-less')}
        isCollapsible={this.isCollapsible}
      >
        <atomic-product-text field="excerpt"></atomic-product-text>
      </ExpandableText>
    );
  }
}

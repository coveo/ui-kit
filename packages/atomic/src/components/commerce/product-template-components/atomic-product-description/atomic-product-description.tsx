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
 * The `atomic-product-description` component renders the description of a product.
 */
@Component({
  tag: 'atomic-product-description',
  styleUrl: 'atomic-product-description.pcss',
  shadow: false,
})
export class AtomicProductDescription
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  @ProductContext() private product!: Product;

  @Element() hostElement!: HTMLElement;

  public error!: Error;

  @State() private isExpanded = false;
  @State() private isTruncated = false;

  private descriptionText!: HTMLDivElement;
  private resizeObserver: ResizeObserver;

  /**
   * The number of lines after which the product description should be truncated. A value of "none" will disable truncation.
   */
  @Prop() public truncateAfter: TruncateAfter = '2';

  /**
   * The name of the description field to use.
   */
  @Prop() public field: 'ec_description' | 'ec_shortdesc' = 'ec_shortdesc';

  /**
   * Whether the description should be collapsible after being expanded.
   */
  @Prop() public isCollapsible = true;

  constructor() {
    this.resizeObserver = new ResizeObserver(() => {
      if (
        this.descriptionText &&
        this.descriptionText.scrollHeight > this.descriptionText.clientHeight
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
      field: new StringValue({
        constrainTo: ['ec_shortdesc', 'ec_description'],
      }),
    }).validate({
      truncateAfter: this.truncateAfter,
      field: this.field,
    });
  }

  componentDidLoad() {
    this.descriptionText = this.hostElement.querySelector(
      '.expandable-text'
    ) as HTMLDivElement;
    if (this.descriptionText) {
      this.resizeObserver.observe(this.descriptionText);
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
    const productDescription = this.product[this.field] ?? null;

    if (!productDescription) {
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
        <atomic-product-text field={this.field}></atomic-product-text>
      </ExpandableText>
    );
  }
}

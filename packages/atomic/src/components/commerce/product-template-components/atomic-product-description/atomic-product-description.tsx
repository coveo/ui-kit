import {Product} from '@coveo/headless/commerce';
import {Component, State, h, Element, Prop} from '@stencil/core';
import ArrowDown from '../../../../images/arrow-down.svg';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

/**
 * @internal
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
  private resizeObserver!: ResizeObserver;

  /**
   * The number of lines after which the product description should be truncated.
   */
  @Prop() public truncateAfter?: 1 | 2 | 3 | 4 = 2;

  /**
   * Whether the product description should be truncated.
   */
  @Prop() public shouldTruncate: boolean = true;

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
  }

  componentDidLoad() {
    this.descriptionText = this.hostElement.querySelector(
      '.product-description-text'
    ) as HTMLDivElement;
    if (this.descriptionText) {
      this.resizeObserver.observe(this.descriptionText);
    }
  }

  private onToggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  private getLineClampClass() {
    const lineClampMap = {
      1: 'line-clamp-1',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
    };
    return (
      lineClampMap[this.truncateAfter as keyof typeof lineClampMap] ||
      'line-clamp-2'
    );
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }

  private renderProductDescription() {
    // TODO: add support for ec_description
    const productDescription = this.product.ec_shortdesc ?? '';

    if (productDescription !== null) {
      return (
        <atomic-commerce-text
          class={`product-description-text ${!this.isExpanded && this.shouldTruncate ? this.getLineClampClass() : ''}`}
          value={getFieldValueCaption(
            'ec_shortdesc',
            productDescription,
            this.bindings.i18n
          )}
        ></atomic-commerce-text>
      );
    }
  }

  private renderShowMoreButton() {
    return (
      <Button
        style="text-primary"
        part="label-button"
        class={`mt-1 p-1 self-end ${this.isExpanded ? 'hidden' : ''}`}
        title={this.bindings.i18n.t('show-more')}
        onClick={() => this.onToggleExpand()}
      >
        {this.bindings.i18n.t('show-more')}
        <atomic-icon
          icon={ArrowDown}
          class="w-2 ml-1 align-baseline"
        ></atomic-icon>
      </Button>
    );
  }

  public render() {
    return (
      <div class="flex flex-col items-start">
        {this.renderProductDescription()}
        {this.isTruncated && this.shouldTruncate && this.renderShowMoreButton()}
      </div>
    );
  }
}

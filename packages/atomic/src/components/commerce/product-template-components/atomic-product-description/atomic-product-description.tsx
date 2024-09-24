import {Schema, StringValue} from '@coveo/bueno';
import {Product} from '@coveo/headless/commerce';
import {Component, State, h, Element, Prop} from '@stencil/core';
import PlusIcon from '../../../../images/plus.svg';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
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
  @Prop() public truncateAfter: 'none' | '1' | '2' | '3' | '4' = '2';

  /**
   * The name of the description field to use.
   */
  @Prop() public field: 'ec_description' | 'ec_shortdesc' = 'ec_shortdesc';

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
      field: new StringValue({constrainTo: ['ec_shortdesc', 'ec_description']}),
    }).validate({
      truncateAfter: this.truncateAfter,
      field: this.field,
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

  private onToggleExpand(e?: MouseEvent) {
    if (e) {
      e.stopPropagation();
    }

    this.isExpanded = !this.isExpanded;
  }

  private getLineClampClass() {
    const lineClampMap: Record<typeof this.truncateAfter, string> = {
      none: 'line-clamp-none',
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
    };
    return lineClampMap[this.truncateAfter] || 'line-clamp-2';
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }

  private renderProductDescription() {
    const productDescription = this.product[this.field] ?? '';

    if (productDescription !== null) {
      return (
        <atomic-commerce-text
          class={`product-description-text ${!this.isExpanded ? this.getLineClampClass() : ''}`}
          value={getFieldValueCaption(
            this.field,
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
        class={`my-2 p-1 text-xs ${this.isExpanded || !this.isTruncated || this.truncateAfter === 'none' ? 'invisible' : ''}`}
        title={this.bindings.i18n.t('show-more')}
        onClick={(e) => this.onToggleExpand(e)}
      >
        <atomic-icon
          icon={PlusIcon}
          class="ml-1 w-2 align-baseline"
        ></atomic-icon>{' '}
        {this.bindings.i18n.t('show-more')}
      </Button>
    );
  }

  public render() {
    return (
      <div class="flex flex-col items-start">
        {this.renderProductDescription()}
        {this.renderShowMoreButton()}
      </div>
    );
  }
}

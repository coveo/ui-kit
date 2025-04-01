import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {Component, Element, h, Prop, State} from '@stencil/core';
import Star from '../../../../images/star.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  Rating,
  computeNumberOfStars,
} from '../../../common/atomic-rating/atomic-rating';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

/**
 * The `atomic-product-rating` element renders a star rating.
 *
 * @part value-rating - The wrapper that contains the row of inactive stars and the row of active stars.
 * @part value-rating-icon - The individual star icons used in the rating display.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-product-rating',
  styleUrl: 'atomic-product-rating.pcss',
  shadow: true,
})
export class AtomicProductRating
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;

  @ProductContext() private product!: Product;
  @Element() host!: HTMLElement;

  /**
   * The numerical field whose values you want to display as a rating.
   */
  @Prop({reflect: true}) public field: string = 'ec_rating';

  /**
   * The field whose value you want to display next to the rating. This field can be used to display the number of reviews or the numerical value of the rating, for example.
   * @type {string}
   */
  @Prop({reflect: true}) public ratingDetailsField?: string;

  /**
   * The maximum value of the field. This value is also used as the number of icons to be displayed.
   */
  @Prop({reflect: true}) public maxValueInIndex = 5;

  /**
   * The SVG icon to use to display the rating.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   *
   * When using a custom icon, at least part of your icon should have the color set to `fill="currentColor"`.
   * This part of the SVG will take on the colors set in the following [variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties):
   *
   * - `--atomic-rating-icon-active-color`
   * - `--atomic-rating-icon-inactive-color`
   */
  @Prop({reflect: true}) public icon = Star;

  public error!: Error;

  @State() numberOfStars: number | null = null;
  @State() ratingDetails: string | number | null = null;

  private updateNumberOfStars() {
    const value = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field
    );
    try {
      this.numberOfStars = computeNumberOfStars(value, this.field);
    } catch (error) {
      this.error = error instanceof Error ? error : new Error(`${error}`);
      this.numberOfStars = null;
    }
  }

  private updateRatingDetailsValue() {
    if (this.ratingDetailsField === undefined) {
      this.ratingDetails = null;
      return;
    }
    const value = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.ratingDetailsField
    ) as string;

    if (value === null) {
      this.ratingDetails = null;
      return;
    }

    this.ratingDetails = value;
  }

  componentWillRender() {
    this.updateNumberOfStars();
    this.updateRatingDetailsValue();
  }

  render() {
    if (this.numberOfStars === null) {
      this.host.remove();
      return;
    }
    return (
      <div class="flex items-center align-middle">
        <Rating
          i18n={this.bindings.i18n}
          icon={this.icon}
          numberOfTotalIcons={this.maxValueInIndex}
          numberOfActiveIcons={this.numberOfStars}
          iconSize={0.875}
        ></Rating>

        {this.ratingDetails !== null && (
          <span class="text-neutral-dark rating-details pl-1">
            ({this.ratingDetails})
          </span>
        )}
      </div>
    );
  }
}

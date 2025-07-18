import {type Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {styleMap} from 'lit/directives/style-map.js';
import {when} from 'lit/directives/when.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import Star from '../../../images/star.svg';
import {computeNumberOfStars} from '../../common/atomic-rating/atomic-rating';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-product-rating` element renders a star rating.
 *
 * @part value-rating - The wrapper that contains the row of inactive stars and the row of active stars.
 * @part value-rating-icon - The individual star icons used in the rating display.
 *
 * @alpha
 */
@customElement('atomic-product-rating')
@bindings()
export class AtomicProductRating
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() public bindings!: CommerceBindings;
  @state() private product!: Product;

  private productController = createProductContextController(this);

  /**
   * The numerical field whose values you want to display as a rating.
   */
  @property({type: String, reflect: true}) public field: string = 'ec_rating';

  /**
   * The field whose value you want to display next to the rating. This field can be used to display the number of reviews or the numerical value of the rating, for example.
   * @type {string}
   */
  @property({type: String, reflect: true, attribute: 'rating-details-field'})
  public ratingDetailsField?: string;

  /**
   * The maximum value of the field. This value is also used as the number of icons to be displayed.
   */
  @property({type: Number, reflect: true, attribute: 'max-value-in-index'})
  public maxValueInIndex = 5;

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
  @property({type: String, reflect: true}) public icon = Star;

  @state() public error!: Error;

  @state() numberOfStars: number | null = null;
  @state() ratingDetails: string | number | null = null;

  protected createRenderRoot() {
    return this;
  }

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
  }

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

  private updateData() {
    this.updateNumberOfStars();
    this.updateRatingDetailsValue();
  }

  private renderRating() {
    const width = `${(this.numberOfStars! / this.maxValueInIndex) * 100}%`;
    const iconSize = '0.875rem';

    const renderIcon = (active: boolean) => html`
      <atomic-icon
        icon=${this.icon}
        class="shrink-0 ${active ? 'icon-active' : 'icon-inactive'}"
        style=${styleMap({width: iconSize, height: iconSize})}
        part="value-rating-icon"
      ></atomic-icon>
    `;

    const emptyIcons = repeat(
      Array(this.maxValueInIndex),
      (_, i) => i,
      () => renderIcon(false)
    );

    const filledIcons = repeat(
      Array(this.maxValueInIndex),
      (_, i) => i,
      () => renderIcon(true)
    );

    return html`
      <div
        class="relative w-max"
        part="value-rating"
        role="img"
        aria-label=${this.bindings.i18n.t('stars', {
          count: this.numberOfStars,
          max: this.maxValueInIndex,
        })}
      >
        <div class="z-0 flex gap-0.5">${emptyIcons}</div>
        <div
          class="absolute top-0 left-0 z-1 flex gap-0.5 overflow-hidden"
          style=${styleMap({width})}
        >
          ${filledIcons}
        </div>
      </div>
    `;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    this.updateData();

    if (this.numberOfStars === null) {
      return nothing;
    }

    return html`
      <div class="flex items-center align-middle">
        ${this.renderRating()}

        ${when(
          this.ratingDetails !== null,
          () => html`
            <span class="text-neutral-dark rating-details pl-1">
              (${this.ratingDetails})
            </span>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-rating': AtomicProductRating;
  }
}

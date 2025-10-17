import {type Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller.js';
import ratingStyles from '@/src/components/common/atomic-rating/atomic-rating.tw.css.js';
import {computeNumberOfStars} from '@/src/components/common/atomic-rating/rating-utils.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {LightDomMixin} from '@/src/mixins/light-dom';
import Star from '../../../images/star.svg';
import {renderRating} from '../../common/atomic-rating/rating';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';

/**
 * The `atomic-product-rating` element renders a star rating.
 *
 * @part value-rating - The wrapper that contains the row of inactive stars and the row of active stars.
 * @part value-rating-icon - The individual star icons used in the rating display.
 *
 * @cssprop --atomic-rating-icon-active-color - Color of the icon when active.
 * @cssprop --atomic-rating-icon-inactive-color - Color of the icon when inactive.
 * @cssprop --atomic-rating-icon-outline - Outline color of the icon.
 */
@customElement('atomic-product-rating')
@bindings()
export class AtomicProductRating
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;

  private productController = createProductContextController(this);

  @state() private product!: Product;

  static styles = ratingStyles;

  /**
   * The numerical field whose values you want to display as a rating.
   */
  @property({reflect: true}) public field: string = 'ec_rating';

  /**
   * The field whose value you want to display next to the rating. This field can be used to display the number of reviews or the numerical value of the rating, for example.
   */
  @property({reflect: true, attribute: 'rating-details-field'})
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
  @property({reflect: true}) public icon = Star;

  @state() private numberOfStars: number | null = null;
  @state() private ratingDetails: string | number | null = null;

  public initialize() {
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

  private updateStates() {
    if (!this.product) {
      return;
    }
    this.updateNumberOfStars();
    this.updateRatingDetailsValue();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }

    this.updateStates();

    return html`
      ${when(
        this.numberOfStars !== null,
        () => html`
          <div class="flex items-center align-middle">
            ${renderRating({
              props: {
                i18n: this.bindings.i18n,
                icon: this.icon,
                numberOfTotalIcons: this.maxValueInIndex,
                numberOfActiveIcons: this.numberOfStars!,
                iconSize: 0.875,
              },
            })}

            ${when(
              this.ratingDetails !== null,
              () => html`
                <span class="text-neutral-dark rating-details pl-1">
                  (${this.ratingDetails})
                </span>
              `
            )}
          </div>
        `
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-rating': AtomicProductRating;
  }
}

import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import ratingStyles from '@/src/components/common/atomic-rating/atomic-rating.tw.css.js';
import {renderRating} from '@/src/components/common/atomic-rating/rating.js';
import {computeNumberOfStars} from '@/src/components/common/atomic-rating/rating-utils.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces.js';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import Star from '@/src/images/star.svg';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';

/**
 * The `atomic-result-rating` element renders a star rating.
 *
 * @part value-rating - The wrapper that contains the row of inactive stars and the row of active stars.
 * @part value-rating-icon - The individual star icons used in the rating display.
 *
 * @cssprop --atomic-rating-icon-active-color - Color of the icon when active.
 * @cssprop --atomic-rating-icon-inactive-color - Color of the icon when inactive.
 * @cssprop --atomic-rating-icon-outline - Outline color of the icon.
 */
@customElement('atomic-result-rating')
@bindings()
@withTailwindStyles
// TODO V4: Consider switching to Light DOM if appropriate for result template components
export class AtomicResultRating
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles = ratingStyles;

  private static readonly propsSchema = new Schema({
    field: new StringValue({required: true, emptyAllowed: false}),
    maxValueInIndex: new NumberValue({
      default: 5,
      min: 1,
      required: false,
    }),
  });

  /**
   * The result field containing the rating value to display.
   */
  @property({reflect: true}) public field!: string;

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

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private result!: Result;
  @state() private numberOfStars: number | null = null;

  private resultController = createResultContextController(this);

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        maxValueInIndex: this.maxValueInIndex,
      }),
      AtomicResultRating.propsSchema,
      false
    );
  }

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
  }

  private updateNumberOfStars() {
    if (!this.result) {
      return;
    }
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );
    try {
      this.numberOfStars = computeNumberOfStars(value, this.field);
    } catch (error) {
      this.error = error instanceof Error ? error : new Error(`${error}`);
      this.numberOfStars = null;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    this.updateNumberOfStars();

    return html`
      ${when(this.numberOfStars !== null, () =>
        renderRating({
          props: {
            i18n: this.bindings.i18n,
            icon: this.icon,
            numberOfTotalIcons: this.maxValueInIndex,
            numberOfActiveIcons: this.numberOfStars!,
            iconSize: 0.875,
          },
        })
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-rating': AtomicResultRating;
  }
}

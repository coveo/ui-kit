import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Element, Prop, h, State} from '@stencil/core';
import Star from '../../../../images/star.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  Rating,
  computeNumberOfStars,
} from '../../../common/atomic-rating/atomic-rating';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-rating` element renders a star rating.
 *
 *  @part value-rating - The wrapper that contains the row of inactive stars and the row of active stars.
 *  @part value-rating-icon - The individual star icons used in the rating display.
 */
@Component({
  tag: 'atomic-result-rating',
  styleUrl: 'atomic-result-rating.pcss',
  shadow: true,
})
export class AtomicResultRating implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  @Element() host!: HTMLElement;

  /**
   * The field whose values you want to display as a rating.
   */
  @Prop({reflect: true}) public field!: string;

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

  @State() public error!: Error;

  @State() numberOfStars: number | null = null;

  private updateNumberOfStars() {
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

  componentWillRender() {
    this.updateNumberOfStars();
  }

  render() {
    if (this.numberOfStars === null) {
      this.host.remove();
      return;
    }
    return (
      <Rating
        i18n={this.bindings.i18n}
        icon={this.icon}
        numberOfTotalIcons={this.maxValueInIndex}
        numberOfActiveIcons={this.numberOfStars}
        iconSize={0.875}
      ></Rating>
    );
  }
}

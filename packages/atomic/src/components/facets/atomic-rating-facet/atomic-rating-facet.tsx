import {Component, h, State, Prop, VNode, Element} from '@stencil/core';
import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetState,
  NumericFacetOptions,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  NumericFacetValue,
  NumericRangeRequest,
  buildNumericRange,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {Rating} from '../../atomic-rating/atomic-rating';
import {BaseFacet} from '../facet-common';
import Star from '../../../images/star.svg';
import {Schema, StringValue} from '@coveo/bueno';
import {registerFacetToStore} from '../../../utils/store';
import {Hidden} from '../../common/hidden';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-rating-facet` displays a facet of the results for the current query as ratings.
 * It only supports numeric fields.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and toggles to expand or collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-count - The facet value count, common for all displays.
 * @part value-rating - The facet value rating, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
 *
 */
@Component({
  tag: 'atomic-rating-facet',
  styleUrl: 'atomic-rating-facet.pcss',
  shadow: true,
})
export class AtomicRatingFacet
  implements InitializableComponent, BaseFacet<NumericFacet, NumericFacetState>
{
  @InitializeBindings() public bindings!: Bindings;
  public facet!: NumericFacet;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field!: string;
  /**
   * The number of options to display in the facet. If `maxValueInIndex` isn't specified, it will be assumed that this is also the maximum number of rating icons.
   */
  @Prop() public numberOfIntervals = 5;
  /**
   * The maximum value in the field's index and the number of rating icons to display in the facet. If not assigned a value, this property will default to the same value as `numberOfIntervals`.
   */
  @Prop() public maxValueInIndex = this.numberOfIntervals;
  /**
   * The minimum value of the field.
   */
  @Prop() public minValueInIndex = 1;
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @Prop() public displayValuesAs: 'checkbox' | 'link' = 'checkbox';
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
   * - `--atomic-rating-facet-icon-active-color`
   * - `--atomic-rating-facet-icon-inactive-color`

   */
  @Prop() public icon = Star;
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   */
  @Prop() public filterFacetCount = true;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   */
  @Prop() public injectionDepth = 1000;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  private validateProps() {
    new Schema({
      displayValuesAs: new StringValue({constrainTo: ['checkbox', 'link']}),
    }).validate({
      displayValuesAs: this.displayValuesAs,
    });
  }

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.initializeFacet();
  }

  private initializeFacet() {
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfIntervals,
      currentValues: this.generateCurrentValues(),
      sortCriteria: 'descending',
      generateAutomaticRanges: false,
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
    };
    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    registerFacetToStore(this.bindings.store, 'numericFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
      format: (value) => this.formatFacetValue(value),
      content: (value) => this.ratingContent(value),
    });
  }

  private get scaleFactor() {
    return this.maxValueInIndex / this.numberOfIntervals;
  }

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private generateCurrentValues() {
    const currentValues: NumericRangeRequest[] = [];
    for (let i = this.minValueInIndex; i <= this.numberOfIntervals; i++) {
      currentValues.push(
        buildNumericRange({
          start: Math.round(i * this.scaleFactor * 100) / 100,
          end: Math.round((i + 1) * this.scaleFactor * 100) / 100,
          endInclusive: false,
        })
      );
    }
    return currentValues;
  }

  private formatFacetValue(facetValue: NumericFacetValue) {
    return this.bindings.i18n.t('stars', {
      count: facetValue.start,
      max: this.maxValueInIndex,
    });
  }

  private ratingContent(facetValue: NumericFacetValue) {
    return (
      <Rating
        i18n={this.bindings.i18n}
        numberOfTotalIcons={this.maxValueInIndex}
        numberOfActiveIcons={facetValue.start}
        icon={this.icon}
      ></Rating>
    );
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          this.headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={this.headerFocus.setTarget}
      ></FacetHeader>
    );
  }

  private renderValue(facetValue: NumericFacetValue, onClick: () => void) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <FacetValueCheckbox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
          >
            {this.ratingContent(facetValue)}
          </FacetValueCheckbox>
        );
      case 'link':
        return (
          <FacetValueLink
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
          >
            {this.ratingContent(facetValue)}
          </FacetValueLink>
        );
    }
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <ul part="values" class="mt-3">
        {children}
      </ul>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) =>
        this.renderValue(value, () =>
          this.displayValuesAs === 'link'
            ? this.facet.toggleSingleSelect(value)
            : this.facet.toggleSelect(value)
        )
      )
    );
  }

  private get valuesToRender() {
    return this.facetState.values.filter(
      (value) => value.numberOfResults || value.state !== 'idle'
    );
  }

  public render() {
    if (this.searchStatusState.hasError) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfIntervals}
        ></FacetPlaceholder>
      );
    }

    if (!this.valuesToRender.length) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && this.renderValues()}
      </FacetContainer>
    );
  }
}

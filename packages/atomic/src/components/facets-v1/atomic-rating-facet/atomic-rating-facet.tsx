import {Component, h, State, Prop, VNode, Host, Element} from '@stencil/core';
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
import {FacetPlaceholder} from '../../facets/atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {Rating} from '../../atomic-rating/atomic-rating';
import {BaseFacet} from '../facet-common';
import Star from '../../../images/star.svg';
import {Schema, StringValue} from '@coveo/bueno';
import {registerFacetToStore} from '../../../utils/store';

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
   * The number of intervals to split the index for this facet.
   */
  @Prop() public numberOfIntervals = 5;
  /**
   * The maximum value of the field. This value is also used as the number of icons to be displayed.
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
   */
  @Prop() public icon = Star;
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;

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
    };
    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    registerFacetToStore(this.bindings.store, 'numericFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
      format: (value) => this.formatFacetValue(value),
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
    return this.bindings.i18n.t('to', {
      start: facetValue.start,
      end: facetValue.end,
    });
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => this.facet.deselectAll()}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
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
            <Rating
              numberOfTotalIcons={this.maxValueInIndex}
              numberOfActiveIcons={facetValue.start}
              icon={this.icon}
            ></Rating>
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
            <Rating
              numberOfTotalIcons={this.maxValueInIndex}
              numberOfActiveIcons={facetValue.start}
              icon={this.icon}
            ></Rating>
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
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfIntervals}
        ></FacetPlaceholder>
      );
    }

    if (!this.valuesToRender.length) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <FacetContainer>
          {this.renderHeader()}
          {!this.isCollapsed && this.renderValues()}
        </FacetContainer>
      </Host>
    );
  }
}

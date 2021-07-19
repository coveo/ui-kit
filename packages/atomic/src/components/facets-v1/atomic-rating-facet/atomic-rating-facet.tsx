import {Component, h, State, Prop, VNode, Host} from '@stencil/core';
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
import {FacetValueLabelRating} from '../facet-value-label-rating/facet-value-label-rating';
import {BaseFacet} from '../facet-common';

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
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 * @part value-box - The facet value when display is 'box'.
 *
 */
@Component({
  tag: 'atomic-rating-facet',
  styleUrl: 'atomic-rating-facet.pcss',
  shadow: true,
})
export class AtomicRatingFacet
  implements
    InitializableComponent,
    BaseFacet<NumericFacet, NumericFacetState> {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: NumericFacet;
  public searchStatus!: SearchStatus;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;
  @State() public isCollapsed = false;

  private iconActive = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      class="icon-active"
    >
      <path d="M2.12261 7.32528L0.386144 5.64869C-0.196726 5.08592 0.0965754 4.09991 0.892272 3.94721L3.52262 3.44244C3.84159 3.38123 4.11096 3.16892 4.24501 2.87309L5.08915 1.01016C5.44396 0.227133 6.55604 0.227132 6.91085 1.01016L7.75499 2.87309C7.88904 3.16892 8.15841 3.38123 8.47738 3.44244L11.1077 3.94721C11.9034 4.09991 12.1967 5.08592 11.6139 5.64869L9.87739 7.32528C9.64107 7.55345 9.53188 7.88314 9.58529 8.20726L10.0399 10.966C10.1756 11.79 9.3013 12.4076 8.57008 12.0042L6.48308 10.8527C6.18239 10.6868 5.81761 10.6868 5.51692 10.8527L3.42992 12.0042C2.6987 12.4076 1.82437 11.79 1.96014 10.966L2.41471 8.20726C2.46812 7.88314 2.35893 7.55345 2.12261 7.32528Z" />
    </svg>
  );
  private iconInactive = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      class="icon-inactive"
    >
      <path d="M2.12261 7.32528L0.386144 5.64869C-0.196726 5.08592 0.0965754 4.09991 0.892272 3.94721L3.52262 3.44244C3.84159 3.38123 4.11096 3.16892 4.24501 2.87309L5.08915 1.01016C5.44396 0.227133 6.55604 0.227132 6.91085 1.01016L7.75499 2.87309C7.88904 3.16892 8.15841 3.38123 8.47738 3.44244L11.1077 3.94721C11.9034 4.09991 12.1967 5.08592 11.6139 5.64869L9.87739 7.32528C9.64107 7.55345 9.53188 7.88314 9.58529 8.20726L10.0399 10.966C10.1756 11.79 9.3013 12.4076 8.57008 12.0042L6.48308 10.8527C6.18239 10.6868 5.81761 10.6868 5.51692 10.8527L3.42992 12.0042C2.6987 12.4076 1.82437 11.79 1.96014 10.966L2.41471 8.20726C2.46812 7.88314 2.35893 7.55345 2.12261 7.32528Z" />
    </svg>
  );
  private iconHalfActive = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="url(#grad)"
    >
      <linearGradient id="grad" x1="0" x2="100%" y1="0" y2="0">
        <stop offset="50%" class="icon-half-active-stop" />
        <stop offset="50%" class="icon-half-inactive-stop" />
      </linearGradient>
      <path d="M2.12261 7.32528L0.386144 5.64869C-0.196726 5.08592 0.0965754 4.09991 0.892272 3.94721L3.52262 3.44244C3.84159 3.38123 4.11096 3.16892 4.24501 2.87309L5.08915 1.01016C5.44396 0.227133 6.55604 0.227132 6.91085 1.01016L7.75499 2.87309C7.88904 3.16892 8.15841 3.38123 8.47738 3.44244L11.1077 3.94721C11.9034 4.09991 12.1967 5.08592 11.6139 5.64869L9.87739 7.32528C9.64107 7.55345 9.53188 7.88314 9.58529 8.20726L10.0399 10.966C10.1756 11.79 9.3013 12.4076 8.57008 12.0042L6.48308 10.8527C6.18239 10.6868 5.81761 10.6868 5.51692 10.8527L3.42992 12.0042C2.6987 12.4076 1.82437 11.79 1.96014 10.966L2.41471 8.20726C2.46812 7.88314 2.35893 7.55345 2.12261 7.32528Z" />
    </svg>
  );

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'noLabel';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field!: string;
  /**
   * The number of stars to request for this facet.
   */
  @Prop() public numberOfStars = 5;
  /**
   * The maximum value of the field. This value is used to normalize the field values with the number of stars.
   */
  @Prop() public maxValueInIndex = 5;
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @Prop() public displayValuesAs: 'checkbox' | 'link' = 'checkbox';

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.initializeFacet();
  }

  private initializeFacet() {
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfStars,
      currentValues: this.generateCurrentValues(),
      sortCriteria: 'descending',
      generateAutomaticRanges: false,
    };
    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.numericFacets[this.facetId] = {
      label: this.label,
      format: (facetValue) => this.formatFacetValue(facetValue),
    };
  }

  private get scaleFactor() {
    return this.maxValueInIndex / this.numberOfStars;
  }

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private generateCurrentValues() {
    const currentValues: NumericRangeRequest[] = [];
    for (let i = 0; i < this.numberOfStars; i++) {
      currentValues.push(
        buildNumericRange({
          start: Math.round(i * this.scaleFactor * 100) / 100,
          end: Math.round((i + 1) * this.scaleFactor * 100) / 100,
          endInclusive: true,
        })
      );
    }
    return currentValues;
  }

  private generateIconDisplay(facetValue: NumericFacetValue) {
    const iconDisplay: VNode[] = [];
    for (let i = 0; i < this.numberOfStars * this.scaleFactor; i++) {
      if (i < facetValue.end) {
        if (i + 1 > facetValue.end) {
          iconDisplay.push(this.iconHalfActive);
        } else {
          iconDisplay.push(this.iconActive);
        }
      } else {
        iconDisplay.push(this.iconInactive);
      }
    }
    return iconDisplay;
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
            <FacetValueLabelRating
              icons={this.generateIconDisplay(facetValue)}
            ></FacetValueLabelRating>
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
            <FacetValueLabelRating
              icons={this.generateIconDisplay(facetValue)}
            ></FacetValueLabelRating>
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
          numberOfValues={this.numberOfStars}
        ></FacetPlaceholder>
      );
    }

    if (!this.facetState.values.length) {
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

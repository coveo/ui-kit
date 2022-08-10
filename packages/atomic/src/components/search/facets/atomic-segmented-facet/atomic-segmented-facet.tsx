import {Component, h, Prop, State, VNode} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  buildFacet,
  buildSearchStatus,
  Facet,
  FacetOptions,
  FacetSortCriterion,
  FacetState,
  FacetValue,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {MapProp} from '../../../../utils/props-utils';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {FacetSegmentedValue} from '../facet-segmented-value/facet-segmented-value';
import {Hidden} from '../../../common/hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {BaseFacet} from '../../../common/facets/facet-common';

/**
 * @internal
 * The `atomic-segmented-facet` displays a horizontal facet of the results for the current query.
 * @part segmented-container - The container that holds the segmented facets.
 * @part label - The facet value label.
 * @part values - The facet values container.
 * @part value-box - The facet value.
 * @part value-box-selected - The selected facet value.
 */
@Component({
  tag: 'atomic-segmented-facet',
  styleUrl: 'atomic-segmented-facet.pcss',
  shadow: true,
})
export class AtomicSegmentedFacet
  implements InitializableComponent, BaseFacet<Facet>
{
  @InitializeBindings() public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
  public facet!: Facet;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({reflect: true}) public label?: string;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   */
  @Prop({reflect: true}) public filterFacetCount = true;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @Prop() public injectionDepth = 1000;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({reflect: true}) public numberOfValues = 6;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'occurrences', and 'automatic'.
   */
  @Prop({reflect: true}) public sortCriteria: FacetSortCriterion = 'automatic';

  // TODO
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  // TODO
  @Prop({reflect: true}) public withSearch = true;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const options: FacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
      hasBreadcrumbs: false,
    };
    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
  }

  private renderValuesContainer(children: VNode[]) {
    const classes = 'box-container flex h-10';
    return (
      <FacetValuesGroup i18n={this.bindings.i18n} label={this.label}>
        <ul class={classes} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValue(facetValue: FacetValue, onClick: () => void) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';

    return (
      <FacetSegmentedValue
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={this.bindings.i18n}
        onClick={onClick}
        searchQuery={this.facetState.facetSearch.query}
      ></FacetSegmentedValue>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value) =>
        this.renderValue(value, () => this.facet.toggleSingleSelect(value))
      )
    );
  }

  private renderLabel() {
    if (!this.label) {
      return;
    }
    return (
      <b class="mr-2" part="label">
        {this.label}:
      </b>
    );
  }

  public render() {
    if (this.searchStatus.state.hasError || !this.facet.state.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatus.state.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden
          class="h-8 w-48 bg-neutral animate-pulse rounded"
        ></div>
      );
    }

    if (!this.facetState.values.length) {
      return <Hidden></Hidden>;
    }

    return (
      <div
        part="segmented-container"
        class="flex whitespace-nowrap h-10 items-center"
      >
        {this.renderLabel()}
        {this.renderValues()}
      </div>
    );
  }
}

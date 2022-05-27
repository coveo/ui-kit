import {Component, Element, h, Prop, State, VNode} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {BaseFacet} from '../facet-common';
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
import {registerFacetToStore} from '../../../utils/store';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueBox} from '../facet-value-box/facet-value-box';
import {MapProp} from '../../../utils/props-utils';
import {FacetValuesGroup} from '../facet-values-group/facet-values-group';

/**
 * @internal
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
  @Element() private host!: HTMLElement;
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
  @Prop({reflect: true}) public label = 'no-label';
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
    };
    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    registerFacetToStore(this.bindings.store, 'facets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
    });
  }

  private renderValuesContainer(children: VNode[]) {
    const classes = 'box-container';
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
      <FacetValueBox
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={this.bindings.i18n}
        onClick={onClick}
        searchQuery={this.facetState.facetSearch.query}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
          searchQuery={this.facetState.facetSearch.query}
        ></FacetValueLabelHighlight>
      </FacetValueBox>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value) =>
        this.renderValue(value, () => this.facet.toggleSelect(value))
      )
    );
  }

  public render() {
    return this.renderValues();
  }
}

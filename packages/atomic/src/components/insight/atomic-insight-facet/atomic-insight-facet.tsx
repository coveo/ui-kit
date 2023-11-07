import {FacetResultsMustMatch} from '@coveo/headless';
import {Component, h, State, Prop, Element} from '@stencil/core';
import {
  buildInsightFacet,
  buildInsightFacetConditionsManager,
  buildInsightSearchStatus,
  InsightFacet,
  InsightFacetOptions,
  InsightFacetSortCriterion,
  InsightFacetState,
  InsightSearchStatus,
  InsightSearchStatusState,
} from '..';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  BaseFacet,
  FacetCommon,
  FacetDisplayValues,
} from '../../common/facets/facet-common';
import {parseDependsOn} from '../../common/facets/facet-common';
import {FacetPlaceholder} from '../../common/facets/facet-placeholder/facet-placeholder';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-facet',
  styleUrl: 'atomic-insight-facet.pcss',
  shadow: true,
})
export class AtomicInsightFacet
  implements InitializableComponent<InsightBindings>, BaseFacet<InsightFacet>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public facetCommon?: FacetCommon;
  public facet!: InsightFacet;
  public searchStatus!: InsightSearchStatus;
  public withSearch = false;
  public dependsOn = {};
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: InsightFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: InsightSearchStatusState;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   */
  @Prop({reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({reflect: true}) public numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'occurrences', and 'automatic'.
   */
  @Prop({reflect: true}) public sortCriteria: InsightFacetSortCriterion =
    'automatic';
  /**
   * Specifies how a result must match the selected facet values.
   * Allowed values:
   * - `atLeastOneValue`: A result will match if at least one of the corresponding facet values is selected.
   * - `allValues`: A result will match if all corresponding facet values are selected.
   */
  @Prop({reflect: true}) public resultsMustMatch: FacetResultsMustMatch =
    'atLeastOneValue';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @Prop({reflect: true}) public displayValuesAs: FacetDisplayValues =
    'checkbox';
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;
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

  private showLessFocus?: FocusTargetController;

  private showMoreFocus?: FocusTargetController;

  private headerFocus?: FocusTargetController;

  public initialize() {
    const options: InsightFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
    };

    this.facet = buildInsightFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;

    this.facetCommon = new FacetCommon({
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      displayValuesAs: this.displayValuesAs,
      dependsOn: this.dependsOn,
      dependenciesManager: buildInsightFacetConditionsManager(
        this.bindings.engine,
        {
          facetId: this.facetId!,
          conditions: parseDependsOn(this.dependsOn),
        }
      ),
      facet: this.facet,
      facetId: this.facetId,
      withSearch: this.withSearch,
      sortCriteria: this.sortCriteria,
    });

    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
  }

  private get focusTargets(): {
    showLess: FocusTargetController;
    showMore: FocusTargetController;
    header: FocusTargetController;
  } {
    if (!this.showLessFocus) {
      this.showLessFocus = new FocusTargetController(this);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return {
      showLess: this.showLessFocus,
      showMore: this.showMoreFocus,
      header: this.headerFocus,
    };
  }

  public disconnectedCallback() {
    this.facetCommon?.disconnectedCallback();
  }

  public render() {
    if (!this.facetCommon) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }
    return this.facetCommon.render({
      hasError: this.searchStatusState.hasError,
      firstSearchExecuted: this.searchStatusState.firstSearchExecuted,
      isCollapsed: this.isCollapsed,
      numberOfValues: this.numberOfValues,
      headerFocus: this.focusTargets.header,
      showLessFocus: this.focusTargets.showLess,
      showMoreFocus: this.focusTargets.showMore,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}

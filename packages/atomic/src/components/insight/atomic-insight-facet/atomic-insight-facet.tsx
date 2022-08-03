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
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
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

import {FacetPlaceholder} from '../../common/facets/facet-placeholder/facet-placeholder';
import {parseDependsOn} from '../../common/facets/facet-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-insight-facet` displays a facet of the results for the current query.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
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
  public facetCommon!: FacetCommon;
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
   * Used in the `atomic-insight-breadbox` component through the bindings store.
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

  @FocusTarget()
  private showLessFocus!: FocusTargetController;

  @FocusTarget()
  private showMoreFocus!: FocusTargetController;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

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

  public disconnectedCallback() {
    this.facetCommon.disconnectedCallback();
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
      headerFocus: this.headerFocus,
      showLessFocus: this.showLessFocus,
      showMoreFocus: this.showMoreFocus,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}

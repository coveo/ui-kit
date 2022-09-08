import {Component, h, State, Prop, Element} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildFacetConditionsManager,
} from '@coveo/headless';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {MapProp} from '../../../../utils/props-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {
  BaseFacet,
  FacetCommon,
  parseDependsOn,
} from '../../../common/facets/facet-common';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-facet` displays a facet of the results for the current query.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part search-wrapper - The search box wrapper.
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-highlight - The highlighted query inside the facet values.
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
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet implements InitializableComponent, BaseFacet<Facet> {
  @InitializeBindings() public bindings!: Bindings;
  public facetCommon!: FacetCommon;
  public facet!: Facet;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
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
   * Used in the `atomic-breadbox` component through the bindings store.
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
   * Whether this facet should contain a search box.
   * When "true", the search is only enabled when more facet values are available.
   */
  @Prop({reflect: true}) public withSearch = true;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'occurrences', and 'automatic'.
   */
  @Prop({reflect: true}) public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @Prop({reflect: true}) public displayValuesAs: 'checkbox' | 'link' | 'box' =
    'checkbox';
  /**
   * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
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
  // @Prop() public customSort?: string; TODO: KIT-753 Add customSort option for facet

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-facet
   *   depends-on-abc
   *   ...
   * ></atomic-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  /**
   * Specifies an explicit list of `allowedValues` in the Search API request, separated by commas.
   *
   * If you specify a list of values for this option, the facet uses only these values (if they are available in
   * the current result set).
   *
   * Example:
   *
   * The following facet only uses the `Contact`, `Account`, and `File` values of the `objecttype` field. Even if the
   * current result set contains other `objecttype` values, such as `Message`, or `Product`, the facet does not use
   * those other values.
   *
   * ```html
   * <atomic-facet field="objecttype" allowed-values="Contact,Account,File"></div>
   * ```
   *
   * The maximum amount of allowed values is 25.
   *
   * Default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  @Prop() public allowedValues?: string;

  @FocusTarget()
  private showLessFocus!: FocusTargetController;

  @FocusTarget()
  private showMoreFocus!: FocusTargetController;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  public initialize() {
    const options: FacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
      allowedValues: this.allowedValues?.trim().split(','),
    };

    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;

    this.facetCommon = new FacetCommon({
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      displayValuesAs: this.displayValuesAs,
      dependsOn: this.dependsOn,
      dependenciesManager: buildFacetConditionsManager(this.bindings.engine, {
        facetId: this.facetId!,
        conditions: parseDependsOn(this.dependsOn),
      }),
      facet: this.facet,
      facetId: this.facetId,
      withSearch: this.withSearch,
      sortCriteria: this.sortCriteria,
    });

    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  public disconnectedCallback() {
    this.facetCommon.disconnectedCallback();
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicFacet
  ) {
    return (
      !this.facetCommon ||
      this.facetCommon?.componentShouldUpdate(
        (next as FacetState)?.facetSearch,
        (prev as FacetState)?.facetSearch,
        propName
      )
    );
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

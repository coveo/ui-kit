import {Component, h, State, Prop, VNode, Element} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  FacetValue,
  buildFacetConditionsManager,
  FacetConditionsManager,
} from '@coveo/headless';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetSearchInput} from '../facet-search/facet-search-input';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {FacetValueBox} from '../facet-value-box/facet-value-box';
import {FacetShowMoreLess} from '../facet-show-more-less/facet-show-more-less';
import {FacetSearchMatches} from '../facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../facet-search/facet-search-utils';
import {BaseFacet, parseDependsOn, validateDependsOn} from '../facet-common';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {
  getFieldCaptions,
  getFieldValueCaption,
} from '../../../../utils/field-utils';
import {Schema, StringValue} from '@coveo/bueno';
import {Hidden} from '../../../common/hidden';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {MapProp} from '../../../../utils/props-utils';
import {FacetValuesGroup} from '../facet-values-group/facet-values-group';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

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
  public facet!: Facet;
  private dependenciesManager?: FacetConditionsManager;
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
  private showMoreLessFocus!: FocusTargetController;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  private validateProps() {
    new Schema({
      displayValuesAs: new StringValue({
        constrainTo: ['checkbox', 'link', 'box'],
      }),
    }).validate({
      displayValuesAs: this.displayValuesAs,
    });
    validateDependsOn(this.dependsOn);
  }

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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
    this.inititalizeDependenciesManager();
    this.bindings.store.registerFacet('facets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
    });
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicFacet
  ) {
    if (propName === 'facetState' && prev && this.withSearch) {
      return shouldUpdateFacetSearchComponent(
        (next as FacetState).facetSearch,
        (prev as FacetState).facetSearch
      );
    }

    return true;
  }

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private inititalizeDependenciesManager() {
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn(this.dependsOn),
      }
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
        headingLevel={this.headingLevel}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={this.headerFocus.setTarget}
      ></FacetHeader>
    );
  }

  private renderSearchInput() {
    const shouldDisplaySearch =
      this.withSearch && this.facetState.canShowMoreValues;
    if (!shouldDisplaySearch) {
      return;
    }

    return (
      <FacetSearchInput
        i18n={this.bindings.i18n}
        label={this.label}
        query={this.facetState.facetSearch.query}
        onChange={(value) => {
          if (value === '') {
            this.facet.facetSearch.clear();
            return;
          }
          this.facet.facetSearch.updateCaptions(
            getFieldCaptions(this.field, this.bindings.i18n)
          );
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        }}
        onClear={() => this.facet.facetSearch.clear()}
      ></FacetSearchInput>
    );
  }

  private renderValue(
    facetValue: FacetValue,
    onClick: () => void,
    isShowMoreLessFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
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
            searchQuery={this.facetState.facetSearch.query}
            buttonRef={(element) =>
              isShowMoreLessFocusTarget &&
              this.showMoreLessFocus.setTarget(element)
            }
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
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
            searchQuery={this.facetState.facetSearch.query}
            buttonRef={(element) =>
              isShowMoreLessFocusTarget &&
              this.showMoreLessFocus.setTarget(element)
            }
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueLink>
        );
      case 'box':
        return (
          <FacetValueBox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facetState.facetSearch.query}
            buttonRef={(element) =>
              isShowMoreLessFocusTarget &&
              this.showMoreLessFocus.setTarget(element)
            }
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueBox>
        );
    }
  }

  private renderValuesContainer(children: VNode[], query?: string) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-container' : ''
    }`;
    return (
      <FacetValuesGroup
        i18n={this.bindings.i18n}
        label={this.label}
        query={query}
      >
        <ul class={classes} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value, i) =>
        this.renderValue(
          value,
          () =>
            this.displayValuesAs === 'link'
              ? this.facet.toggleSingleSelect(value)
              : this.facet.toggleSelect(value),
          i === 0
        )
      )
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facetState.facetSearch.values.map((value) =>
        this.renderValue(
          {
            state: 'idle',
            numberOfResults: value.count,
            value: value.rawValue,
          },
          () =>
            this.displayValuesAs === 'link'
              ? this.facet.facetSearch.singleSelect(value)
              : this.facet.facetSearch.select(value),
          false
        )
      ),
      this.facetState.facetSearch.query
    );
  }

  private renderMatches() {
    return (
      <FacetSearchMatches
        i18n={this.bindings.i18n}
        query={this.facetState.facetSearch.query}
        numberOfMatches={this.facetState.facetSearch.values.length}
        hasMoreMatches={this.facetState.facetSearch.moreValuesAvailable}
      ></FacetSearchMatches>
    );
  }

  private renderShowMoreLess() {
    return (
      <FacetShowMoreLess
        label={this.label}
        i18n={this.bindings.i18n}
        onShowMore={() => {
          this.showMoreLessFocus.focusAfterSearch();
          this.facet.showMoreValues();
        }}
        onShowLess={() => {
          this.showMoreLessFocus.focusAfterSearch();
          this.facet.showLessValues();
        }}
        canShowMoreValues={this.facetState.canShowMoreValues}
        canShowLessValues={this.facetState.canShowLessValues}
      ></FacetShowMoreLess>
    );
  }

  public render() {
    if (this.searchStatusState.hasError || !this.facet.state.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.facetState.values.length) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.renderSearchInput(),
          shouldDisplaySearchResults(this.facetState.facetSearch)
            ? [this.renderSearchResults(), this.renderMatches()]
            : [this.renderValues(), this.renderShowMoreLess()],
        ]}
      </FacetContainer>
    );
  }
}

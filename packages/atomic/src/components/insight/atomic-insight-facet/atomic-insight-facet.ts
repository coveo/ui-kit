import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import type {FacetResultsMustMatch} from '@coveo/headless';
import {
  buildFacet as buildInsightFacet,
  buildFacetConditionsManager as buildInsightFacetConditionsManager,
  buildSearchStatus as buildInsightSearchStatus,
  type CategoryFacetValueRequest as InsightCategoryFacetValueRequest,
  type Facet as InsightFacet,
  type FacetConditionsManager as InsightFacetConditionsManager,
  type FacetOptions as InsightFacetOptions,
  type FacetSortCriterion as InsightFacetSortCriterion,
  type FacetState as InsightFacetState,
  type FacetValueRequest as InsightFacetValueRequest,
  type SearchStatus as InsightSearchStatus,
  type SearchStatusState as InsightSearchStatusState,
} from '@coveo/headless/insight';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {announceFacetSearchResultsWithAriaLive} from '@/src/components/common/facets/facet-search/facet-search-aria-live';
import {renderFacetShowMoreLess} from '@/src/components/common/facets/facet-show-more-less/facet-show-more-less';
import {
  type FacetValueProps,
  renderFacetValue,
} from '@/src/components/common/facets/facet-value/facet-value';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import '@/src/components/common/atomic-facet-placeholder/atomic-facet-placeholder';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import facetValueBoxStyles from '@/src/components/common/facets/facet-value-box/facet-value-box.tw.css';
import facetValueCheckboxStyles from '@/src/components/common/facets/facet-value-checkbox/facet-value-checkbox.tw.css';
import facetValueExcludeStyles from '@/src/components/common/facets/facet-value-exclude/facet-value-exclude.tw.css';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';

/**
 * The `atomic-insight-facet` component displays a facet of the results for the current query in an Insight interface.
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (for example, number of occurrences).
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-checkbox-icon - The facet value checkbox icon, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 * @part value-exclude-button - The button to exclude a facet value, available when display is 'checkbox'.
 */
@customElement('atomic-insight-facet')
@bindings()
@withTailwindStyles
export class AtomicInsightFacet
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  private static readonly propsSchema = new Schema({
    field: new StringValue({required: true, emptyAllowed: false}),
    numberOfValues: new NumberValue({min: 1}),
    injectionDepth: new NumberValue({min: 0}),
  });

  static styles = [
    facetCommonStyles,
    facetValueBoxStyles,
    facetValueCheckboxStyles,
    facetValueExcludeStyles,
  ];

  /**
   * The non-localized label for the facet.
   */
  @property({type: String, reflect: true}) label = 'no-label';

  /**
   * The field whose values you want to display in the facet.
   */
  @property({type: String, reflect: true}) field!: string;

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @property({type: Number, reflect: true, attribute: 'number-of-values'})
  numberOfValues = 8;

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'alphanumericDescending', 'occurrences', 'alphanumericNatural', 'alphanumericNaturalDescending' and 'automatic'.
   */
  @property({type: String, reflect: true, attribute: 'sort-criteria'})
  sortCriteria: InsightFacetSortCriterion = 'automatic';

  /**
   * Specifies how a result must match the selected facet values.
   * Allowed values:
   * - `atLeastOneValue`: A result will match if at least one of the corresponding facet values is selected.
   * - `allValues`: A result will match if all corresponding facet values are selected.
   */
  @property({type: String, reflect: true, attribute: 'results-must-match'})
  resultsMustMatch: FacetResultsMustMatch = 'atLeastOneValue';

  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @property({type: String, reflect: true, attribute: 'display-values-as'})
  displayValuesAs: 'checkbox' | 'link' | 'box' = 'checkbox';

  /**
   * Specifies if the facet is collapsed.
   */
  @property({type: Boolean, reflect: true, attribute: 'is-collapsed'})
  isCollapsed = false;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @property({type: Number, reflect: true, attribute: 'heading-level'})
  headingLevel = 0;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @property({type: Boolean, reflect: true, attribute: 'filter-facet-count'})
  filterFacetCount = true;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @property({type: Number, attribute: 'injection-depth'}) injectionDepth = 1000;

  /**
   * Whether to allow excluding values from the facet.
   */
  @property({type: Boolean, reflect: true, attribute: 'enable-exclusion'})
  enableExclusion = false;

  /**
   * Specifies a unique identifier for the facet.
   */
  @property({type: String, reflect: true, attribute: 'facet-id'})
  facetId?: string;

  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  @bindStateToController('facet')
  @state()
  public facetState!: InsightFacetState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: InsightSearchStatusState;

  public facet!: InsightFacet;
  public searchStatus!: InsightSearchStatus;
  public dependsOn = {};

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private facetConditionsManager?: InsightFacetConditionsManager;
  private facetSearchAriaLiveController!: AriaLiveRegionController;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        numberOfValues: this.numberOfValues,
        injectionDepth: this.injectionDepth,
      }),
      AtomicInsightFacet.propsSchema,
      false
    );
  }

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
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
    this.initAriaLive();
    this.initConditionManager();
    this.initPopover();
    this.registerFacet();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.facetConditionsManager?.stopWatching();
  }

  private get focusTargets(): {
    showLess: FocusTargetController;
    showMore: FocusTargetController;
    header: FocusTargetController;
  } {
    if (!this.showLessFocus) {
      this.showLessFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return {
      showLess: this.showLessFocus,
      showMore: this.showMoreFocus,
      header: this.headerFocus,
    };
  }

  private shouldRenderFacet() {
    return (
      this.facetState.enabled &&
      !this.searchStatusState.hasError &&
      (!this.searchStatusState.firstSearchExecuted ||
        this.facetState.values.length > 0)
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.shouldRenderFacet(), () =>
      this.searchStatusState.firstSearchExecuted
        ? renderFacetContainer()(
            html`
                ${this.renderFacetHeader()} ${this.renderBody()}
              `
          )
        : html`<atomic-facet-placeholder
              value-count="${this.numberOfValues}"
              ?is-collapsed="${this.isCollapsed}"
            ></atomic-facet-placeholder>`
    )}`;
  }

  private renderFacetHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
        onClearFilters: () => {
          this.focusTargets.header.focusAfterSearch();
          this.facet.deselectAll();
        },
        numberOfActiveValues: this.activeValues.length,
        isCollapsed: this.isCollapsed,
        headingLevel: this.headingLevel,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        headerRef: (el) => this.focusTargets.header.setTarget(el),
      },
    });
  }

  private renderBody() {
    if (this.isCollapsed) {
      return nothing;
    }
    return html`${this.renderValues()} ${this.renderShowMoreLess()}`;
  }

  private renderValuesContainer(children: unknown) {
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
      },
    })(html`<ul
      class="mt-3 ${this.displayValuesAs === 'box' ? 'box-container' : ''}"
      part="values"
    >
      ${children}
    </ul>`);
  }

  private renderValues() {
    const values = this.facet.state.values.map((value, i) => {
      const shouldFocusOnShowLessAfterInteraction = i === 0;
      const shouldFocusOnShowMoreAfterInteraction =
        i ===
        (this.sortCriteria === 'automatic'
          ? 0
          : this.facetState.values.length - 1);

      return renderFacetValue({
        props: {
          ...this.facetValueProps,
          facetCount: value.numberOfResults,
          onExclude: () => this.facet.toggleExclude(value),
          onSelect: () =>
            this.displayValuesAs === 'link'
              ? this.facet.toggleSingleSelect(value)
              : this.facet.toggleSelect(value),
          facetValue: value.value,
          facetState: value.state,
          setRef: (btn) => {
            if (shouldFocusOnShowLessAfterInteraction) {
              this.showLessFocus?.setTarget(btn as HTMLElement);
            }
            if (shouldFocusOnShowMoreAfterInteraction) {
              this.showMoreFocus?.setTarget(btn as HTMLElement);
            }
          },
        },
      });
    });

    return this.renderValuesContainer(values);
  }

  private renderShowMoreLess() {
    return renderFacetShowMoreLess({
      props: {
        label: this.label,
        i18n: this.bindings.i18n,
        onShowMore: () => {
          this.focusTargets.showMore.focusAfterSearch();
          this.facet.showMoreValues();
        },
        onShowLess: () => {
          this.focusTargets.showLess.focusAfterSearch();
          this.facet.showLessValues();
        },
        canShowMoreValues: this.facet.state.canShowMoreValues,
        canShowLessValues: this.facet.state.canShowLessValues,
      },
    });
  }

  private get activeValues() {
    return this.facet.state.values.filter(({state}) => state !== 'idle');
  }

  private get facetValueProps(): Pick<
    FacetValueProps,
    | 'displayValuesAs'
    | 'facetSearchQuery'
    | 'enableExclusion'
    | 'field'
    | 'i18n'
  > {
    return {
      facetSearchQuery: this.facetState.facetSearch.query,
      displayValuesAs: this.displayValuesAs,
      enableExclusion: this.enableExclusion,
      field: this.field,
      i18n: this.bindings.i18n,
    };
  }

  private initAriaLive() {
    this.facetSearchAriaLiveController = new AriaLiveRegionController(
      this,
      'facet-search'
    );
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.label,
      (msg) => {
        this.facetSearchAriaLiveController.message = msg;
      },
      this.bindings.i18n
    );
  }

  private initConditionManager() {
    this.facetConditionsManager = buildInsightFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          InsightFacetValueRequest | InsightCategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

  private initPopover() {
    initializePopover(this, {
      ...this.facetInfo,
      hasValues: () => !!this.facet.state.values.length,
      numberOfActiveValues: () => this.activeValues.length,
    });
  }

  private get isHidden() {
    return !this.facet.state.enabled || !this.facet.state.values.length;
  }

  private get facetInfo(): FacetInfo {
    return {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this,
      isHidden: () => this.isHidden,
    };
  }

  private registerFacet() {
    this.bindings.store.registerFacet('facets', this.facetInfo);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-facet': AtomicInsightFacet;
  }
}

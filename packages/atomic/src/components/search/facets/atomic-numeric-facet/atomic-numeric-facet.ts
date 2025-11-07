import {
  buildFacetConditionsManager,
  buildNumericFacet,
  buildNumericFilter,
  buildNumericRange,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetValueRequest,
  type FacetConditionsManager,
  type FacetValueRequest,
  loadNumericFacetSetActions,
  type NumericFacet,
  type NumericFacetState,
  type NumericFilter,
  type NumericFilterState,
  type NumericRangeRequest,
  type RangeFacetRangeAlgorithm,
  type RangeFacetSortCriterion,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import {shouldDisplayInputForFacetRange} from '@/src/components/common/facets/facet-common';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import type {NumberInputType} from '@/src/components/common/facets/facet-number-input/number-input-type';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import {formatHumanReadable} from '@/src/components/common/facets/numeric-facet/formatter';
import {renderNumericFacetValue} from '@/src/components/common/facets/numeric-facet/value-link';
import {renderNumericFacetValuesGroup} from '@/src/components/common/facets/numeric-facet/values-container';
import numericFacetCommonStyles from '@/src/components/common/facets/numeric-facet-common.tw.css';
import {
  defaultNumberFormatter,
  type NumberFormatter,
} from '@/src/components/common/formats/format-common';
import '@/src/components/common/facets/facet-number-input/atomic-facet-number-input';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import type {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-numeric-facet` component displays a facet of the results for the current query as numeric ranges.
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
 * @part input-form - The form that comprises the labels, inputs, and 'apply' button for the custom numeric range.
 * @part label-start - The label for the starting value of the custom numeric range.
 * @part label-end - The label for the ending value of the custom numeric range.
 * @part input-start - The input for the starting value of the custom numeric range.
 * @part input-end - The input for the ending value of the custom numeric range.
 * @part input-apply-button - The apply button for the custom range.
 */
@customElement('atomic-numeric-facet')
@bindings()
@withTailwindStyles
export class AtomicNumericFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  /**
   * The unique identifier for the facet.
   */
  @property({type: String, reflect: true, attribute: 'facet-id'})
  facetId?: string;

  /**
   * The non-localized label for the facet.
   */
  @property({type: String, reflect: true})
  label = 'no-label';

  /**
   * The field whose values you want to display in the facet.
   */
  @property({type: String, reflect: true})
  field!: string;

  /**
   * The tabs on which the facet can be displayed.
   */
  @property({type: Array, reflect: true, attribute: 'tabs-included'})
  tabsIncluded: string[] = [];

  /**
   * The tabs on which this facet must not be displayed.
   */
  @property({type: Array, reflect: true, attribute: 'tabs-excluded'})
  tabsExcluded: string[] = [];

  /**
   * The number of values to request for this facet.
   */
  @property({type: Number, reflect: true, attribute: 'number-of-values'})
  numberOfValues = 8;

  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   */
  @property({type: String, reflect: true, attribute: 'with-input'})
  withInput?: NumberInputType;

  /**
   * The sort criterion to apply to the returned facet values.
   */
  @property({type: String, reflect: true, attribute: 'sort-criteria'})
  sortCriteria: RangeFacetSortCriterion = 'ascending';

  /**
   * The algorithm that's used for generating the ranges of this facet.
   */
  @property({type: String, reflect: true, attribute: 'range-algorithm'})
  rangeAlgorithm: RangeFacetRangeAlgorithm = 'equiprobable';

  /**
   * Whether to display the facet values as checkboxes or links.
   */
  @property({type: String, reflect: true, attribute: 'display-values-as'})
  displayValuesAs: 'checkbox' | 'link' = 'checkbox';

  /**
   * Whether the facet is collapsed.
   */
  @property({type: Boolean, reflect: true, attribute: 'is-collapsed'})
  isCollapsed = false;

  /**
   * The heading level to use for the heading over the facet.
   */
  @property({type: Number, reflect: true, attribute: 'heading-level'})
  headingLevel = 0;

  /**
   * Whether to exclude the parents of folded results when estimating the result count.
   */
  @property({type: Boolean, reflect: true, attribute: 'filter-facet-count'})
  filterFacetCount = true;

  /**
   * The maximum number of results to scan in the index.
   */
  @property({type: Number, reflect: true, attribute: 'injection-depth'})
  injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   */
  @property({type: Object, attribute: 'depends-on'})
  dependsOn: Record<string, string> = {};

  public facetForRange?: NumericFacet;
  public facetForInput?: NumericFacet;
  public filter?: NumericFilter;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;

  @state() bindings!: Bindings;
  @state() error!: Error;

  @state()
  public facetState?: NumericFacetState;

  @state()
  public filterState?: NumericFilterState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  @state()
  public facetForInputState?: NumericFacetState;

  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;
  private facetForRangeDependenciesManager?: FacetConditionsManager;
  private facetForInputDependenciesManager?: FacetConditionsManager;
  private filterDependenciesManager?: FacetConditionsManager;
  private headerFocus?: FocusTargetController;

  static styles: CSSResultGroup = numericFacetCommonStyles;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }
    this.initializeTabManager();
    this.computeFacetId();
    this.initializeFacetForInput();
    this.initializeFacetForRange();
    this.initializeFilter();
    this.initializeSearchStatus();
    this.registerFacetToStore();

    // Subscribe to optional controllers manually
    if (this.facetForRange) {
      this.facetForRange.subscribe(() => {
        this.facetState = this.facetForRange!.state;
      });
    }
    if (this.facetForInput) {
      this.facetForInput.subscribe(() => {
        this.facetForInputState = this.facetForInput!.state;
      });
    }
    if (this.filter) {
      this.filter.subscribe(() => {
        this.filterState = this.filter!.state;
      });
    }

    // Listen for number format events
    this.addEventListener(
      'atomic/numberFormat',
      this.handleNumberFormat as EventListener
    );
    this.addEventListener(
      'atomic/numberInputApply',
      this.handleNumberInputApply as EventListener
    );
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.facetForRangeDependenciesManager?.stopWatching();
    this.facetForInputDependenciesManager?.stopWatching();
    this.filterDependenciesManager?.stopWatching();

    this.removeEventListener(
      'atomic/numberFormat',
      this.handleNumberFormat as EventListener
    );
    this.removeEventListener(
      'atomic/numberInputApply',
      this.handleNumberInputApply as EventListener
    );
  }

  private handleNumberFormat = (event: CustomEvent<NumberFormatter>) => {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  };

  private handleNumberInputApply = () => {
    this.facetId &&
      this.bindings.engine.dispatch(
        loadNumericFacetSetActions(
          this.bindings.engine
        ).deselectAllNumericFacetValues(this.facetId)
      );
  };

  private initializeSearchStatus() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private initializeTabManager() {
    this.tabManager = buildTabManager(this.bindings.engine);
  }

  private initializeFacetForInput() {
    if (!this.withInput) {
      return;
    }
    this.facetForInput = buildNumericFacet(this.bindings.engine, {
      options: {
        numberOfValues: 1,
        generateAutomaticRanges: true,
        facetId: `${this.facetId}_input_range`,
        field: this.field,
        sortCriteria: this.sortCriteria,
        rangeAlgorithm: this.rangeAlgorithm,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    this.facetForInputDependenciesManager = this.initializeDependenciesManager(
      this.facetForInput.state.facetId
    );

    return this.facetForInput;
  }

  private initializeFacetForRange() {
    if (this.numberOfValues <= 0) {
      return;
    }

    this.manualRanges = Array.from(
      this.querySelectorAll('atomic-numeric-range')
    ).map(
      (range: {
        start: number;
        end: number;
        endInclusive: boolean;
        label?: string;
      }) => ({
        ...buildNumericRange({
          start: range.start,
          end: range.end,
          endInclusive: range.endInclusive,
        }),
        label: range.label,
      })
    );

    this.facetForRange = buildNumericFacet(this.bindings.engine, {
      options: {
        facetId: this.facetId,
        field: this.field,
        numberOfValues: this.numberOfValues,
        sortCriteria: this.sortCriteria,
        rangeAlgorithm: this.rangeAlgorithm,
        currentValues: this.manualRanges,
        generateAutomaticRanges: !this.manualRanges.length,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    this.facetForRangeDependenciesManager = this.initializeDependenciesManager(
      this.facetForRange.state.facetId
    );

    return this.facetForRange;
  }

  private initializeFilter() {
    if (!this.withInput) {
      return;
    }
    this.filter = buildNumericFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    this.filterDependenciesManager = this.initializeDependenciesManager(
      this.filter.state.facetId
    );
  }

  private initializeDependenciesManager(facetId: string) {
    return buildFacetConditionsManager(this.bindings.engine, {
      facetId,
      conditions: parseDependsOn<FacetValueRequest | CategoryFacetValueRequest>(
        this.dependsOn
      ),
    });
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this,
      isHidden: () => this.isHidden,
    };

    this.bindings.store.registerFacet('numericFacets', {
      ...facetInfo,
      format: (value) =>
        formatHumanReadable({
          facetValue: value,
          logger: this.bindings.engine.logger,
          i18n: this.bindings.i18n,
          field: this.field,
          manualRanges: this.manualRanges,
          formatter: this.formatter,
        }),
    });

    initializePopover(this, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    if (this.filter) {
      this.bindings.store.state.numericFacets[this.filter.state.facetId] =
        this.bindings.store.state.numericFacets[this.facetId!];
    }
  }

  private computeFacetId() {
    if (this.facetId) {
      return;
    }

    if (this.bindings.store.state.numericFacets[this.field]) {
      this.facetId = randomID(`${this.field}_`);
      return;
    }

    this.facetId = this.field;
  }

  private get enabled() {
    return this.facetState?.enabled ?? this.filter?.state.enabled ?? true;
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get hasValues() {
    if (this.facetForInput?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }

  private get numberOfSelectedValues() {
    if (this.filter?.state.range) {
      return 1;
    }

    return (
      this.facetForRange?.state.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private get shouldRenderValues() {
    return (
      !this.hasInputRange &&
      this.numberOfValues > 0 &&
      !!this.valuesToRender.length
    );
  }

  private get hasInputRange() {
    return !!this.filter?.state.range;
  }

  private get valuesToRender() {
    return (
      this.facetForRange?.state.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderInput() {
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: this.searchStatusState,
      facetValues: this.facetForInput?.state.values || [],
      hasInput: !!this.withInput,
    });
  }

  private renderValues() {
    const {
      displayValuesAs,
      field,
      manualRanges,
      label,
      bindings: {
        i18n,
        engine: {logger},
      },
      formatter,
    } = this;

    return renderNumericFacetValuesGroup({
      props: {
        i18n,
        label,
      },
    })(
      html`${this.valuesToRender.map((value) =>
        renderNumericFacetValue({
          props: {
            formatter,
            displayValuesAs,
            facetValue: value,
            field,
            i18n,
            logger,
            manualRanges,
            onClick: () =>
              displayValuesAs === 'link'
                ? this.facetForRange!.toggleSingleSelect(value)
                : this.facetForRange!.toggleSelect(value),
          },
        })
      )}`
    );
  }

  render() {
    const {
      searchStatusState: {firstSearchExecuted, hasError},
      bindings: {i18n},
    } = this;

    if (!firstSearchExecuted || (hasError && !this.shouldRenderFacet)) {
      return renderFacetPlaceholder({
        props: {
          isCollapsed: this.isCollapsed,
          numberOfValues: this.numberOfValues,
        },
      });
    }

    if (!this.shouldRenderFacet) {
      return html`${nothing}`;
    }

    return renderFacetContainer()(html`
      ${renderFacetHeader({
        props: {
          i18n,
          label: this.label,
          onClearFilters: () => {
            this.focusTarget.focusAfterSearch();
            if (this.filterState?.range) {
              this.filter?.clear();
              return;
            }
            this.facetForRange?.deselectAll();
          },
          numberOfActiveValues: this.numberOfSelectedValues,
          isCollapsed: this.isCollapsed,
          headingLevel: this.headingLevel,
          onToggleCollapse: () => {
            this.isCollapsed = !this.isCollapsed;
          },
          headerRef: (el) => this.focusTarget.setTarget(el),
        },
      })}
      ${when(
        !this.isCollapsed,
        () => html`
          ${when(this.shouldRenderValues, () => this.renderValues())}
          ${when(
            this.shouldRenderInput,
            () => html`
              <atomic-facet-number-input
                type=${this.withInput!}
                .bindings=${this.bindings}
                label=${this.label}
                .filter=${this.filter!}
                .filterState=${this.filter!.state}
              ></atomic-facet-number-input>
            `
          )}
        `
      )}
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-numeric-facet': AtomicNumericFacet;
  }
}

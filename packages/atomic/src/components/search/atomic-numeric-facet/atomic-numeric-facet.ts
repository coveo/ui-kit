import {Schema, StringValue} from '@coveo/bueno';
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
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import {shouldDisplayInputForFacetRange} from '@/src/components/common/facets/facet-common';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import type {NumberInputType} from '@/src/components/common/facets/facet-number-input/number-input-type';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import {formatHumanReadable} from '@/src/components/common/facets/numeric-facet/formatter';
import {renderNumericFacetValue} from '@/src/components/common/facets/numeric-facet/value-link';
import {renderNumericFacetValuesGroup} from '@/src/components/common/facets/numeric-facet/values-container';
import numericFacetCommonStyles from '@/src/components/common/facets/numeric-facet-common.tw.css';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {
  defaultNumberFormatter,
  type NumberFormatter,
} from '@/src/components/common/formats/format-common';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {arrayConverter} from '@/src/converters/array-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {mapProperty} from '@/src/utils/props-utils';
import {randomID} from '@/src/utils/utils';
import '@/src/components/common/atomic-facet-number-input/atomic-facet-number-input';

/**
 * The `atomic-numeric-facet` component displays a facet of the results for the current query as numeric ranges.
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria.
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
  private static readonly propsSchema = new Schema({
    displayValuesAs: new StringValue({constrainTo: ['checkbox', 'link']}),
    withInput: new StringValue({constrainTo: ['integer', 'decimal']}),
  });

  static styles: CSSResultGroup = numericFacetCommonStyles;

  /**
   * Specifies a unique identifier for the facet.
   */
  @property({type: String, reflect: true, attribute: 'facet-id'})
  facetId?: string;

  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @property({type: String, reflect: true})
  label = 'no-label';

  /**
   * The field whose values you want to display in the facet.
   */
  @property({type: String, reflect: true})
  field!: string;

  /**
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-numeric-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-numeric-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-included',
    converter: arrayConverter,
  })
  tabsIncluded: string[] = [];

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-numeric-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-numeric-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-excluded',
    converter: arrayConverter,
  })
  tabsExcluded: string[] = [];

  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * If the number of values is 0, no ranges will be displayed.
   */
  @property({type: Number, reflect: true, attribute: 'number-of-values'})
  numberOfValues = 8;

  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   */
  @property({type: String, reflect: true, attribute: 'with-input'})
  withInput?: NumberInputType;

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @property({type: String, reflect: true, attribute: 'sort-criteria'})
  sortCriteria: RangeFacetSortCriterion = 'ascending';

  /**
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined.
   * The default value of `"equiprobable"` generates facet ranges which vary in size but have a more balanced number of results within each range.
   * The value of `"even"` generates equally sized facet ranges across all of the results.
   */
  @property({type: String, reflect: true, attribute: 'range-algorithm'})
  rangeAlgorithm: RangeFacetRangeAlgorithm = 'equiprobable';

  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @property({type: String, reflect: true, attribute: 'display-values-as'})
  displayValuesAs: 'checkbox' | 'link' = 'checkbox';

  /**
   * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
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
  @property({type: Number, reflect: true, attribute: 'injection-depth'})
  injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-numeric-facet
   *   depends-on-abc
   *   ...
   * ></atomic-numeric-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-numeric-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-numeric-facet>
   * ```
   */
  @mapProperty({attributePrefix: 'depends-on'})
  dependsOn!: Record<string, string>;

  @state() bindings!: Bindings;

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

  @state() public error!: Error;

  @state()
  public facetForInputState?: NumericFacetState;

  public facetForRange?: NumericFacet;
  public facetForInput?: NumericFacet;
  public filter?: NumericFilter;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;

  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  constructor() {
    super();
    new ValidatePropsController(
      this,
      () => ({
        displayValuesAs: this.displayValuesAs as string,
        withInput: this.withInput as string | undefined,
      }),
      AtomicNumericFacet.propsSchema
    );
  }
  private filterDependenciesManager?: FacetConditionsManager;
  private headerFocus?: FocusTargetController;
  private removeNumberFormatListener?: () => void;
  private removeNumberInputApplyListener?: () => void;
  private unsubscribeFacetForRange?: () => void;
  private unsubscribeFacetForInput?: () => void;
  private unsubscribeFilter?: () => void;

  public initialize() {
    this.validateTabs();
    this.initializeTabManager();
    this.computeFacetId();
    this.initializeFacetForInput();
    this.initializeFacetForRange();
    this.initializeFilter();
    this.initializeSearchStatus();
    this.registerFacetToStore();
    this.registerNumberInputApplyListener();
  }

  connectedCallback() {
    super.connectedCallback();
    this.registerNumberFormatListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.filterDependenciesManager?.stopWatching();
    this.removeNumberFormatListener?.();
    this.removeNumberInputApplyListener?.();
    this.unsubscribeFacetForRange?.();
    this.unsubscribeFacetForInput?.();
    this.unsubscribeFilter?.();
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
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

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get enabled() {
    return this.facetState?.enabled ?? this.filter?.state.enabled ?? true;
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
  }

  private get hasValues() {
    if (this.facetForInput?.state.values.length) {
      return true;
    }
    return !!this.valuesToRender.length;
  }

  private validateTabs() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }
  }

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
          included: this.tabsIncluded,
          excluded: this.tabsExcluded,
        },
      },
    });

    this.facetForInputState = this.facetForInput.state;
    this.unsubscribeFacetForInput = this.facetForInput.subscribe(() => {
      this.facetForInputState = this.facetForInput!.state;
    });

    return this.facetForInput;
  }

  private initializeFacetForRange() {
    if (this.numberOfValues <= 0) {
      return;
    }

    this.manualRanges = Array.from(
      this.querySelectorAll('atomic-numeric-range')
    ).map((range) => {
      const start = Number(range.getAttribute('start'));
      const end = Number(range.getAttribute('end'));
      // TODO v4: change the logic to simply check for the presence of the attribute
      const endInclusive =
        range.hasAttribute('end-inclusive') &&
        range.getAttribute('end-inclusive') !== 'false';
      const label = range.getAttribute('label') ?? undefined;
      return {
        ...buildNumericRange({start, end, endInclusive}),
        label,
      };
    });

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
          included: this.tabsIncluded,
          excluded: this.tabsExcluded,
        },
      },
    });

    this.facetState = this.facetForRange.state;
    this.unsubscribeFacetForRange = this.facetForRange.subscribe(() => {
      this.facetState = this.facetForRange!.state;
    });

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
          included: this.tabsIncluded,
          excluded: this.tabsExcluded,
        },
      },
    });

    this.filterDependenciesManager = this.initializeDependenciesManager(
      this.filter.state.facetId
    );

    this.filterState = this.filter.state;
    this.unsubscribeFilter = this.filter.subscribe(() => {
      this.filterState = this.filter!.state;
    });
  }

  private initializeDependenciesManager(facetId: string) {
    if (!this.dependsOn || Object.keys(this.dependsOn).length === 0) {
      return;
    }

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

  private registerNumberFormatListener() {
    const handleNumberFormat = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.formatter = (event as CustomEvent<NumberFormatter>).detail;
    };

    this.addEventListener(
      'atomic/numberFormat',
      handleNumberFormat as EventListener
    );

    this.removeNumberFormatListener = () => {
      this.removeEventListener(
        'atomic/numberFormat',
        handleNumberFormat as EventListener
      );
    };
  }

  private registerNumberInputApplyListener() {
    const handleNumberInputApply = () => {
      if (this.facetId) {
        this.bindings.engine.dispatch(
          loadNumericFacetSetActions(
            this.bindings.engine
          ).deselectAllNumericFacetValues(this.facetId)
        );
      }
    };

    this.addEventListener('atomic/numberInputApply', handleNumberInputApply);

    this.removeNumberInputApplyListener = () => {
      this.removeEventListener(
        'atomic/numberInputApply',
        handleNumberInputApply
      );
    };
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

  private handleClearFilters() {
    this.focusTarget.focusAfterSearch();
    if (this.filterState?.range) {
      this.filter?.clear();
      return;
    }
    this.facetForRange?.deselectAll();
  }

  private handleToggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  private handleValueClick(value: NumericFacetState['values'][number]) {
    if (this.displayValuesAs === 'link') {
      this.facetForRange!.toggleSingleSelect(value);
    } else {
      this.facetForRange!.toggleSelect(value);
    }
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
      props: {i18n, label},
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
            onClick: () => this.handleValueClick(value),
          },
        })
      )}`
    );
  }

  private renderInput() {
    return html`<atomic-facet-number-input
      .type=${this.withInput!}
      .bindings=${this.bindings}
      .label=${this.label}
      .filter=${this.filter!}
      .filterState=${this.filter!.state}
    ></atomic-facet-number-input>`;
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    const {
      searchStatusState: {firstSearchExecuted, hasError},
    } = this;

    if (hasError || !this.enabled) {
      return html``;
    }

    if (!firstSearchExecuted) {
      return html`${renderFacetPlaceholder({
        props: {
          numberOfValues: this.numberOfValues,
          isCollapsed: this.isCollapsed,
        },
      })}`;
    }

    return html`${when(this.shouldRenderFacet, () =>
      renderFacetContainer()(
        html`${renderFacetHeader({
          props: {
            i18n: this.bindings.i18n,
            label: this.label,
            onClearFilters: () => this.handleClearFilters(),
            numberOfActiveValues: this.numberOfSelectedValues,
            isCollapsed: this.isCollapsed,
            headingLevel: this.headingLevel,
            onToggleCollapse: () => this.handleToggleCollapse(),
            headerRef: (el) => this.focusTarget.setTarget(el),
          },
        })}
        ${when(
          !this.isCollapsed,
          () =>
            html`${when(this.shouldRenderValues, () => this.renderValues())}
            ${when(this.shouldRenderInput, () => this.renderInput())}`
        )}`
      )
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-numeric-facet': AtomicNumericFacet;
  }
}

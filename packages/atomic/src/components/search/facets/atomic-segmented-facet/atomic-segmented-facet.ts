import {isArray} from '@coveo/bueno';
import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetValueRequest,
  type Facet,
  type FacetConditionsManager,
  type FacetOptions,
  type FacetSortCriterion,
  type FacetState,
  type FacetValue,
  type FacetValueRequest,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {mapProperty} from '@/src/utils/props-utils';
import {renderFacetSegmentedValue} from '../facet-segmented-value/facet-segmented-value';

/**
 * The `atomic-segmented-facet` component displays a horizontal facet of the results for the current query.
 *
 * @part segmented-container - The container that holds the segmented facets.
 * @part label - The facet value label.
 * @part values - The facet values container.
 * @part value-box - The facet value.
 * @part value-box-selected - The selected facet value.
 * @part placeholder - The placeholder displayed when the facet is loading.
 */
@customElement('atomic-segmented-facet')
@bindings()
@withTailwindStyles
export class AtomicSegmentedFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = css`
    li:first-child .value-box {
      border-top-left-radius: var(--atomic-border-radius);
      border-bottom-left-radius: var(--atomic-border-radius);
    }

    li:last-child .value-box {
      border-top-right-radius: var(--atomic-border-radius);
      border-bottom-right-radius: var(--atomic-border-radius);
    }

    .value-label {
      max-width: 15ch;
    }
  `;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public searchStatus!: SearchStatus;
  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  public tabManager!: TabManager;
  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  public facet!: Facet;
  @bindStateToController('facet')
  @state()
  public facetState!: FacetState;

  /**
   * Specifies a unique identifier for the facet.
   */
  @property({type: String, reflect: true, attribute: 'facet-id'})
  public facetId?: string;

  /**
   * The field whose values you want to display in the facet.
   */
  @property({type: String, reflect: true}) public field!: string;

  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @property({type: String, reflect: true}) public label?: string;

  /**
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-segmented-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-segmented-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @property({type: Array, reflect: true, attribute: 'tabs-included'})
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-segmented-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-segmented-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({type: Array, reflect: true, attribute: 'tabs-excluded'})
  public tabsExcluded: string[] = [];

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @property({type: Boolean, reflect: true, attribute: 'filter-facet-count'})
  public filterFacetCount = true;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @property({type: Number, attribute: 'injection-depth'})
  public injectionDepth = 1000;

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @property({type: Number, reflect: true, attribute: 'number-of-values'})
  public numberOfValues = 6;

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'alphanumericDescending', 'occurrences', 'alphanumericNatural', 'alphanumericNaturalDescending' and 'automatic'.
   */
  @property({type: String, reflect: true, attribute: 'sort-criteria'})
  public sortCriteria: FacetSortCriterion = 'automatic';

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-segmented-facet facet-id="abc" field="objecttype" ...></atomic-segmented-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-segmented-facet
   *   depends-on-abc
   *   ...
   * ></atomic-segmented-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-segmented-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-segmented-facet>
   * ```
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn: Record<string, string> = {};

  /**
   * Specifies an explicit list of `allowedValues` in the Search API request. This list is in the form of a JSON string.
   *
   * If you specify a list of values for this option, the facet only uses these values (if they are available in
   * the current result set).
   *
   * Example:
   *
   * The following facet only uses the `Contact`, `Account`, and `File` values of the `objecttype` field. Even if the
   * current result set contains other `objecttype` values, such as `Message` or `Product`, the facet does not use
   * them.
   *
   * ```html
   * <atomic-segmented-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-segmented-facet>
   * ```
   *
   * The maximum amount of allowed values is 25.
   *
   * The default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  @property({type: Array, attribute: 'allowed-values'})
  public allowedValues: string[] = [];

  /**
   * Identifies the facet values that must appear at the top, in this order.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   *
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   *
   * Example:
   *
   * The following facet will sort the `Contact`, `Account`, and `File` values at the top of the list for the `objecttype` field.
   *
   * If there are more than these 3 values available, the rest of the list will be sorted using `occurrences`.
   *
   * ```html
   * <atomic-segmented-facet field="objecttype" custom-sort='["Contact","Account","File"]' sort-criteria='occurrences'></atomic-segmented-facet>
   * ```
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  @property({type: Array, attribute: 'custom-sort'})
  public customSort: string[] = [];

  private dependenciesManager!: FacetConditionsManager;

  public initialize() {
    this.validateTabs();
    this.parseArrayProperties();

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.facet = buildFacet(this.bindings.engine, {options: this.facetOptions});
    this.facetId = this.facet.state.facetId;

    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          FacetValueRequest | CategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dependenciesManager?.stopWatching();
  }

  private validateTabs() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }
  }

  private parseArrayProperties() {
    this.tabsIncluded = this.parseArrayProperty(this.tabsIncluded);
    this.tabsExcluded = this.parseArrayProperty(this.tabsExcluded);
    this.allowedValues = this.parseArrayProperty(this.allowedValues);
    this.customSort = this.parseArrayProperty(this.customSort);
  }

  private parseArrayProperty(value: string[] | string): string[] {
    if (isArray(value)) {
      return value;
    }
    try {
      const parsed = JSON.parse(value);
      return isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private get facetOptions(): FacetOptions {
    return {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
      hasBreadcrumbs: false,
      allowedValues: this.allowedValues.length
        ? [...this.allowedValues]
        : undefined,
      customSort: this.customSort.length ? [...this.customSort] : undefined,
      tabs: {
        included: [...this.tabsIncluded],
        excluded: [...this.tabsExcluded],
      },
    };
  }

  private renderValuesContainer(children: unknown) {
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
      },
    })(
      html`<ul class="box-container flex h-10" part="values">${children}</ul>`
    );
  }

  private renderValue(facetValue: FacetValue, onClick: () => void) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state !== 'idle';

    return renderFacetSegmentedValue({
      props: {
        displayValue,
        numberOfResults: facetValue.numberOfResults,
        isSelected,
        i18n: this.bindings.i18n,
        onClick,
      },
    });
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
      return nothing;
    }
    return html`<b class="mr-2" part="label">${this.label}:</b>`;
  }

  @errorGuard()
  @bindingGuard()
  render() {
    if (this.searchStatusState.hasError || !this.facetState.enabled) {
      return nothing;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral h-8 w-48 animate-pulse rounded"
        ></div>
      `;
    }

    if (!this.facetState.values.length) {
      return nothing;
    }

    return html`
      <div
        part="segmented-container"
        class="mr-2 flex h-10 items-center whitespace-nowrap"
      >
        ${this.renderLabel()} ${this.renderValues()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-segmented-facet': AtomicSegmentedFacet;
  }
}

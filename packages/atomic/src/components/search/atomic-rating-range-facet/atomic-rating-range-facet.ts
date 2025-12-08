import {NumberValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildFacetConditionsManager,
  buildNumericFacet,
  buildNumericRange,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetValueRequest,
  type FacetConditionsManager,
  type FacetValueRequest,
  type NumericFacet,
  type NumericFacetOptions,
  type NumericFacetState,
  type NumericFacetValue,
  type NumericRangeRequest,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import atomicRatingStyles from '@/src/components/common/atomic-rating/atomic-rating.tw.css';
import {renderRating} from '@/src/components/common/atomic-rating/rating';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import facetValueCheckboxStyles from '@/src/components/common/facets/facet-value-checkbox/facet-value-checkbox.tw.css';
import {renderFacetValueLink} from '@/src/components/common/facets/facet-value-link/facet-value-link';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {arrayConverter} from '@/src/converters/array-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {mapProperty} from '@/src/utils/props-utils';
import Star from '../../../images/star.svg';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (for example, number of occurrences).
 * An `atomic-rating-range-facet` displays a facet of the results for the current query as ratings.
 * It only supports numeric fields.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and toggles to expand or collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 * @part value-rating - The facet value rating, common for all displays.
 * @part value-rating-icon - The individual star icons used in the rating display.
 *
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 */
@customElement('atomic-rating-range-facet')
@bindings()
@withTailwindStyles
export class AtomicRatingRangeFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  private static readonly propsSchema = new Schema({
    field: new StringValue({required: true, emptyAllowed: false}),
    numberOfIntervals: new NumberValue({min: 1}),
    maxValueInIndex: new NumberValue({min: 0, required: false}),
    minValueInIndex: new NumberValue({min: 0}),
    injectionDepth: new NumberValue({min: 0}),
    dependsOn: new RecordValue({options: {required: false}}),
  });

  static styles = [
    facetCommonStyles,
    facetValueCheckboxStyles,
    atomicRatingStyles,
  ];
  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public facet!: NumericFacet;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  private dependenciesManager?: FacetConditionsManager;
  private headerFocus?: FocusTargetController;

  @bindStateToController('facet')
  @state()
  public facetState!: NumericFacetState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  /**
   * Specifies a unique identifier for the facet.
   */
  @property({reflect: true, attribute: 'facet-id', type: String})
  public facetId?: string;

  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @property({reflect: true, type: String})
  public label = 'no-label';

  /**
   * The field whose values you want to display in the facet.
   */
  @property({reflect: true, type: String})
  public field!: string;

  /**
   * The tabs on which the facet will be displayed.
   *
   * Expressed as a JSON array, for example: `["tab1","tab2"]`.
   *
   * If left empty, the facet will be displayed on any tab. Otherwise, the facet will only be displayed on the specified tabs.
   */
  @property({
    reflect: true,
    attribute: 'tabs-included',
    type: Array,
    converter: arrayConverter,
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which the facet will NOT be displayed.
   *
   * Expressed as a JSON array, for example: `["tab1","tab2"]`.
   *
   * If left empty, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({
    reflect: true,
    attribute: 'tabs-excluded',
    type: Array,
    converter: arrayConverter,
  })
  public tabsExcluded: string[] = [];

  /**
   * The number of options to display in the facet. If `maxValueInIndex` isn't specified, it will be assumed that this is also the maximum number of rating icons.
   */
  @property({reflect: true, attribute: 'number-of-intervals', type: Number})
  public numberOfIntervals = 5;

  /**
   * The maximum value in the field's index and the number of rating icons to display in the facet. This property will default to the same value as `numberOfIntervals`, if not assigned a value.
   */
  @property({
    reflect: true,
    attribute: 'max-value-in-index',
    type: Number,
  })
  public maxValueInIndex!: number;

  /**
   * The minimum value of the field.
   */
  @property({reflect: true, attribute: 'min-value-in-index', type: Number})
  public minValueInIndex = 1;

  /**
   * The SVG icon to use to display the rating.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   *
   * When using a custom icon, at least part of your icon should have the color set to `fill="currentColor"`.
   * This part of the SVG will take on the colors set in the following [variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties):
   *
   * - `--atomic-rating-icon-active-color`
   * - `--atomic-rating-icon-inactive-color`
   */
  @property({reflect: true, type: String})
  public icon = Star;

  /**
   * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
   */
  @property({
    reflect: true,
    attribute: 'is-collapsed',
    type: Boolean,
    converter: booleanConverter,
  })
  public isCollapsed = false;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @property({reflect: true, attribute: 'heading-level', type: Number})
  public headingLevel = 0;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @property({
    reflect: true,
    attribute: 'filter-facet-count',
    type: Boolean,
    converter: booleanConverter,
  })
  public filterFacetCount!: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @property({reflect: true, attribute: 'injection-depth', type: Number})
  public injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-rating-range-facet
   *   depends-on-abc
   *   ...
   * ></atomic-rating-range-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-rating-range-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-rating-range-facet>
   * ```
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn!: Record<string, string>;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        numberOfIntervals: this.numberOfIntervals,
        maxValueInIndex: this.maxValueInIndex,
        minValueInIndex: this.minValueInIndex,
        injectionDepth: this.injectionDepth,
        dependsOn: this.dependsOn,
      }),
      AtomicRatingRangeFacet.propsSchema,
      // TODO V4: KIT-5197 - Remove false
      false
    );
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.maxValueInIndex === undefined) {
      this.maxValueInIndex = this.numberOfIntervals;
    }
  }

  private get _filterFacetCount() {
    return this.filterFacetCount ?? true;
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);
    this.initializeFacet();
    this.initializeDependenciesManager();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.dependenciesManager?.stopWatching();
  }

  private get focusTarget() {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  private get isHidden() {
    return (
      !this.valuesToRender.length ||
      this.searchStatusState.hasError ||
      !this.facet.state.enabled
    );
  }

  private initializeFacet() {
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfIntervals,
      currentValues: this.generateCurrentValues(),
      sortCriteria: 'descending',
      generateAutomaticRanges: false,
      filterFacetCount: this._filterFacetCount,
      injectionDepth: this.injectionDepth,
      tabs: {
        included: [...this.tabsIncluded],
        excluded: [...this.tabsExcluded],
      },
    };
    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this,
      isHidden: () => this.isHidden,
    };
    this.bindings.store.registerFacet('numericFacets', {
      ...facetInfo,
      format: (value) => this.formatFacetValue(value),
      // @ts-ignore -- Because of Stencil VNode dependencies.
      content: (value) => this.ratingContent(value),
    });
    initializePopover(this, {
      ...facetInfo,
      hasValues: () => !!this.valuesToRender.length,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
  }

  private get scaleFactor() {
    return (
      (this.maxValueInIndex ?? this.numberOfIntervals) / this.numberOfIntervals
    );
  }

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private initializeDependenciesManager() {
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          FacetValueRequest | CategoryFacetValueRequest
        >(this.dependsOn || {}),
      }
    );
  }

  private generateCurrentValues() {
    const currentValues: NumericRangeRequest[] = [];
    for (let i = this.minValueInIndex; i <= this.numberOfIntervals; i++) {
      currentValues.push(
        buildNumericRange({
          start: Math.round(i * this.scaleFactor * 100) / 100,
          end:
            Math.round((this.maxValueInIndex ?? this.numberOfIntervals) * 100) /
            100,
          endInclusive: true,
        })
      );
    }
    return currentValues;
  }

  private formatFacetValue(facetValue: NumericFacetValue) {
    const maxValue = this.maxValueInIndex ?? this.numberOfIntervals;
    if (facetValue.start === maxValue) {
      return this.bindings.i18n.t('stars-only', {
        count: facetValue.start,
      });
    }
    return this.bindings.i18n.t('stars-range', {
      value: facetValue.start,
      count: maxValue,
    });
  }

  private ratingContent(facetValue: NumericFacetValue) {
    return html`<div class="flex items-center">
      ${renderRating({
        props: {
          i18n: this.bindings.i18n,
          numberOfTotalIcons: this.maxValueInIndex ?? this.numberOfIntervals,
          numberOfActiveIcons: facetValue.start,
          icon: this.icon,
        },
      })}
      ${this.renderLabelText(facetValue)}
    </div>`;
  }

  private renderHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
        onClearFilters: () => {
          this.focusTarget.focusAfterSearch();
          this.facet.deselectAll();
        },
        numberOfActiveValues: this.numberOfSelectedValues,
        isCollapsed: this.isCollapsed,
        headingLevel: this.headingLevel,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        headerRef: (el) => this.focusTarget.setTarget(el),
      },
    });
  }

  private renderLabelText(facetValue: NumericFacetValue) {
    return html`<span
      part="value-label"
      class="group-focus:text-primary group-hover:text-primary ml-1 flex items-center truncate ${
        facetValue.state === 'selected' ? 'font-bold' : ''
      }"
    >
      ${when(
        facetValue.start === (this.maxValueInIndex ?? this.numberOfIntervals),
        () => html`<span>${this.bindings.i18n.t('only')}</span>`,
        () => html`${this.bindings.i18n.t('and-up')}`
      )}
    </span>`;
  }

  private renderValue(facetValue: NumericFacetValue, onClick: () => void) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    return renderFacetValueLink({
      props: {
        displayValue,
        numberOfResults: facetValue.numberOfResults,
        isSelected,
        i18n: this.bindings.i18n,
        onClick,
      },
    })(this.ratingContent(facetValue));
  }

  private renderValuesContainer(children: unknown) {
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
      },
    })(html`<ul class="mt-3" part="values">
      ${children}
    </ul>`);
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) =>
        this.renderValue(value, () => this.facet.toggleSingleSelect(value))
      )
    );
  }

  private get valuesToRender() {
    return this.facet.state.values.filter(
      (value) => value.numberOfResults || value.state !== 'idle'
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(
      !this.searchStatusState.hasError && this.facet.state.enabled,
      () => {
        if (!this.searchStatusState.firstSearchExecuted) {
          return renderFacetPlaceholder({
            props: {
              numberOfValues: this.numberOfIntervals,
              isCollapsed: this.isCollapsed,
            },
          });
        }

        if (!this.valuesToRender.length) {
          return nothing;
        }

        return renderFacetContainer()(html`${this.renderHeader()}
          ${when(!this.isCollapsed, () => this.renderValues())}`);
      }
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-rating-range-facet': AtomicRatingRangeFacet;
  }
}

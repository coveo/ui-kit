import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetState,
  NumericFacetOptions,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  NumericFacetValue,
  NumericRangeRequest,
  buildNumericRange,
  buildFacetConditionsManager,
  FacetConditionsManager,
  FacetValueRequest,
  CategoryFacetValueRequest,
  buildTabManager,
  TabManager,
  TabManagerState,
} from '@coveo/headless';
import {Component, h, State, Prop, VNode, Element} from '@stencil/core';
import Star from '../../../../images/star.svg';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ArrayProp, MapProp} from '../../../../utils/props-utils';
import {Rating} from '../../../common/atomic-rating/atomic-rating';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {FacetValueLink} from '../../../common/facets/facet-value-link/facet-value-link';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {Hidden} from '../../../common/stencil-hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
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
@Component({
  tag: 'atomic-rating-range-facet',
  styleUrl: 'atomic-rating-range-facet.pcss',
  shadow: true,
})
export class AtomicRatingRangeFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: NumericFacet;
  private dependenciesManager?: FacetConditionsManager;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('tabManager')
  @State()
  public tabManagerState!: TabManagerState;
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
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-timeframe-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsIncluded: string[] | string = '[]';

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-timeframe-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsExcluded: string[] | string = '[]';

  /**
   * The number of options to display in the facet. If `maxValueInIndex` isn't specified, it will be assumed that this is also the maximum number of rating icons.
   */
  @Prop({reflect: true}) public numberOfIntervals = 5;
  /**
   * The maximum value in the field's index and the number of rating icons to display in the facet. This property will default to the same value as `numberOfIntervals`, if not assigned a value.
   */
  @Prop({reflect: true}) public maxValueInIndex = this.numberOfIntervals;
  /**
   * The minimum value of the field.
   */
  @Prop({reflect: true}) public minValueInIndex = 1;
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
  @Prop({reflect: true}) public icon = Star;
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
  @Prop({reflect: true}) public injectionDepth = 1000;

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
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  private headerFocus?: FocusTargetController;

  private get focusTarget() {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    if (
      [...this.tabsIncluded].length > 0 &&
      [...this.tabsExcluded].length > 0
    ) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
      );
    }
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);
    this.initializeFacet();
    this.initializeDependenciesManager();
  }
  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
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
      filterFacetCount: this.filterFacetCount,
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
      element: this.host,
      isHidden: () => this.isHidden,
    };
    this.bindings.store.registerFacet('numericFacets', {
      ...facetInfo,
      format: (value) => this.formatFacetValue(value),
      content: (value) => this.ratingContent(value),
    });
    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => !!this.valuesToRender.length,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
  }

  private get scaleFactor() {
    return this.maxValueInIndex / this.numberOfIntervals;
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
        >(this.dependsOn),
      }
    );
  }

  private generateCurrentValues() {
    const currentValues: NumericRangeRequest[] = [];
    for (let i = this.minValueInIndex; i <= this.numberOfIntervals; i++) {
      currentValues.push(
        buildNumericRange({
          start: Math.round(i * this.scaleFactor * 100) / 100,
          end: Math.round(this.maxValueInIndex * 100) / 100,
          endInclusive: true,
        })
      );
    }
    return currentValues;
  }

  private formatFacetValue(facetValue: NumericFacetValue) {
    if (facetValue.start === this.maxValueInIndex) {
      return this.bindings.i18n.t('stars-only', {
        count: facetValue.start,
      });
    }
    return this.bindings.i18n.t('stars-range', {
      value: facetValue.start,
      count: this.maxValueInIndex,
    });
  }

  private ratingContent(facetValue: NumericFacetValue) {
    return (
      <div class="flex items-center">
        <Rating
          i18n={this.bindings.i18n}
          numberOfTotalIcons={this.maxValueInIndex}
          numberOfActiveIcons={facetValue.start}
          icon={this.icon}
        ></Rating>
        {this.renderLabelText(facetValue)}
      </div>
    );
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          this.focusTarget.focusAfterSearch();
          this.facet.deselectAll();
        }}
        numberOfActiveValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={(el) => this.focusTarget.setTarget(el)}
      ></FacetHeader>
    );
  }

  private renderLabelText(facetValue: NumericFacetValue) {
    return (
      <span
        part="value-label"
        class={`group-focus:text-primary group-hover:text-primary ml-1 flex items-center truncate ${
          facetValue.state === 'selected' ? 'font-bold' : ''
        }`}
      >
        {facetValue.start === this.maxValueInIndex ? (
          <span>{this.bindings.i18n.t('only')}</span>
        ) : (
          this.bindings.i18n.t('and-up')
        )}
      </span>
    );
  }

  private renderValue(facetValue: NumericFacetValue, onClick: () => void) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    return (
      <FacetValueLink
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={this.bindings.i18n}
        onClick={onClick}
      >
        {this.ratingContent(facetValue)}
      </FacetValueLink>
    );
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <FacetValuesGroup i18n={this.bindings.i18n} label={this.label}>
        <ul class="mt-3" part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
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

  public render() {
    if (this.searchStatusState.hasError || !this.facet.state.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfIntervals}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.valuesToRender.length) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && this.renderValues()}
      </FacetContainer>
    );
  }
}

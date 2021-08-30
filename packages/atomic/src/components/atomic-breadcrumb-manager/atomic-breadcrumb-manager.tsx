import {Component, h, State, Prop, VNode, Host} from '@stencil/core';
import {
  Bindings,
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  buildBreadcrumbManager,
  CategoryFacetBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  NumericFacetValue,
  DateFacetValue,
} from '@coveo/headless';
import mainclear from '../../images/main-clear.svg';
import {BaseFacetValue} from '../../../../headless/dist/definitions/features/facets/facet-api/response';

type BreadcrumbFacet = Breadcrumb<BaseFacetValue & {value: string}>;
type BaseBreadcrumbValue = BreadcrumbValue<BaseFacetValue>;
type AnyBreadcrumbValue = BaseBreadcrumbValue | CategoryFacetBreadcrumb;

/**
 * The `atomic-breadcrumb-manager` component creates breadcrumbs that display a summary of the currently active facet values.
 *
 * @part breadcrumb-clear-all - The clear all breadcrumbs button.
 * @part breadcrumb-label - Label attribute for the breadcrumb's label.
 * @part breadcrumbs - The list of breadcrumb values following the label.
 * @part breadcrumb - An individual breadcrumb.
 */

@Component({
  tag: 'atomic-breadcrumb-manager',
  styleUrl: 'atomic-breadcrumb-manager.pcss',
  shadow: true,
})
export class AtomicBreadcrumbManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;
  private strings = {
    breadcrumb: (label: string) =>
      this.bindings.i18n.t('remove-filter-on', {value: label}),
    clearAllFilters: () => this.bindings.i18n.t('clear-all-filters'),
    nMore: (value: number) => this.bindings.i18n.t('n-more', {value}),
    showNMoreFilters: (value: number) =>
      this.bindings.i18n.t('show-n-more-filters', {value}),
    to: (start: string, end: string) =>
      this.bindings.i18n.t('to', {start, end}),
  };

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @State() private collapsedBreadcrumbsState: string[] = [];
  @State() public error!: Error;

  /**
   * Number of breadcrumbs to display when collapsed.
   */
  @Prop() public collapseThreshold = 5;
  /**
   * A character that divides each path segment in a category facet breadcrumb.
   */
  @Prop() public categoryDivider = '/';

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private getBreadcrumbValue(
    value: string,
    breadcrumbValue: AnyBreadcrumbValue
  ) {
    return (
      <button
        part="breadcrumb"
        class="inline-grid grid-flow-col text-neutral-dark hover:text-primary-light"
        aria-label={this.strings.breadcrumb(value)}
        title={value}
        onClick={() =>
          this.breadcrumbManager.deselectBreadcrumb(breadcrumbValue)
        }
      >
        <span class="truncate">{value}</span>
        <atomic-icon
          role="button"
          class="w-2.5 ml-1.5 flex-shrink-0 self-center"
          icon={mainclear}
        ></atomic-icon>
      </button>
    );
  }

  private getBreadcrumbContainer(label: string, children: VNode[]) {
    return (
      <li class="mb-1 flex">
        <span
          title={label}
          class="text-on-background mr-2"
          part="breadcrumb-label"
        >
          {label}:
        </span>
        <ul part="breadcrumbs" class="flex flex-wrap">
          {children}
        </ul>
      </li>
    );
  }

  private getBreadcrumbValueContainer(children: VNode[]) {
    return <li class="mr-3">{children}</li>;
  }

  private getBreadcrumbValues(breadcrumb: BreadcrumbFacet) {
    const {breadcrumbsToShow, moreButton} =
      this.collapsedBreadcrumbsHandler(breadcrumb);
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) =>
      this.getBreadcrumbValueContainer(
        this.getBreadcrumbValue(breadcrumbValue.value.value, breadcrumbValue)
      )
    );

    return [...renderedBreadcrumbs, moreButton];
  }

  private get facetBreadcrumbs() {
    return this.breadcrumbManagerState.facetBreadcrumbs.map((breadcrumb) => {
      const {label} = this.bindings.store.get('facets')[breadcrumb.facetId];
      return this.getBreadcrumbContainer(
        label,
        this.getBreadcrumbValues(breadcrumb)
      );
    });
  }

  private formatRangeBreadcrumb<
    ValueType extends NumericFacetValue | DateFacetValue
  >(
    breadcrumb: Breadcrumb<ValueType>,
    formatValue: (value: ValueType) => string
  ): BreadcrumbFacet {
    return {
      ...breadcrumb,
      values: breadcrumb.values.map((breadcrumbValue) => ({
        deselect: breadcrumbValue.deselect,
        value: {
          ...breadcrumbValue.value,
          value: formatValue(breadcrumbValue.value),
        },
      })),
    };
  }

  private get numericFacetBreadcrumbs() {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs.map(
      (breadcrumb) => {
        const {format, label} =
          this.bindings.store.get('numericFacets')[breadcrumb.facetId];
        return this.getBreadcrumbContainer(
          label,
          this.getBreadcrumbValues(
            this.formatRangeBreadcrumb(breadcrumb, format)
          )
        );
      }
    );
  }

  private get dateFacetBreadcrumbs() {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs.map(
      (breadcrumb) => {
        const {format, label} =
          this.bindings.store.get('dateFacets')[breadcrumb.facetId];
        return this.getBreadcrumbContainer(
          label,
          this.getBreadcrumbValues(
            this.formatRangeBreadcrumb(breadcrumb, format)
          )
        );
      }
    );
  }

  private categoryCollapsedBreadcrumbsHandler(
    breadcrumb: CategoryFacetBreadcrumb
  ) {
    if (breadcrumb.path.length <= 3) {
      return breadcrumb.path.map((breadcrumb) => breadcrumb.value);
    }

    const collapsed = '...';
    const firstBreadcrumbValue = breadcrumb.path[0].value;
    const lastTwoBreadcrumbsValues = breadcrumb.path
      .slice(-2)
      .map((breadcrumb) => breadcrumb.value);
    return [firstBreadcrumbValue, collapsed, ...lastTwoBreadcrumbsValues];
  }

  private getCategoryBreadrumbValue(breadcrumb: CategoryFacetBreadcrumb) {
    const breadcrumbsToShow =
      this.categoryCollapsedBreadcrumbsHandler(breadcrumb);
    const joinedBreadcrumbs = breadcrumbsToShow.join(
      ` ${this.categoryDivider} `
    );
    return this.getBreadcrumbValue(joinedBreadcrumbs, breadcrumb);
  }

  private get categoryFacetBreadcrumbs() {
    return this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
      (breadcrumb) => {
        const {label} =
          this.bindings.store.get('categoryFacets')[breadcrumb.facetId];

        return this.getBreadcrumbContainer(
          label,
          this.getCategoryBreadrumbValue(breadcrumb)
        );
      }
    );
  }

  private getClearAllFiltersButton() {
    return (
      <button
        part="breadcrumb-clear-all"
        class="text-primary ml-2 flex-shrink-0 self-start"
        onClick={() => this.breadcrumbManager.deselectAll()}
      >
        {this.strings.clearAllFilters()}
      </button>
    );
  }

  private showFacetCollapsedBreadcrumbs(field: string) {
    this.collapsedBreadcrumbsState = [...this.collapsedBreadcrumbsState, field];
  }

  private collapsedBreadcrumbsHandler<T extends BaseFacetValue>(
    breadcrumb: Breadcrumb<T>
  ): {breadcrumbsToShow: BreadcrumbValue<T>[]; moreButton?: string} {
    if (this.collapsedBreadcrumbsState.indexOf(breadcrumb.field) !== -1) {
      const breadcrumbsToShow = breadcrumb.values;
      this.resetCollapsedBreadcrumbs(
        breadcrumbsToShow.length,
        breadcrumb.field
      );
      return {breadcrumbsToShow};
    }

    const collapsedNumberOfBreadcrumbs =
      breadcrumb.values.length - this.collapseThreshold;

    if (collapsedNumberOfBreadcrumbs <= 1) {
      return {
        breadcrumbsToShow: breadcrumb.values,
      };
    }

    return {
      breadcrumbsToShow: breadcrumb.values.slice(0, this.collapseThreshold),
      moreButton: this.getMoreButton(
        collapsedNumberOfBreadcrumbs,
        breadcrumb.field
      ),
    };
  }

  private getMoreButton(collapsedBreadcrumbNumber: number, field: string) {
    return this.getBreadcrumbValueContainer(
      <button
        part="breadcrumb"
        aria-label={this.strings.showNMoreFilters(collapsedBreadcrumbNumber)}
        onClick={() => this.showFacetCollapsedBreadcrumbs(field)}
      >
        {this.strings.nMore(collapsedBreadcrumbNumber)}
      </button>
    );
  }

  private resetCollapsedBreadcrumbs(length: number, field: string) {
    length <= this.collapseThreshold
      ? this.collapsedBreadcrumbsState.splice(
          this.collapsedBreadcrumbsState.indexOf(field),
          1
        )
      : null;
  }

  public render() {
    if (!this.breadcrumbManager.state.hasBreadcrumbs) {
      return <Host class="atomic-without-values"></Host>;
    }
    return (
      <Host class="atomic-with-values">
        <div class="flex justify-between">
          <ul class="flex flex-col">
            {this.facetBreadcrumbs}
            {this.numericFacetBreadcrumbs}
            {this.dateFacetBreadcrumbs}
            {this.categoryFacetBreadcrumbs}
          </ul>
          {this.getClearAllFiltersButton()}
        </div>
      </Host>
    );
  }
}

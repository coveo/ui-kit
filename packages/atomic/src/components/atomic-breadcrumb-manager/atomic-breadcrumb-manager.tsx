import {Component, h, State, Prop, VNode} from '@stencil/core';
import {
  Bindings,
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
  BindStateToI18n,
  I18nState,
} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  buildBreadcrumbManager,
  CategoryFacetBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
} from '@coveo/headless';
import {RangeFacetValue} from '@coveo/headless/dist/features/facets/range-facets/generic/interfaces/range-facet';
import {BaseFacetValue} from '@coveo/headless/dist/features/facets/facet-api/response';
import mainclear from '../../images/main-clear.svg';
import dayjs from 'dayjs';

/**
 * A component that creates breadcrumbs that display the currently active facet values
 *
 * @part breadcrumb-clear-all - The clear all breadcrumbs button
 * @part breadcrumb-label - Label for the breadcrumb's title
 * @part breadcrumb - An individual breadcrumb
 */

@Component({
  tag: 'atomic-breadcrumb-manager',
  styleUrl: 'atomic-breadcrumb-manager.pcss',
  shadow: true,
})
export class AtomicBreadcrumbManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @State() private collapsedBreadcrumbsState: string[] = [];
  @State() public error!: Error;

  /**
   * Number of breadcrumbs to be shown before collapsing.
   */
  @Prop() public collapseThreshold = 5;
  /**
   * Character that divides each path segment in a category facet breadcrumb
   */
  @Prop() public categoryDivider = '/';

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    breadcrumb: (variables) =>
      this.bindings.i18n.t('removeFilterOn', variables),
    clearAllFilters: () => this.bindings.i18n.t('clearAllFilters'),
    nMore: (variables) => this.bindings.i18n.t('nMore', variables),
    to: (variables) => this.bindings.i18n.t('to', variables),
  };

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private getFormat(id: string) {
    return this.bindings.store.state.facets[id].formatting;
  }

  private getBreadcrumbValue(
    value: string,
    breadcrumbValue: BreadcrumbValue<BaseFacetValue> | CategoryFacetBreadcrumb
  ) {
    return (
      <button
        part="breadcrumb"
        class="flex items-baseline"
        aria-label={this.strings.breadcrumb({value})}
        title={value}
        onClick={() =>
          this.breadcrumbManager.deselectBreadcrumb(breadcrumbValue)
        }
      >
        <span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
          {value}
        </span>
        <div
          role="button"
          class="breadcrumb-clear w-2.5 ml-1.5 flex-shrink-0"
          innerHTML={mainclear}
        />
      </button>
    );
  }

  private getBreadcrumbWrapper(
    facetId: string,
    field: string,
    children: VNode[]
  ) {
    const label = this.bindings.store.state.facets[facetId].label || field;
    return (
      <li class="mb-1 flex">
        <span
          title={label}
          class="breadcrumb-label text-on-background mr-2"
          part="breadcrumb-label"
        >
          {label}:
        </span>
        {children}
      </li>
    );
  }

  private getBreadcrumbValueWrapper(children: VNode[]) {
    return (
      <li class="mr-3 text-on-background-variant hover:text-primary-variant">
        {children}
      </li>
    );
  }

  private getBreadcrumbValues(
    breadcrumb: Breadcrumb<BaseFacetValue & {value: string}>
  ) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      breadcrumb
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) =>
      this.getBreadcrumbValueWrapper(
        this.getBreadcrumbValue(breadcrumbValue.value.value, breadcrumbValue)
      )
    );

    return this.getBreadcrumbWrapper(
      breadcrumb.facetId,
      breadcrumb.field,
      <ul class="flex flex-wrap">{[...renderedBreadcrumbs, moreButton]}</ul>
    );
  }

  private get facetBreadcrumbs() {
    return this.breadcrumbManagerState.facetBreadcrumbs.map((breadcrumb) => {
      return this.getBreadcrumbValues(breadcrumb);
    });
  }

  private formatRangeBreadcrumb(
    breadcrumb: Breadcrumb<RangeFacetValue>,
    formatValue: (value: RangeFacetValue) => string
  ): Breadcrumb<BaseFacetValue & {value: string}> {
    return {
      ...breadcrumb,
      values: breadcrumb.values.map((value) => ({
        deselect: value.deselect,
        value: {
          ...value.value,
          value: formatValue(value.value),
        },
      })),
    };
  }

  private get numericFacetBreadcrumbs() {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs.map(
      (breadcrumb) =>
        this.getBreadcrumbValues(
          this.formatRangeBreadcrumb(breadcrumb, (value) => {
            const {language} = this.bindings.i18n;
            const start = value.start.toLocaleString(language);
            const end = value.end.toLocaleString(language);
            return this.strings.to({start, end});
          })
        )
    );
  }

  private get dateFacetBreadcrumbs() {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs.map(
      (breadcrumb) => {
        const dateFormat = this.getFormat(breadcrumb.facetId);
        return this.getBreadcrumbValues(
          this.formatRangeBreadcrumb(breadcrumb, (value) => {
            const start = dayjs(value.start).format(dateFormat);
            const end = dayjs(value.end).format(dateFormat);
            return this.strings.to({start, end});
          })
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
    const breadcrumbsToShow = this.categoryCollapsedBreadcrumbsHandler(
      breadcrumb
    );
    const joinedBreadcrumbs = breadcrumbsToShow.join(
      ` ${this.categoryDivider} `
    );
    return this.getBreadcrumbValue(joinedBreadcrumbs, breadcrumb);
  }

  private get categoryFacetBreadcrumbs() {
    return this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
      (breadcrumb) => {
        const breadcrumbsValue = this.getCategoryBreadrumbValue(breadcrumb);
        return this.getBreadcrumbWrapper(
          breadcrumb.facetId,
          breadcrumb.field,
          breadcrumbsValue
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
    this.collapsedBreadcrumbsState.push(field);
    this.collapsedBreadcrumbsState = [...this.collapsedBreadcrumbsState];
  }

  private collapsedBreadcrumbsHandler<T extends BaseFacetValue>(
    breadcrumb: Breadcrumb<T>
  ): {breadcrumbsToShow: BreadcrumbValue<T>[]; moreButton: string | undefined} {
    if (this.collapsedBreadcrumbsState.indexOf(breadcrumb.field) !== -1) {
      const breadcrumbsToShow = breadcrumb.values;
      this.resetCollapsedBreadcrumbs(
        breadcrumbsToShow.length,
        breadcrumb.field
      );
      return {breadcrumbsToShow, moreButton: undefined};
    }

    return {
      breadcrumbsToShow: breadcrumb.values.slice(0, this.collapseThreshold),
      moreButton: this.getMoreButton(
        breadcrumb.values.length - this.collapseThreshold,
        breadcrumb.field
      ),
    };
  }

  private getMoreButton(collapsedBreadcrumbNumber: number, field: string) {
    if (collapsedBreadcrumbNumber < 1) {
      return;
    }

    return this.getBreadcrumbValueWrapper(
      <button
        part="breadcrumb"
        // TODO: localize
        aria-label={`Show ${collapsedBreadcrumbNumber} more ${
          collapsedBreadcrumbNumber > 1 ? 'filters' : 'filter'
        }`}
        onClick={() => this.showFacetCollapsedBreadcrumbs(field)}
      >
        {this.strings.nMore({value: collapsedBreadcrumbNumber})}
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
      return;
    }
    return (
      <div class="flex justify-between text-sm">
        <ul class="flex flex-col">
          {this.facetBreadcrumbs}
          {this.numericFacetBreadcrumbs}
          {this.dateFacetBreadcrumbs}
          {this.categoryFacetBreadcrumbs}
        </ul>
        {this.getClearAllFiltersButton()}
      </div>
    );
  }
}

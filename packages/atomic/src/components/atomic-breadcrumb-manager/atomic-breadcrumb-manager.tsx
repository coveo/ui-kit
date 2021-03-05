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

/**
 * A component that creates breadcrumbs that display the currently active facet values
 *
 * @part breadcrumbs - Container for all types of breadcrumbs
 * @part breadcrumb-clear-all - The clear all breadcrumbs button
 * @part breadcrumb - An individual breadcrumb
 * @part breadcrumb-button - Button element for all types of breadcrumb values
 * @part breadcrumb-wrapper = The wrapper for a single breadcrumb value
 * @part breadcrumb-clear - The clear button for a single breadcrumb value
 * @part breadcrumb-value-label - The label for a single breadcrumb value
 * @part breadcrumb-label - Label for the breadcrumb's title
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
  };

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private getBreadcrumbValue(
    value: string,
    breadcrumbValue: BreadcrumbValue<BaseFacetValue> | CategoryFacetBreadcrumb
  ) {
    return (
      <button
        part="breadcrumb-button"
        class="text-on-background-variant breadcrumb-button flex items-center hover:underline"
        aria-label={this.strings.breadcrumb({value})}
        onClick={() =>
          this.breadcrumbManager.deselectBreadcrumb(breadcrumbValue)
        }
      >
        <span
          part="breadcrumb-value-label"
          class="whitespace-nowrap overflow-ellipsis overflow-hidden"
        >
          {value}
        </span>
        <div
          part="breadcrumb-clear"
          role="button"
          class="breadcrumb-clear ml-1.5"
          innerHTML={mainclear}
        />
      </button>
    );
  }

  private getBreadcrumbWrapper(
    facetId: string,
    field: string,
    children: any
  ) {
    return (
      <div class="flex items-center text-sm" part="breadcrumb-wrapper">
        <span class="text-on-background" part="breadcrumb-label">
          {this.bindings.store.state.facetLabels[facetId] || field}:&nbsp;
        </span>
        {children}
      </div>
    );
  }

  private getBreadcrumbValues(
    breadcrumb: Breadcrumb<BaseFacetValue & {value: string}>
  ) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      breadcrumb
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li class="breadcrumb" part="breadcrumb">
        {this.getBreadcrumbValue(breadcrumbValue.value.value, breadcrumbValue)}
      </li>
    ));

    return this.getBreadcrumbWrapper(
      breadcrumb.facetId,
      breadcrumb.field,
      <ul class="flex space-x-2.5">
        {moreButton
          ? [...renderedBreadcrumbs, moreButton]
          : renderedBreadcrumbs}
      </ul>
    );
  }

  private get facetBreadcrumbs() {
    return this.breadcrumbManagerState.facetBreadcrumbs.map((breadcrumb) => {
      return this.getBreadcrumbValues(breadcrumb);
    });
  }

  private formatRangeBreadcrumb(
    breadcrumb: Breadcrumb<RangeFacetValue>
  ): Breadcrumb<BaseFacetValue & {value: string}> {
    return {
      ...breadcrumb,
      values: breadcrumb.values.map((value) => ({
        deselect: value.deselect,
        value: {
          ...value.value,
          value: `${value.value.start} - ${value.value.end}`,
        },
      })),
    };
  }

  private get numericFacetBreadcrumbs() {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs.map(
      (breadcrumb) =>
        this.getBreadcrumbValues(this.formatRangeBreadcrumb(breadcrumb))
    );
  }

  private get dateFacetBreadcrumbs() {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs.map((breadcrumb) =>
      this.getBreadcrumbValues(this.formatRangeBreadcrumb(breadcrumb))
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
        onClick={() => this.breadcrumbManager.deselectAll()}
      >
        Clear All Filters
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
    if (collapsedBreadcrumbNumber <= 0) return undefined;
    return (
      <li class="text-primary-variant" part="breadcrumb-value">
        <button
          part="breadcrumb-button"
          class="flex"
          aria-label={`Show ${collapsedBreadcrumbNumber} more ${
            collapsedBreadcrumbNumber > 1 ? 'filters' : 'filter'
          }`}
          onClick={() => this.showFacetCollapsedBreadcrumbs(field)}
        >
          {collapsedBreadcrumbNumber} more...
        </button>
      </li>
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
      <div class="flex">
        <span part="breadcrumbs">
          {this.facetBreadcrumbs}
          {this.numericFacetBreadcrumbs}
          {this.dateFacetBreadcrumbs}
          {this.categoryFacetBreadcrumbs}
        </span>
        <span class="text-primary text-sm ml-auto">
          {this.getClearAllFiltersButton()}
        </span>
      </div>
    );
  }
}

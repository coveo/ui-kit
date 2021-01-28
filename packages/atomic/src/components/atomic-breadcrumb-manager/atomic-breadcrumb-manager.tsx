import {Component, h, State, Prop} from '@stencil/core';
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
  FacetValue,
  Breadcrumb,
  BreadcrumbValue,
} from '@coveo/headless';
import {RangeFacetValue} from '@coveo/headless/dist/features/facets/range-facets/generic/interfaces/range-facet';
import {BaseFacetValue} from '@coveo/headless/dist/features/facets/facet-api/response';
import mainclear from '../../images/main-clear.svg';

/**
 * @part breadcrumbs - Container for all types of breadcrumbs
 * @part breadcrumb-label - Label for the breadcrumb's title
 * @part breadcrumb-value - Breadcrumb list element for all types of breadcrumbs
 * @part category-breadcrumb-value - Breadcrumb list element for category breadcrumbs
 * @part breadcrumb-button - Button element for all types of breadcrumb
 */

@Component({
  tag: 'atomic-breadcrumb-manager',
  styleUrl: 'atomic-breadcrumb-manager.css',
  shadow: true,
})
export class AtomicBreadcrumbManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @State() private collapsedBreadcrumbsState: string[] = [];

  @Prop() public collapseThreshold = 5;
  @Prop() public categoryDivider = '/';

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private get facetBreadcrumbs() {
    return this.breadcrumbManagerState.facetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getBreadrumbValues(breadcrumb);
      return (
        <ul part="breadcrumbs">
          <li part="breadcrumb-label">{breadcrumb.field}:&nbsp;</li>
          {breadcrumbsValues}
        </ul>
      );
    });
  }

  private getBreadrumbValues(breadcrumb: Breadcrumb<FacetValue>) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      breadcrumb
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li part="breadcrumb-value">
        <button
          part="breadcrumb-button"
          aria-label={`Remove inclusion filter on ${breadcrumbValue.value.value}`}
          onClick={() =>
            this.breadcrumbManager.deselectBreadcrumb(breadcrumbValue)
          }
        >
          {breadcrumbValue.value.value}
          {this.mainClear}
        </button>
      </li>
    ));

    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private get numericFacetBreadcrumbs() {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs.map(
      (breadcrumb) => {
        const breadcrumbsValues = this.getRangeBreadrumbValues(
          breadcrumb,
          false
        );
        return (
          <ul part="breadcrumbs">
            <li part="breadcrumb-label">{breadcrumb.field}:&nbsp;</li>
            {breadcrumbsValues}
          </ul>
        );
      }
    );
  }

  private get dateFacetBreadcrumbs() {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs.map(
      (breadcrumb) => {
        const breadcrumbsValues = this.getRangeBreadrumbValues(
          breadcrumb,
          true
        );
        return (
          <ul part="breadcrumbs">
            <li part="breadcrumb-label">{breadcrumb.field}:&nbsp;</li>
            {breadcrumbsValues}
          </ul>
        );
      }
    );
  }

  private getRangeBreadrumbValues(
    values: Breadcrumb<RangeFacetValue>,
    needDateFormatting: boolean
  ) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      values
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => {
      const ariaLabel = this.getRangeAriaLabel(
        needDateFormatting,
        breadcrumbValue.value
      );
      return (
        <li part="breadcrumb-value">
          <button
            part="breadcrumb-button"
            aria-label={ariaLabel}
            onClick={() =>
              this.breadcrumbManager.deselectBreadcrumb(breadcrumbValue)
            }
          >
            {breadcrumbValue.value.start} - {breadcrumbValue.value.end}
            {this.mainClear}
          </button>
        </li>
      );
    });
    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private get categoryFacetBreadcrumbs() {
    return this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
      (breadcrumb) => {
        const breadcrumbsValues = this.getCategoryBreadrumbValues(breadcrumb);
        return (
          <ul part="breadcrumbs">
            <li part="breadcrumb-label">{breadcrumb.field}:&nbsp;</li>
            {breadcrumbsValues}
          </ul>
        );
      }
    );
  }

  private getCategoryBreadrumbValues(values: CategoryFacetBreadcrumb) {
    const breadcrumbsToShow = this.categoryCollapsedBreadcrumbsHandler(values);
    const ariaLabel = breadcrumbsToShow.join('/');
    const joinedBreadcrumbs = breadcrumbsToShow.join(
      ` ${this.categoryDivider} `
    );
    return (
      <li part="breadcrumb-value category-breadcrumb-value">
        <button
          part="breadcrumb-button"
          aria-label={`Remove inclusion filter on ${ariaLabel}`}
          onClick={() => this.breadcrumbManager.deselectBreadcrumb(values)}
        >
          {joinedBreadcrumbs}
          {this.mainClear}
        </button>
      </li>
    );
  }

  private getClearAllFiltersButton() {
    return (
      <button
        part="breadcrumb-button"
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

  private getMoreButton(collapsedBreadcrumbNumber: number, field: string) {
    if (collapsedBreadcrumbNumber <= 0) return undefined;
    return (
      <li part="breadcrumb-value">
        <button
          part="breadcrumb-button"
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

  private get mainClear() {
    return <span role="button" innerHTML={mainclear}></span>;
  }

  private resetCollapsedBreadcrumbs(length: number, field: string) {
    length <= this.collapseThreshold
      ? this.collapsedBreadcrumbsState.splice(
          this.collapsedBreadcrumbsState.indexOf(field),
          1
        )
      : null;
  }
  private getRangeAriaLabel(
    needDateFormatting: boolean,
    breadcrumbValue: RangeFacetValue
  ) {
    if (needDateFormatting) {
      const dateStart = new Date(breadcrumbValue.start);
      const dateEnd = new Date(breadcrumbValue.end);
      return `Remove inclusion filter on ${dateStart.toLocaleString()} to ${dateEnd.toLocaleString()}`;
    }
    return `Remove inclusion filter on ${breadcrumbValue.start} to ${breadcrumbValue.end}`;
  }

  public render() {
    if (!this.breadcrumbManager.state.hasBreadcrumbs) {
      return;
    }
    return (
      <div>
        <span>
          {this.facetBreadcrumbs}
          {this.numericFacetBreadcrumbs}
          {this.dateFacetBreadcrumbs}
          {this.categoryFacetBreadcrumbs}
        </span>
        <span>{this.getClearAllFiltersButton()}</span>
      </div>
    );
  }
}

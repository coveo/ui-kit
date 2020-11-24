import {Component, h, State, Prop} from '@stencil/core';
import {Initialization} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  Engine,
  Unsubscribe,
  buildBreadcrumbManager,
  CategoryFacetBreadcrumb,
  CategoryFacetValue,
  FacetValue,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
  DateFacetBreadcrumb,
  Breadcrumb,
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
  styleUrl: 'atomic-breadcrumb-manager.scss',
  shadow: true,
})
export class AtomicBreadcrumbManager {
  @State() state!: BreadcrumbManagerState;
  @State() collapsedBreadcrumbsState: Record<string, boolean> = {};
  @Prop() collapseThreshold = 5;
  @Prop() categoryFacetDivider = '/';

  private engine!: Engine;
  private breadcrumbManager!: BreadcrumbManager;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.engine);
    this.subscribe();
  }

  componentDidLoad() {
    this.initializeCollapseBreadcrumbMap();
  }

  private subscribe() {
    this.unsubscribe = this.breadcrumbManager.subscribe(() =>
      this.updateState()
    );
  }

  private updateState() {
    this.state = this.breadcrumbManager.state;
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private initializeCollapseBreadcrumbMap() {
    this.breadcrumbManager.state.facetBreadcrumbs.forEach(
      (facet: FacetBreadcrumb) => {
        this.collapsedBreadcrumbsState[facet.field] = false;
      }
    );
    this.breadcrumbManager.state.numericFacetBreadcrumbs.forEach(
      (facet: NumericFacetBreadcrumb) => {
        this.collapsedBreadcrumbsState[facet.field] = false;
      }
    );
    this.breadcrumbManager.state.dateFacetBreadcrumbs.forEach(
      (facet: DateFacetBreadcrumb) => {
        this.collapsedBreadcrumbsState[facet.field] = false;
      }
    );
    this.breadcrumbManager.state.categoryFacetBreadcrumbs.forEach(
      (facet: CategoryFacetBreadcrumb) => {
        this.collapsedBreadcrumbsState[facet.field] = false;
      }
    );
  }

  private get facetBreadcrumbs() {
    const breadcrumbs = this.state.facetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
          <li part="breadcrumb-label" class="text-muted">
            {breadcrumb.field}:&nbsp;
          </li>
          {breadcrumbsValues}
        </ul>
      ) : (
        ''
      );
    });
    return breadcrumbs;
  }

  private getBreadrumbValues(breadcrumb: Breadcrumb<FacetValue>) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      breadcrumb
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li part="breadcrumb-value" class="breadcrumb-item pr-1">
        <button
          part="breadcrumb-button"
          class="btn btn-link btn-sm text-decoration-none p-0 m-0"
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.value}
          <span class="pl-1" innerHTML={mainclear}></span>
        </button>
      </li>
    ));

    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private get numericFacetBreadcrumbs() {
    const breadcrumbs = this.state.numericFacetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getRangeBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
          <li part="breadcrumb-label" class="text-muted">
            {breadcrumb.field}:&nbsp;
          </li>
          {breadcrumbsValues}
        </ul>
      ) : (
        ''
      );
    });
    return breadcrumbs;
  }

  private get dateFacetBreadcrumbs() {
    const breadcrumbs = this.state.dateFacetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getRangeBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
          <li part="breadcrumb-label" class="text-muted align-text-top">
            {breadcrumb.field}:&nbsp;
          </li>
          {breadcrumbsValues}
        </ul>
      ) : (
        ''
      );
    });
    return breadcrumbs;
  }

  private getRangeBreadrumbValues(values: Breadcrumb<RangeFacetValue>) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      values
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li part="breadcrumb-value" class="breadcrumb-item pr-1">
        <button
          part="breadcrumb-button"
          class="btn btn-link btn-sm text-decoration-none p-0 m-0"
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.start} - {breadcrumbValue.value.end}
          <span class="pl-1" innerHTML={mainclear}></span>
        </button>
      </li>
    ));
    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private get categoryFacetBreadcrumbs() {
    const breadcrumbs = this.state.categoryFacetBreadcrumbs.map(
      (breadcrumb) => {
        const breadcrumbsValues = this.getCategoryBreadrumbValues(breadcrumb);
        const renderedBreadcrumbs = this.state.categoryFacetBreadcrumbs.every(
          (value: CategoryFacetBreadcrumb) => value.path.length > 0
        );
        return renderedBreadcrumbs ? (
          <ul part="breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
            <li part="breadcrumb-label" class="text-muted">
              {breadcrumb.field}:&nbsp;
            </li>
            {breadcrumbsValues}
          </ul>
        ) : (
          ''
        );
      }
    );
    return breadcrumbs;
  }

  private getCategoryBreadrumbValues(values: CategoryFacetBreadcrumb) {
    const pathString = values.path
      .map((value: CategoryFacetValue) => value.value)
      .join(this.categoryFacetDivider);
    return (
      <li
        part="breadcrumb-value category-breadcrumb-value"
        class="breadcrumb-item align-bottom"
      >
        <button
          part="breadcrumb-button"
          class="btn btn-link btn-sm text-decoration-none p-0 m-0"
          onClick={values.deselect}
        >
          {pathString}
        </button>
      </li>
    );
  }

  render() {
    if (this.hasActiveBreadcrumbs()) {
      return (
        <div class="container row">
          <span class=" col-9">
            {this.facetBreadcrumbs}
            {this.numericFacetBreadcrumbs}
            {this.dateFacetBreadcrumbs}
            {this.categoryFacetBreadcrumbs}
          </span>
          <span class="col-3 text-right">
            {this.getClearAllFiltersButton()}
          </span>
        </div>
      );
    }
  }

  private getClearAllFiltersButton() {
    return (
      <button
        part="breadcrumb-button"
        class="btn btn-link btn-sm text-decoration-none  p-0 m-0"
        // onClick={() => this.breadcrumbManager.deselectAll()} TODO
      >
        Clear All Filters
      </button>
    );
  }

  private showFacetCollapsedBreadcrumbs(field: string) {
    this.collapsedBreadcrumbsState = {
      ...this.collapsedBreadcrumbsState,
      [field]: true,
    };
  }

  private collapsedBreadcrumbsHandler<T extends BaseFacetValue>(
    breadcrumb: Breadcrumb<T>
  ) {
    let breadcrumbsToShow = [];
    let moreButton = undefined;

    if (this.collapsedBreadcrumbsState[breadcrumb.field]) {
      breadcrumbsToShow = breadcrumb.values;
      breadcrumbsToShow.length <= this.collapseThreshold
        ? (this.collapsedBreadcrumbsState[breadcrumb.field] = false)
        : null;
    } else {
      breadcrumbsToShow = breadcrumb.values.slice(0, this.collapseThreshold);
      const collapsedBreadcrumbNumber =
        breadcrumb.values.length - this.collapseThreshold;

      if (collapsedBreadcrumbNumber > 0) {
        moreButton = (
          <li part="breadcrumb-value" class="breadcrumb-item vertical-bar">
            <button
              part="breadcrumb-button"
              class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
              onClick={() =>
                this.showFacetCollapsedBreadcrumbs(breadcrumb.field)
              }
            >
              {collapsedBreadcrumbNumber} more...
            </button>
          </li>
        );
      }
    }
    return {breadcrumbsToShow, moreButton};
  }

  private hasActiveBreadcrumbs() {
    return !this.isEmpty([
      ...this.state.facetBreadcrumbs.filter(
        (breadcrumb) => !this.isEmpty(breadcrumb.values)
      ),
      ...this.state.numericFacetBreadcrumbs.filter(
        (breadcrumb) => !this.isEmpty(breadcrumb.values)
      ),
      ...this.state.dateFacetBreadcrumbs.filter(
        (breadcrumb) => !this.isEmpty(breadcrumb.values)
      ),
      ...this.state.categoryFacetBreadcrumbs.filter(
        (breadcrumb) => !this.isEmpty(breadcrumb.path)
      ),
    ]);
  }

  private isEmpty(array: any[]) {
    return array.length === 0;
  }
}

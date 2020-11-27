import {Component, h, State, Prop} from '@stencil/core';
import {Initialization} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  Engine,
  Unsubscribe,
  buildBreadcrumbManager,
  CategoryFacetBreadcrumb,
  FacetValue,
  Breadcrumb,
  BreadcrumbField,
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

  private engine!: Engine;
  private breadcrumbManager!: BreadcrumbManager;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.engine);
    this.subscribe();
  }

  componentDidLoad() {
    this.initCollapsedBreadcrumbsState();
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

  private initCollapsedBreadcrumbsState() {
    Object.values(this.state).forEach((facet) => {
      facet.forEach((facetValue: BreadcrumbField) => {
        this.collapsedBreadcrumbsState[facetValue.field] = true;
      });
    });
  }

  private get facetBreadcrumbs() {
    const breadcrumbs = this.state.facetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0">
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
      <li part="breadcrumb-value" class="pr-3">
        <button
          part="breadcrumb-button"
          class={this.buttonClasses}
          onClick={breadcrumbValue.deselect}
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
    const breadcrumbs = this.state.numericFacetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getRangeBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0">
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
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0">
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

  private getRangeBreadrumbValues(values: Breadcrumb<RangeFacetValue>) {
    const {breadcrumbsToShow, moreButton} = this.collapsedBreadcrumbsHandler(
      values
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li part="breadcrumb-value" class="pr-3">
        <button
          part="breadcrumb-button"
          class={this.buttonClasses}
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.start} - {breadcrumbValue.value.end}
          {this.mainClear}
        </button>
      </li>
    ));
    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private get categoryFacetBreadcrumbs() {
    return this.state.categoryFacetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getCategoryBreadrumbValues(breadcrumb);
      const renderedBreadcrumbs = this.state.categoryFacetBreadcrumbs.every(
        (value: CategoryFacetBreadcrumb) => value.path.length > 0
      );
      return renderedBreadcrumbs ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0">
          <li part="breadcrumb-label" class="text-muted">
            {breadcrumb.field}:&nbsp;
          </li>
          {breadcrumbsValues}
        </ul>
      ) : (
        ''
      );
    });
  }

  private getCategoryBreadrumbValues(values: CategoryFacetBreadcrumb) {
    const breadcrumbsToShow = this.categoryCollapsedBreadcrumbsHandler(values);
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li
        part="breadcrumb-value category-breadcrumb-value"
        class="breadcrumb-item"
      >
        <button
          part="breadcrumb-button"
          class={this.buttonClasses}
          onClick={values.deselect}
        >
          {breadcrumbValue}
        </button>
      </li>
    ));
    return [...renderedBreadcrumbs, this.mainClear];
  }

  private getClearAllFiltersButton() {
    return (
      <button
        part="breadcrumb-button"
        class={this.buttonClasses}
        onClick={() => {}} //TODO https://coveord.atlassian.net/browse/KIT-269
      >
        Clear All Filters
      </button>
    );
  }

  private showFacetCollapsedBreadcrumbs(field: string) {
    this.collapsedBreadcrumbsState = {
      ...this.collapsedBreadcrumbsState,
      [field]: false,
    };
  }

  private collapsedBreadcrumbsHandler<T extends BaseFacetValue>(
    breadcrumb: Breadcrumb<T>
  ) {
    let breadcrumbsToShow = [];
    let moreButton = undefined;

    if (!this.collapsedBreadcrumbsState[breadcrumb.field]) {
      breadcrumbsToShow = breadcrumb.values;
      breadcrumbsToShow.length <= this.collapseThreshold
        ? (this.collapsedBreadcrumbsState[breadcrumb.field] = true)
        : null;
    } else {
      breadcrumbsToShow = breadcrumb.values.slice(0, this.collapseThreshold);
      const collapsedBreadcrumbNumber =
        breadcrumb.values.length - this.collapseThreshold;

      if (collapsedBreadcrumbNumber > 0) {
        moreButton = (
          <li part="breadcrumb-value">
            <button
              part="breadcrumb-button"
              class={this.buttonClasses}
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

  private isEmpty(array: any[]) {
    return array.length === 0;
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

  private get mainClear() {
    return (
      <span
        class="pl-1 text-primary align-baseline"
        innerHTML={mainclear}
      ></span>
    );
  }

  private get buttonClasses() {
    return 'btn btn-link btn-sm text-decoration-none p-0  align-baseline ';
  }

  render() {
    if (!this.breadcrumbManager.hasBreadcrumbs()) {
      return;
    }
    return (
      <div class="row">
        <span class=" col-9">
          {this.facetBreadcrumbs}
          {this.numericFacetBreadcrumbs}
          {this.dateFacetBreadcrumbs}
          {this.categoryFacetBreadcrumbs}
        </span>
        <span class="col-3 text-right">{this.getClearAllFiltersButton()}</span>
      </div>
    );
  }
}

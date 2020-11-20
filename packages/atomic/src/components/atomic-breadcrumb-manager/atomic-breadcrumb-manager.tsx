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
  @State() collapseBreadcrumbMap: Record<string, boolean> = {};
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
        this.collapseBreadcrumbMap[facet.field] = false;
      }
    );
    this.breadcrumbManager.state.numericFacetBreadcrumbs.forEach(
      (facet: NumericFacetBreadcrumb) => {
        this.collapseBreadcrumbMap[facet.field] = false;
      }
    );
    this.breadcrumbManager.state.dateFacetBreadcrumbs.forEach(
      (facet: DateFacetBreadcrumb) => {
        this.collapseBreadcrumbMap[facet.field] = false;
      }
    );
    this.breadcrumbManager.state.categoryFacetBreadcrumbs.forEach(
      (facet: CategoryFacetBreadcrumb) => {
        this.collapseBreadcrumbMap[facet.field] = false;
      }
    );
  }

  private get facetBreadcrumbs() {
    const breadcrumbs = this.state.facetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
          <li part="breadcrumb-label" class="text-muted">
            {breadcrumb.field}:&nbsp;{' '}
          </li>
          {breadcrumbsValues}
        </ul>
      ) : (
        ''
      );
    });
    return breadcrumbs;
  }

  private get numericFacetBreadcrumbs() {
    const breadcrumbs = this.state.numericFacetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getRangeBreadrumbValues(breadcrumb);
      return !this.isEmpty(breadcrumbsValues) ? (
        <ul part="breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
          <li part="breadcrumb-label" class="text-muted">
            {breadcrumb.field}:&nbsp;{' '}
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
          <li part="breadcrumb-label" class="text-muted">
            {breadcrumb.field}:&nbsp;{' '}
          </li>
          {breadcrumbsValues}
        </ul>
      ) : (
        ''
      );
    });
    return breadcrumbs;
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
              {breadcrumb.field}:&nbsp;{' '}
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

  render() {
    return [
      this.facetBreadcrumbs,
      this.numericFacetBreadcrumbs,
      this.dateFacetBreadcrumbs,
      this.categoryFacetBreadcrumbs,
    ];
  }

  private getBreadrumbValues(breadcrumb: Breadcrumb<FacetValue>) {
    const {breadcrumbsToShow, moreButton} = this.manageCollapsedBreadcrumb(
      breadcrumb
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li part="breadcrumb-value" class="breadcrumb-item vertical-bar">
        <button
          part="breadcrumb-button"
          class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.value}
        </button>
      </li>
    ));

    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private getRangeBreadrumbValues(values: Breadcrumb<RangeFacetValue>) {
    const {breadcrumbsToShow, moreButton} = this.manageCollapsedBreadcrumb(
      values
    );
    const renderedBreadcrumbs = breadcrumbsToShow.map((breadcrumbValue) => (
      <li part="breadcrumb-value" class="breadcrumb-item vertical-bar">
        <button
          part="breadcrumb-button"
          class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.start} - {breadcrumbValue.value.end}
        </button>
      </li>
    ));
    return moreButton
      ? [...renderedBreadcrumbs, moreButton]
      : renderedBreadcrumbs;
  }

  private getCategoryBreadrumbValues(values: CategoryFacetBreadcrumb) {
    const pathString = values.path
      .map((value: CategoryFacetValue) => value.value)
      .join('/');
    return (
      <li
        part="breadcrumb-value category-breadcrumb-value"
        class="breadcrumb-item"
      >
        <button
          part="breadcrumb-button"
          class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
          onClick={values.deselect}
        >
          {pathString}
        </button>
      </li>
    );
  }

  private updateCollapsePreferences(field: string) {
    this.collapseBreadcrumbMap[field] = true;
  }

  private isEmpty(array: any[]) {
    return array.length === 0;
  }

  private manageCollapsedBreadcrumb<T extends BaseFacetValue>(
    breadcrumb: Breadcrumb<T>
  ) {
    let breadcrumbsToShow = [];
    let moreButton = undefined;

    if (this.collapseBreadcrumbMap[breadcrumb.field]) {
      breadcrumbsToShow = breadcrumb.values;
      breadcrumbsToShow.length <= this.collapseThreshold
        ? (this.collapseBreadcrumbMap[breadcrumb.field] = false)
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
              onClick={() => this.updateCollapsePreferences(breadcrumb.field)}
            >
              {collapsedBreadcrumbNumber} more...
            </button>
          </li>
        );
      }
    }
    return {breadcrumbsToShow, moreButton};
  }
}

import {Component, h, State} from '@stencil/core';
import {Initialization} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  Engine,
  Unsubscribe,
  buildBreadcrumbManager,
  CategoryFacetBreadcrumb,
  CategoryFacetValue,
  BreadcrumbValue,
  FacetValue,
  NumericFacetValue,
  DateFacetValue,
} from '@coveo/headless';
import {RangeFacetValue} from '@coveo/headless/dist/features/facets/range-facets/generic/interfaces/range-facet';

/**
 * @part container - The contianer for all breadcrumbs
 * @part facet-breadcrumb - The container for facet breadcrumbs
 * @part numeric-breadcrumbs - The container for numeric breadcrumbs
 * @part date-breadcrumbs - The container for date breadcrumbs
 * @part category-breadcrumbs - The container for category breadcrumbs
 */

@Component({
  tag: 'atomic-breadcrumb-manager',
  styleUrl: 'atomic-breadcrumb-manager.scss',
  shadow: true,
})
export class AtomicBreadcrumbManager {
  @State() state!: BreadcrumbManagerState;

  private engine!: Engine;
  private breadcrumbManager!: BreadcrumbManager;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.engine);
    this.subscribe();
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

  private get facetBreadcrumbs() {
    const breadcrumbs = this.state.facetBreadcrumbs.map((breadcrumb) => {
      const breadcrumbsValues = this.getBreadrumbValues(breadcrumb.values);
      return breadcrumbsValues.length > 0 ? (
        <ul class="breadcrumb p-0 m-0 bg-transparent">
          <li class="text-muted">{breadcrumb.field}:&nbsp; </li>
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
      const breadcrumbsValues = this.getRangeBreadrumbValues(breadcrumb.values);
      return breadcrumbsValues.length > 0 ? (
        <ul class="breadcrumb p-0 m-0 bg-transparent">
          <span class="text-muted">{breadcrumb.field}:&nbsp; </span>
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
      const breadcrumbsValues = this.getRangeBreadrumbValues(breadcrumb.values);
      return breadcrumbsValues.length > 0 ? (
        <ul class="breadcrumb p-0 m-0 bg-transparent">
          <li class="text-muted">{breadcrumb.field}:&nbsp; </li>
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
        const showBreadcrumbs = this.state.categoryFacetBreadcrumbs.every(
          (value: CategoryFacetBreadcrumb) => value.path.length > 0
        );
        return showBreadcrumbs ? (
          <ul class="breadcrumb p-0 m-0 bg-transparent">
            <li class="text-muted">{breadcrumb.field}:&nbsp; </li>
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

  private getBreadrumbValues(values: BreadcrumbValue<FacetValue>[]) {
    return values.map((breadcrumbValue) => (
      <li class="breadcrumb-item vertical-bar">
        <button
          class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.value}
        </button>
      </li>
    ));
  }

  private getRangeBreadrumbValues(values: BreadcrumbValue<RangeFacetValue>[]) {
    return values.map((breadcrumbValue) => (
      <li class="breadcrumb-item vertical-bar">
        <button
          class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
          onClick={breadcrumbValue.deselect}
        >
          {breadcrumbValue.value.start} - {breadcrumbValue.value.end}
        </button>
      </li>
    ));
  }

  private getCategoryBreadrumbValues(values: CategoryFacetBreadcrumb) {
    const pathString = values.path
      .map((value: CategoryFacetValue) => value.value)
      .join('/');
    return (
      <li class="breadcrumb-item">
        <button
          class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
          onClick={values.deselect}
        >
          {pathString}
        </button>
      </li>
    );
  }
}

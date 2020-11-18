import {Component, h, State} from '@stencil/core';
import {Initialization} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  Engine,
  Unsubscribe,
  buildBreadcrumbManager,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  CategoryFacetValue,
} from '@coveo/headless';

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
    const breadcrumbs = Object.keys(this.state.facetBreadcrumbs).map(
      (field) => {
        const fieldBreadcrumbs = this.state.facetBreadcrumbs[field].map(
          (breadcrumb: FacetBreadcrumb) => (
            <li class="breadcrumb-item vertical-bar">
              <button
                class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
                onClick={breadcrumb.deselect}
              >
                {breadcrumb.value.value}
              </button>
            </li>
          )
        );
        return (
          <ul part="facet-breadcrumb" class="breadcrumb p-0 m-0 bg-transparent">
            <li>{field} : &nbsp;</li>
            {fieldBreadcrumbs}
          </ul>
        );
      }
    );
    return breadcrumbs;
  }

  private get numericFacetBreadcrumbs() {
    const breadcrumbs = Object.keys(this.state.numericFacetBreadcrumbs).map(
      (field) => {
        const fieldBreadcrumbs = this.state.numericFacetBreadcrumbs[field].map(
          (breadcrumb: NumericFacetBreadcrumb) => (
            <li class="breadcrumb-item vertical-bar">
              <button
                class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
                onClick={breadcrumb.deselect}
              >
                {breadcrumb.value.start} - {breadcrumb.value.end}
              </button>
            </li>
          )
        );
        return (
          <ul
            part="numeric-breadcrumbs"
            class="breadcrumb p-0 m-0 bg-transparent"
          >
            <li>{field} : &nbsp;</li>
            {fieldBreadcrumbs}
          </ul>
        );
      }
    );
    return breadcrumbs;
  }

  private get dateFacetBreadcrumbs() {
    const breadcrumbs = Object.keys(this.state.dateFacetBreadcrumbs).map(
      (field) => {
        const fieldBreadcrumbs = this.state.dateFacetBreadcrumbs[field].map(
          (breadcrumb: DateFacetBreadcrumb) => (
            <li class="breadcrumb-item vertical-bar">
              <button
                class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
                onClick={breadcrumb.deselect}
              >
                {breadcrumb.value.start} - {breadcrumb.value.end}
              </button>
            </li>
          )
        );
        return (
          <ul part="date-breadcrumbs" class="breadcrumb p-0 m-0 bg-transparent">
            <li>{field} : &nbsp;</li>
            {fieldBreadcrumbs}
          </ul>
        );
      }
    );
    return breadcrumbs;
  }

  private get categoryFacetBreadcrumbs() {
    const breadcrums = Object.keys(this.state.categoryFacetBreadcrumbs).map(
      (field) => {
        const fieldBreadcrumbs = this.state.categoryFacetBreadcrumbs[field].map(
          (breadcrumb: CategoryFacetBreadcrumb) => {
            const pathString = breadcrumb.path
              .map((value: CategoryFacetValue) => value.value)
              .join('/');
            return (
              <li class="breadcrumb-item">
                <button
                  class="btn btn-link btn-sm text-decoration-none text-primary p-0 m-0"
                  onClick={breadcrumb.deselect}
                >
                  {pathString}
                </button>
              </li>
            );
          }
        );
        return (
          <ul
            part="category-breadcrumbs"
            class="breadcrumb p-0 m-0 bg-transparent"
          >
            <li>{field} : &nbsp;</li>
            {fieldBreadcrumbs}
          </ul>
        );
      }
    );

    return breadcrums;
  }

  render() {
    return (
      <nav aria-label="breadcrumb">
        <div part="container" class="p-0 m-0 bg-transparent">
          {this.facetBreadcrumbs}
          {this.numericFacetBreadcrumbs}
          {this.dateFacetBreadcrumbs}
          {this.categoryFacetBreadcrumbs}
        </div>
      </nav>
    );
  }
}

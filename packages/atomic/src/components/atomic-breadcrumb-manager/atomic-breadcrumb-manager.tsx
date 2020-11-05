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

@Component({
  tag: 'atomic-breadcrumb-manager',
  styleUrl: 'atomic-breadcrumb-manager.css',
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
    return this.state.facetBreadcrumbs.map((breadcrumb: FacetBreadcrumb) => (
      <button onClick={breadcrumb.deselect}>{breadcrumb.value.value}</button>
    ));
  }

  private get numericFacetBreadcrumbs() {
    return this.state.numericFacetBreadcrumbs.map(
      (breadcrumb: NumericFacetBreadcrumb) => (
        <button onClick={breadcrumb.deselect}>
          {breadcrumb.value.start} - {breadcrumb.value.end}
        </button>
      )
    );
  }

  private get dateFacetBreadcrumbs() {
    return this.state.dateFacetBreadcrumbs.map(
      (breadcrumb: DateFacetBreadcrumb) => (
        <button onClick={breadcrumb.deselect}>
          {breadcrumb.value.start} - {breadcrumb.value.end}
        </button>
      )
    );
  }

  private get categoryFacetBreadcrumbs() {
    return this.state.categoryFacetBreadcrumbs.map(
      (breadcrumb: CategoryFacetBreadcrumb) => {
        const pathString = breadcrumb.path
          .map((value: CategoryFacetValue) => value.value)
          .join('/');
        return <button onClick={breadcrumb.deselect}>{pathString}</button>;
      }
    );
  }

  render() {
    return (
      <div class="breadcrumb-manager">
        {this.facetBreadcrumbs}
        {this.numericFacetBreadcrumbs}
        {this.dateFacetBreadcrumbs}
        {this.categoryFacetBreadcrumbs}
      </div>
    );
  }
}

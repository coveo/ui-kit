import {Component, h, Element, State} from '@stencil/core';
import {
  FacetManager,
  buildFacetManager,
  FacetManagerState,
} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

interface FacetElement extends HTMLElement {
  facetId: string;
}

@Component({
  tag: 'atomic-facet-manager',
  styleUrl: 'atomic-facet-manager.css',
  shadow: true,
})
export class AtomicFacetManager implements AtomicComponentInterface {
  @State() controllerState!: FacetManagerState;
  @Element() host!: HTMLDivElement;
  public bindings!: Bindings;
  public controller!: FacetManager;

  @Initialization()
  public initialize() {
    this.controller = buildFacetManager(this.bindings.engine);
  }

  public onControllerStateUpdate() {
    this.sortFacets();
  }

  private sortFacets() {
    const payload = this.facets.map((f) => ({facetId: f.facetId, payload: f}));
    const sortedFacets = this.controller.sort(payload).map((f) => f.payload);

    this.host.append(...sortedFacets);
  }

  private get facets() {
    const facets: FacetElement[] = [];
    const children = Array.from(this.host.children);

    children.forEach((child) => {
      this.isPseudoFacet(child) && facets.push(child);
    });

    return facets;
  }

  private isPseudoFacet(el: Element): el is FacetElement {
    return 'facetId' in el;
  }

  public renderLoading() {
    return <slot />;
  }

  public render() {
    return <slot />;
  }
}

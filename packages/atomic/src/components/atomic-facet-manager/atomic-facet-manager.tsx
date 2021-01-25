import {Component, h, Element, State} from '@stencil/core';
import {
  FacetManager,
  buildFacetManager,
  FacetManagerState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

interface FacetElement extends HTMLElement {
  facetId: string;
}

@Component({
  tag: 'atomic-facet-manager',
  styleUrl: 'atomic-facet-manager.pcss',
  shadow: true,
})
export class AtomicFacetManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facetManager!: FacetManager;

  @Element() private host!: HTMLDivElement;

  @BindStateToController('facetManager', {
    onUpdateCallbackMethod: 'onFacetManagerUpdate',
  })
  @State()
  public facetManagerState!: FacetManagerState;

  public initialize() {
    this.facetManager = buildFacetManager(this.bindings.engine);
  }

  public onFacetManagerUpdate() {
    this.sortFacets();
  }

  private sortFacets() {
    const payload = this.facets.map((f) => ({facetId: f.facetId, payload: f}));
    const sortedFacets = this.facetManager.sort(payload).map((f) => f.payload);

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

  public render() {
    return <slot />;
  }
}
